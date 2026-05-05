import { getRepository, getConnection, EntityManager, In } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import sanitize from 'sanitize-filename';
import { Express } from 'express';
import { PlacementExecutive } from '../../entities/placement-executive/placement-executive.entity';
import { User } from '../../entities/user/user.entity';
import { File, EntityType, DocumentType } from '../../entities/file/file.entity';
import PlacementExecutiveRepository, { IPlacementExecutiveQueryParams } from '../../repositories/placement-executive.repository';
import ApiUtility from '../../utilities/api.utility';
import PasswordUtility from '../../utilities/password.utility';
import RoleService from '../role/role.service';
import { StringError } from '../../errors/string.error';
import ExcelUtility from '../../utilities/excel.utility';

/**
 * Upload photograph and create file record within transaction
 */
const uploadPhotograph = async (
  file: Express.Multer.File,
  executiveId: number,
  manager: EntityManager
): Promise<string> => {
  // Validate file type for images
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed for photographs.');
  }

  // Generate folder path
  const folderPath = path.join('uploads', 'placement_executives', executiveId.toString());

  // Ensure directory exists
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true, mode: 0o755 });
  }

  // Generate secure filename
  const ext = path.extname(file.originalname).toLowerCase();
  const timestamp = Date.now();
  const filename = `PHOTOGRAPH_${timestamp}${ext}`;
  const fullPath = path.join(folderPath, filename);

  // Move file from temp location
  fs.renameSync(file.path, fullPath);
  fs.chmodSync(fullPath, 0o644);

  // Create file record within the transaction
  const fileRecord = new File();
  fileRecord.entity_type = EntityType.PLACEMENT_EXECUTIVE;
  fileRecord.entity_id = executiveId;
  fileRecord.doc_type = DocumentType.PHOTOGRAPH;
  fileRecord.file_path = fullPath.replace(/\\/g, '/');
  fileRecord.file_name = file.originalname;
  fileRecord.mime_type = file.mimetype;
  fileRecord.file_size = file.size;
  fileRecord.version = 1;
  fileRecord.expiry_date = null;

  await manager.save(fileRecord);

  console.log(`✅ Photograph uploaded: ${fullPath}`);

  return fullPath.replace(/\\/g, '/');
};

/**
 * Cleanup photograph on rollback
 */
const cleanupPhotograph = (photographPath: string) => {
  try {
    if (photographPath && fs.existsSync(photographPath)) {
      fs.unlinkSync(photographPath);
      console.log(`🗑️ Cleaned up photograph file: ${photographPath}`);
    }
  } catch (error) {
    console.error('❌ Failed to cleanup photograph file:', error);
  }
};

const create = async (params: ICreatePlacementExecutive, photographFile?: Express.Multer.File) => {
  if (!params.full_name) {
    throw new Error('full_name is required');
  }
  if (!params.mobile_number) {
    throw new Error('mobile_number is required');
  }
  if (!params.email) {
    throw new Error('email is required');
  }
  if (!params.joining_date) {
    throw new Error('joining_date is required');
  }
  if (!params.employment_type) {
    throw new Error('employment_type is required');
  }

  // Validate login credentials
  if (!params.login || !params.login.userID || !params.login.password) {
    throw new Error('login object with userID and password is required');
  }

  // Use transaction to ensure all-or-nothing behavior
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  let photographPath: string | null = null;

  try {
    // Check if email already exists (if provided)
    if (params.email) {
      const existingExecutive = await PlacementExecutiveRepository.findByEmail(params.email);
      if (existingExecutive) {
        throw new Error(`Email '${params.email}' already exists`);
      }
    }

    // Check if loginID already exists
    const existingUser = await queryRunner.manager.findOne(User, {
      where: { loginID: params.login.userID }
    });

    if (existingUser) {
      throw new Error(`Login ID '${params.login.userID}' already exists`);
    }

    // Get Placement Executive role ID
    const placementExecutiveRoleId = await RoleService.getRoleIdByName('Placement Executive');

    // Create placement executive first
    const executive = new PlacementExecutive();
    executive.full_name = params.full_name;
    executive.mobile_number = params.mobile_number;
    executive.email = params.email;
    executive.photograph = null; // Will be updated after file upload
    executive.joining_date = new Date(params.joining_date);
    executive.employment_type = params.employment_type;
    executive.facility_types_handled = params.facility_types_handled || [];
    executive.user_id = null; // Will be updated after user creation

    const savedExecutive = await queryRunner.manager.save(executive);

    // Create user account with placementExecutiveID
    const user = new User();
    user.loginID = params.login.userID;
    user.password = await PasswordUtility.hashPassword(params.login.password);
    user.roleID = placementExecutiveRoleId;
    user.studentID = null;
    user.facilityID = null;
    user.supervisorID = null;
    user.placementExecutiveID = savedExecutive.executive_id; // Auto-filled
    user.trainerID = null;
    user.status = 'active';

    const savedUser = await queryRunner.manager.save(user);

    // Update placement executive with user_id
    await queryRunner.manager.update(PlacementExecutive, { executive_id: savedExecutive.executive_id }, {
      user_id: savedUser.id
    });

    // Upload photograph if provided (within transaction)
    if (photographFile) {
      photographPath = await uploadPhotograph(
        photographFile,
        savedExecutive.executive_id,
        queryRunner.manager
      );

      // Update placement executive with photograph path
      await queryRunner.manager.update(PlacementExecutive, { executive_id: savedExecutive.executive_id }, {
        photograph: photographPath
      });
    }

    await queryRunner.commitTransaction();

    console.log(`✅ Created placement executive with user account (userID=${savedUser.id}, executiveID=${savedExecutive.executive_id})`);

    return await PlacementExecutiveRepository.findById(savedExecutive.executive_id);

  } catch (error) {
    // Only rollback if transaction was started and not committed
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    console.error('❌ Transaction failed, rolling back all changes:', error);

    // Cleanup uploaded file if it was moved
    if (photographPath) {
      cleanupPhotograph(photographPath);
    }

    throw error;
  } finally {
    await queryRunner.release();
  }
};

const getById = async (id: number) => {
  const executive = await PlacementExecutiveRepository.findById(id);
  if (!executive) {
    throw new StringError('Placement Executive does not exist');
  }
  return executive;
};

const update = async (params: IUpdatePlacementExecutive) => {
  const executive = await PlacementExecutiveRepository.findById(params.id);
  if (!executive) {
    throw new StringError('Placement Executive does not exist');
  }

  // Check email uniqueness if being updated
  if (params.email && params.email !== executive.email) {
    const existingExecutive = await PlacementExecutiveRepository.findByEmail(params.email);
    if (existingExecutive) {
      throw new Error(`Email '${params.email}' already exists`);
    }
  }

  const updateData: Partial<PlacementExecutive> = {
    updatedAt: new Date()
  };

  if (params.full_name !== undefined) updateData.full_name = params.full_name;
  if (params.mobile_number !== undefined) updateData.mobile_number = params.mobile_number;
  if (params.email !== undefined) updateData.email = params.email;
  if (params.photograph !== undefined) updateData.photograph = params.photograph;
  if (params.joining_date !== undefined) updateData.joining_date = new Date(params.joining_date);
  if (params.employment_type !== undefined) updateData.employment_type = params.employment_type;
  if (params.facility_types_handled !== undefined) updateData.facility_types_handled = params.facility_types_handled;

  await getRepository(PlacementExecutive).update({ executive_id: params.id }, updateData);
  return await getById(params.id);
};

const list = async (params: IPlacementExecutiveQueryParams) => {
  const { executives, total } = await PlacementExecutiveRepository.findWithFilters(params);
  const pagRes = ApiUtility.getPagination(total, params.limit, params.page);

  return { response: executives, pagination: pagRes.pagination };
};

const remove = async (id: number) => {
  const executive = await PlacementExecutiveRepository.findById(id);
  if (!executive) {
    throw new StringError('Placement Executive does not exist');
  }

  await PlacementExecutiveRepository.softDelete(id);
  return { success: true };
};

const permanentlyDelete = async (id: number) => {
  const executive = await PlacementExecutiveRepository.findById(id);
  if (!executive) {
    throw new StringError('Placement Executive does not exist');
  }

  await PlacementExecutiveRepository.permanentlyDelete(id);
  return { success: true };
};

export interface ICreatePlacementExecutive {
  full_name: string;
  mobile_number: string;
  email: string;
  joining_date: string | Date;
  employment_type: string[];
  facility_types_handled?: string[];
  login: {
    userID: string;
    password: string;
  };
}

export interface IUpdatePlacementExecutive {
  id: number;
  full_name?: string;
  mobile_number?: string;
  email?: string;
  photograph?: string;
  joining_date?: string | Date;
  employment_type?: string[];
  facility_types_handled?: string[];
}

// Bulk upload interfaces
interface IBulkUploadResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  failureCount: number;
  errors: Array<{ row: number; email?: string; errors: string[] }>;
  createdExecutives: Array<{ executive_id: number; email: string; full_name: string }>;
}

interface IBulkExecutiveRow {
  full_name?: string;
  mobile_number?: string;
  email?: string;
  joining_date?: string | Date | any; // Excel can return Date object or string
  employment_type?: string;
  facility_types_handled?: string;
  login_id?: string;
  password?: string;
}

/**
 * Validate a single placement executive row
 */
const validateExecutiveRow = (row: IBulkExecutiveRow, rowIndex: number): string[] => {
  const errors: string[] = [];

  // Required fields
  if (!row.full_name || row.full_name.trim() === '') {
    errors.push('full_name is required');
  }
  if (!row.mobile_number || row.mobile_number.trim() === '') {
    errors.push('mobile_number is required');
  }
  if (!row.email || row.email.trim() === '') {
    errors.push('email is required');
  } else {
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row.email)) {
      errors.push('email must be a valid email address');
    }
  }
  if (!row.joining_date) {
    errors.push('joining_date is required');
  } else {
    // Handle both string dates and Excel date objects
    const dateStr = typeof row.joining_date === 'string' ? row.joining_date.trim() : row.joining_date.toString();
    
    // Check if it's already in YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      // Try to parse as date and validate
      const parsedDate = new Date(dateStr);
      if (isNaN(parsedDate.getTime())) {
        errors.push('joining_date must be a valid date in YYYY-MM-DD format');
      }
    }
  }
  if (!row.employment_type || row.employment_type.trim() === '') {
    errors.push('employment_type is required');
  }
  if (!row.login_id || row.login_id.trim() === '') {
    errors.push('login_id is required');
  }
  if (!row.password || row.password.trim() === '') {
    errors.push('password is required');
  }

  return errors;
};

/**
 * Convert Excel row to placement executive object
 */
const convertRowToExecutive = (row: IBulkExecutiveRow): ICreatePlacementExecutive => {
  // Parse employment_type (comma-separated string to array)
  const employmentType = row.employment_type
    ? row.employment_type.split(',').map(s => s.trim()).filter(s => s)
    : [];

  // Parse facility_types_handled (comma-separated string to array)
  const facilityTypesHandled = row.facility_types_handled
    ? row.facility_types_handled.split(',').map(s => s.trim()).filter(s => s)
    : [];

  // Handle date conversion - Excel might return Date object or string
  let joiningDate: string;
  if (row.joining_date instanceof Date) {
    // Excel date object - convert to YYYY-MM-DD
    const year = row.joining_date.getFullYear();
    const month = String(row.joining_date.getMonth() + 1).padStart(2, '0');
    const day = String(row.joining_date.getDate()).padStart(2, '0');
    joiningDate = `${year}-${month}-${day}`;
  } else if (typeof row.joining_date === 'string') {
    const dateStr = row.joining_date.trim();
    // Check if already in YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(dateStr)) {
      joiningDate = dateStr;
    } else {
      // Try to parse and convert
      const parsedDate = new Date(dateStr);
      const year = parsedDate.getFullYear();
      const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const day = String(parsedDate.getDate()).padStart(2, '0');
      joiningDate = `${year}-${month}-${day}`;
    }
  } else {
    // Fallback - convert to string and try to parse
    const parsedDate = new Date(row.joining_date);
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    joiningDate = `${year}-${month}-${day}`;
  }

  return {
    full_name: row.full_name!.trim(),
    mobile_number: row.mobile_number!.trim(),
    email: row.email!.trim().toLowerCase(),
    joining_date: joiningDate,
    employment_type: employmentType,
    facility_types_handled: facilityTypesHandled,
    login: {
      userID: row.login_id!.trim(),
      password: row.password!.trim()
    }
  };
};

/**
 * Bulk upload placement executives from Excel file
 */
const bulkUpload = async (filePath: string): Promise<IBulkUploadResult> => {
  const result: IBulkUploadResult = {
    success: false,
    totalRows: 0,
    successCount: 0,
    failureCount: 0,
    errors: [],
    createdExecutives: []
  };

  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();

  try {
    // Parse Excel file
    const excelData = ExcelUtility.parseExcelFile<IBulkExecutiveRow>(filePath);
    result.totalRows = excelData.length;

    console.log(`📋 Processing ${excelData.length} placement executive records from Excel file`);

    if (excelData.length === 0) {
      throw new Error('Excel file contains no data rows with actual content');
    }

    // Capacity check
    if (excelData.length > 2000) {
      throw new Error(`File contains ${excelData.length} rows. Maximum allowed is 2000 records per upload. Please split into smaller files.`);
    }

    // Required columns for validation
    const requiredFields = ['full_name', 'mobile_number', 'email', 'joining_date', 'employment_type', 'login_id', 'password'];

    // Validate Excel structure
    const structureErrors = ExcelUtility.validateExcelStructure(excelData, requiredFields);
    if (structureErrors.length > 0) {
      result.errors.push({
        row: 0,
        errors: structureErrors.map(err => err.message)
      });
      return result;
    }

    // PHASE 1: Validate ALL records first
    console.log('🔍 Phase 1: Validating all records...');
    
    const validationErrors: Array<{ row: number; email?: string; errors: string[] }> = [];
    const validatedData: Array<{ rowIndex: number; data: ICreatePlacementExecutive }> = [];

    for (let i = 0; i < excelData.length; i++) {
      const rowIndex = i + 2; // Excel row number (accounting for header)
      const row = excelData[i];

      // Validate row data
      const rowErrors = validateExecutiveRow(row, rowIndex);
      if (rowErrors.length > 0) {
        validationErrors.push({
          row: rowIndex,
          email: row.email,
          errors: rowErrors
        });
        continue;
      }

      // Convert row to executive object
      const executiveData = convertRowToExecutive(row);
      validatedData.push({
        rowIndex,
        data: executiveData
      });
    }

    // If ANY validation errors, fail the entire operation
    if (validationErrors.length > 0) {
      result.errors = validationErrors;
      result.failureCount = validationErrors.length;
      result.successCount = 0;
      throw new Error(`Validation failed for ${validationErrors.length} records. All records must be valid for bulk upload to proceed.`);
    }

    // PHASE 2: Check for duplicates
    console.log('🔍 Phase 2: Checking for duplicate emails and login IDs...');
    
    const allEmails = validatedData.map(item => item.data.email.toLowerCase());
    const allLoginIds = validatedData.map(item => item.data.login.userID.toLowerCase());

    // Check for duplicates within the file itself
    const emailDuplicates = allEmails.filter((email, index) => allEmails.indexOf(email) !== index);
    const loginIdDuplicates = allLoginIds.filter((loginId, index) => allLoginIds.indexOf(loginId) !== index);

    if (emailDuplicates.length > 0) {
      throw new Error(`Duplicate emails found within the file: ${[...new Set(emailDuplicates)].join(', ')}`);
    }

    if (loginIdDuplicates.length > 0) {
      throw new Error(`Duplicate login IDs found within the file: ${[...new Set(loginIdDuplicates)].join(', ')}`);
    }

    // Check for existing records in database
    const existingExecutives = await getRepository(PlacementExecutive).find({ 
      where: { email: In(allEmails) } 
    });

    if (existingExecutives.length > 0) {
      const existingEmails = existingExecutives.map(e => e.email).join(', ');
      throw new Error(`The following emails already exist in the system: ${existingEmails}`);
    }

    const existingUsers = await getRepository(User).find({ 
      where: { loginID: In(allLoginIds) } 
    });

    if (existingUsers.length > 0) {
      const existingLoginIds = existingUsers.map(u => u.loginID).join(', ');
      throw new Error(`The following login IDs already exist in the system: ${existingLoginIds}`);
    }

    // PHASE 3: Pre-hash all passwords
    console.log('🔐 Phase 3: Hashing passwords...');
    
    const passwordHashPromises = validatedData.map(async (item, index) => {
      return {
        index,
        hashedPassword: await PasswordUtility.hashPassword(item.data.login.password)
      };
    });

    const hashedPasswords = await Promise.all(passwordHashPromises);
    const passwordMap = new Map(hashedPasswords.map(p => [p.index, p.hashedPassword]));

    // PHASE 4: Get Placement Executive role ID
    const placementExecutiveRoleId = await RoleService.getRoleIdByName('Placement Executive');

    // PHASE 5: Start single transaction for ALL database operations
    console.log('💾 Phase 5: Starting database transaction for all records...');
    
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const createdExecutives: Array<{ executive_id: number; email: string; full_name: string }> = [];

    try {
      // Process all records within the single transaction
      for (let i = 0; i < validatedData.length; i++) {
        const { data: executiveData, rowIndex } = validatedData[i];
        
        console.log(`📝 Creating placement executive ${i + 1}/${validatedData.length}: ${executiveData.full_name}`);

        // Create placement executive record
        const executive = new PlacementExecutive();
        executive.full_name = executiveData.full_name;
        executive.mobile_number = executiveData.mobile_number;
        executive.email = executiveData.email;
        executive.photograph = null;
        executive.joining_date = new Date(executiveData.joining_date);
        executive.employment_type = executiveData.employment_type;
        executive.facility_types_handled = executiveData.facility_types_handled || [];
        executive.user_id = null; // Will be updated after user creation

        const savedExecutive = await queryRunner.manager.save(PlacementExecutive, executive);

        // Create user account
        const user = new User();
        user.loginID = executiveData.login.userID;
        user.password = passwordMap.get(i); // Use pre-hashed password
        user.roleID = placementExecutiveRoleId;
        user.studentID = null;
        user.facilityID = null;
        user.supervisorID = null;
        user.placementExecutiveID = savedExecutive.executive_id;
        user.trainerID = null;
        user.status = 'active';

        const savedUser = await queryRunner.manager.save(User, user);

        // Update placement executive with user_id
        await queryRunner.manager.update(PlacementExecutive, { executive_id: savedExecutive.executive_id }, {
          user_id: savedUser.id
        });

        createdExecutives.push({
          executive_id: savedExecutive.executive_id,
          email: savedExecutive.email,
          full_name: savedExecutive.full_name
        });
      }

      // If we reach here, all records were processed successfully
      await queryRunner.commitTransaction();
      
      result.success = true;
      result.successCount = createdExecutives.length;
      result.failureCount = 0;
      result.createdExecutives = createdExecutives;
      
      console.log(`✅ All ${createdExecutives.length} placement executives created successfully in single transaction`);
      
      return result;

    } catch (dbError) {
      // Rollback the entire transaction if ANY database operation fails
      await queryRunner.rollbackTransaction();
      console.error('❌ Database error occurred, rolling back ALL changes:', dbError.message);
      throw new Error(`Database operation failed: ${dbError.message}. All changes have been rolled back.`);
    }

  } catch (error) {
    console.error('❌ Bulk upload failed:', error.message);
    
    result.success = false;
    
    if (!result.errors || result.errors.length === 0) {
      result.errors.push({
        row: 0,
        errors: [error.message]
      });
    }
    
    return result;
    
  } finally {
    await queryRunner.release();
    
    // Cleanup uploaded file
    ExcelUtility.cleanupFile(filePath);
  }
};

/**
 * Generate Excel template for bulk upload
 */
const generateTemplate = (): Buffer => {
  const headers = [
    'full_name', 'mobile_number', 'email', 'joining_date', 
    'employment_type', 'facility_types_handled', 
    'login_id', 'password'
  ];

  const sampleData = [
    {
      full_name: 'John Smith',
      mobile_number: '0412345678',
      email: 'john.smith@example.com',
      joining_date: '2024-01-15',
      employment_type: 'full-time,part-time',
      facility_types_handled: 'Aged Care,Disability',
      login_id: 'john.smith',
      password: 'SecurePass123'
    }
  ];

  return ExcelUtility.generateTemplate(headers, sampleData);
};

export default {
  create,
  getById,
  update,
  list,
  remove,
  permanentlyDelete,
  bulkUpload,
  generateTemplate
};
