import { getRepository, getConnection, In } from 'typeorm';
import { FacilitySupervisor } from '../../entities/facility-supervisor/facility-supervisor.entity';
import { User } from '../../entities/user/user.entity';
import FacilitySupervisorRepository, { IFacilitySupervisorQueryParams } from '../../repositories/facility-supervisor.repository';
import FacilityRepository from '../../repositories/facility.repository';
import ApiUtility from '../../utilities/api.utility';
import PasswordUtility from '../../utilities/password.utility';
import RoleService from '../role/role.service';
import { StringError } from '../../errors/string.error';
import ExcelUtility from '../../utilities/excel.utility';

const create = async (params: ICreateFacilitySupervisor) => {
  if (!params.full_name) {
    throw new Error('full_name is required');
  }
  if (!params.designation) {
    throw new Error('designation is required');
  }
  if (!params.mobile_number) {
    throw new Error('mobile_number is required');
  }
  if (!params.facility_id) {
    throw new Error('facility_id is required');
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

  try {
    // Check if email already exists (if provided)
    if (params.email) {
      const existingSupervisor = await FacilitySupervisorRepository.findByEmail(params.email);
      if (existingSupervisor) {
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

    // Get Supervisor role ID
    const supervisorRoleId = await RoleService.getRoleIdByName('Supervisor');

    // Create facility supervisor first
    const supervisor = new FacilitySupervisor();
    supervisor.full_name = params.full_name;
    supervisor.designation = params.designation;
    supervisor.mobile_number = params.mobile_number;
    supervisor.email = params.email;
    supervisor.photograph = params.photograph;
    supervisor.facility_id = params.facility_id;
    supervisor.facility_name = params.facility_name;
    supervisor.branch_site = params.branch_site;
    supervisor.facility_types = params.facility_types || [];
    supervisor.facility_address = params.facility_address;
    supervisor.max_students_can_handle = params.max_students_can_handle;
    supervisor.id_proof_document = params.id_proof_document;
    supervisor.police_check_document = params.police_check_document;
    supervisor.authorization_letter_document = params.authorization_letter_document;
    supervisor.portal_access_enabled = params.portal_access_enabled || false;
    supervisor.user_id = null; // Will be updated after user creation

    const savedSupervisor = await queryRunner.manager.save(supervisor);

    // Create user account with supervisorID auto-filled
    const user = new User();
    user.loginID = params.login.userID;
    user.password = await PasswordUtility.hashPassword(params.login.password);
    user.roleID = supervisorRoleId;
    user.studentID = null;
    user.facilityID = null;
    user.supervisorID = savedSupervisor.supervisor_id; // Auto-filled
    user.placementExecutiveID = null;
    user.trainerID = null;
    user.status = 'active';

    const savedUser = await queryRunner.manager.save(user);

    // Update facility supervisor with user_id
    await queryRunner.manager.update(FacilitySupervisor, { supervisor_id: savedSupervisor.supervisor_id }, {
      user_id: savedUser.id
    });

    await queryRunner.commitTransaction();

    console.log(`✅ Created facility supervisor with user account (userID=${savedUser.id}, supervisorID=${savedSupervisor.supervisor_id})`);

    return await FacilitySupervisorRepository.findById(savedSupervisor.supervisor_id);

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Transaction failed, rolling back all changes:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
};

const getById = async (id: number) => {
  const supervisor = await FacilitySupervisorRepository.findById(id);
  if (!supervisor) {
    throw new StringError('Facility Supervisor does not exist');
  }
  return supervisor;
};

const update = async (params: IUpdateFacilitySupervisor) => {
  const supervisor = await FacilitySupervisorRepository.findById(params.id);
  if (!supervisor) {
    throw new StringError('Facility Supervisor does not exist');
  }

  // Check email uniqueness if being updated
  if (params.email && params.email !== supervisor.email) {
    const existingSupervisor = await FacilitySupervisorRepository.findByEmail(params.email);
    if (existingSupervisor) {
      throw new Error(`Email '${params.email}' already exists`);
    }
  }

  const updateData: Partial<FacilitySupervisor> = {
    updatedAt: new Date()
  };

  if (params.full_name !== undefined) updateData.full_name = params.full_name;
  if (params.designation !== undefined) updateData.designation = params.designation;
  if (params.mobile_number !== undefined) updateData.mobile_number = params.mobile_number;
  if (params.email !== undefined) updateData.email = params.email;
  if (params.photograph !== undefined) updateData.photograph = params.photograph;
  if (params.facility_id !== undefined) updateData.facility_id = params.facility_id;
  if (params.facility_name !== undefined) updateData.facility_name = params.facility_name;
  if (params.branch_site !== undefined) updateData.branch_site = params.branch_site;
  if (params.facility_types !== undefined) updateData.facility_types = params.facility_types;
  if (params.facility_address !== undefined) updateData.facility_address = params.facility_address;
  if (params.max_students_can_handle !== undefined) updateData.max_students_can_handle = params.max_students_can_handle;
  if (params.id_proof_document !== undefined) updateData.id_proof_document = params.id_proof_document;
  if (params.police_check_document !== undefined) updateData.police_check_document = params.police_check_document;
  if (params.authorization_letter_document !== undefined) updateData.authorization_letter_document = params.authorization_letter_document;
  if (params.portal_access_enabled !== undefined) updateData.portal_access_enabled = params.portal_access_enabled;

  await getRepository(FacilitySupervisor).update({ supervisor_id: params.id }, updateData);
  return await getById(params.id);
};

const list = async (params: IFacilitySupervisorQueryParams) => {
  const { supervisors, total } = await FacilitySupervisorRepository.findWithFilters(params);
  const pagRes = ApiUtility.getPagination(total, params.limit, params.page);

  return { response: supervisors, pagination: pagRes.pagination };
};

const remove = async (id: number) => {
  const supervisor = await FacilitySupervisorRepository.findById(id);
  if (!supervisor) {
    throw new StringError('Facility Supervisor does not exist');
  }

  await FacilitySupervisorRepository.softDelete(id);
  return { success: true };
};

const permanentlyDelete = async (id: number) => {
  const supervisor = await FacilitySupervisorRepository.findById(id);
  if (!supervisor) {
    throw new StringError('Facility Supervisor does not exist');
  }

  await FacilitySupervisorRepository.permanentlyDelete(id);
  return { success: true };
};

export interface ICreateFacilitySupervisor {
  full_name: string;
  designation: string;
  mobile_number: string;
  email?: string;
  photograph?: string;
  facility_id: number;
  facility_name?: string;
  branch_site?: string;
  facility_types?: string[];
  facility_address?: string;
  max_students_can_handle?: number;
  id_proof_document?: string;
  police_check_document?: string;
  authorization_letter_document?: string;
  portal_access_enabled?: boolean;
  login: {
    userID: string;
    password: string;
  };
}

export interface IUpdateFacilitySupervisor {
  id: number;
  full_name?: string;
  designation?: string;
  mobile_number?: string;
  email?: string;
  photograph?: string;
  facility_id?: number;
  facility_name?: string;
  branch_site?: string;
  facility_types?: string[];
  facility_address?: string;
  max_students_can_handle?: number;
  id_proof_document?: string;
  police_check_document?: string;
  authorization_letter_document?: string;
  portal_access_enabled?: boolean;
}

// Bulk upload interfaces
interface IBulkUploadResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  failureCount: number;
  errors: Array<{ row: number; email?: string; errors: string[] }>;
  createdSupervisors: Array<{ supervisor_id: number; email: string; full_name: string }>;
}

interface IBulkSupervisorRow {
  full_name?: string;
  designation?: string;
  mobile_number?: string;
  email?: string;
  facility_name?: string;
  branch_site?: string;
  facility_types?: string;
  facility_address?: string;
  max_students_can_handle?: string | number;
  portal_access_enabled?: string | boolean;
  login_id?: string;
  password?: string;
}

/**
 * Validate a single facility supervisor row
 */
const validateSupervisorRow = (row: IBulkSupervisorRow, rowIndex: number): string[] => {
  const errors: string[] = [];

  // Required fields
  if (!row.full_name || row.full_name.trim() === '') {
    errors.push('full_name is required');
  }
  if (!row.designation || row.designation.trim() === '') {
    errors.push('designation is required');
  }
  if (!row.mobile_number || row.mobile_number.trim() === '') {
    errors.push('mobile_number is required');
  }
  if (!row.login_id || row.login_id.trim() === '') {
    errors.push('login_id is required');
  }
  if (!row.password || row.password.trim() === '') {
    errors.push('password is required');
  }

  // Optional email validation
  if (row.email && row.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row.email)) {
      errors.push('email must be a valid email address');
    }
  }

  return errors;
};

/**
 * Convert Excel row to facility supervisor object
 */
const convertRowToSupervisor = (row: IBulkSupervisorRow, facilityId: number): ICreateFacilitySupervisor => {
  // Parse facility_types (comma-separated string to array)
  const facilityTypes = row.facility_types
    ? row.facility_types.split(',').map(s => s.trim()).filter(s => s)
    : [];

  // Parse max_students_can_handle
  let maxStudents: number | undefined;
  if (row.max_students_can_handle) {
    const parsed = typeof row.max_students_can_handle === 'string'
      ? parseInt(row.max_students_can_handle)
      : row.max_students_can_handle;
    if (!isNaN(parsed)) {
      maxStudents = parsed;
    }
  }

  // Parse portal_access_enabled (boolean)
  let portalAccess = false;
  if (row.portal_access_enabled !== undefined && row.portal_access_enabled !== null && row.portal_access_enabled !== '') {
    const val = row.portal_access_enabled.toString().toLowerCase();
    portalAccess = val === 'true' || val === 'yes' || val === '1';
  }

  return {
    full_name: row.full_name!.trim(),
    designation: row.designation!.trim(),
    mobile_number: row.mobile_number!.trim(),
    email: row.email ? row.email.trim().toLowerCase() : undefined,
    facility_id: facilityId,
    facility_name: row.facility_name ? row.facility_name.trim() : undefined,
    branch_site: row.branch_site ? row.branch_site.trim() : undefined,
    facility_types: facilityTypes,
    facility_address: row.facility_address ? row.facility_address.trim() : undefined,
    max_students_can_handle: maxStudents,
    portal_access_enabled: portalAccess,
    login: {
      userID: row.login_id!.trim(),
      password: row.password!.trim()
    }
  };
};

/**
 * Bulk upload facility supervisors from Excel file
 */
const bulkUpload = async (filePath: string, facilityId: number): Promise<IBulkUploadResult> => {
  const result: IBulkUploadResult = {
    success: false,
    totalRows: 0,
    successCount: 0,
    failureCount: 0,
    errors: [],
    createdSupervisors: []
  };

  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();

  try {
    if (!facilityId || isNaN(facilityId)) {
      throw new Error('facility_id is required');
    }

    const facility = await FacilityRepository.findById(facilityId);
    if (!facility) {
      throw new Error(`Facility with id ${facilityId} does not exist`);
    }

    // Parse Excel file
    const excelData = ExcelUtility.parseExcelFile<IBulkSupervisorRow>(filePath);
    result.totalRows = excelData.length;

    console.log(`📋 Processing ${excelData.length} facility supervisor records from Excel file`);

    if (excelData.length === 0) {
      throw new Error('Excel file contains no data rows with actual content');
    }

    // Capacity check
    if (excelData.length > 2000) {
      throw new Error(`File contains ${excelData.length} rows. Maximum allowed is 2000 records per upload. Please split into smaller files.`);
    }

    // Required columns for validation
    const requiredFields = ['full_name', 'designation', 'mobile_number', 'login_id', 'password'];

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
    const validatedData: Array<{ rowIndex: number; data: ICreateFacilitySupervisor }> = [];

    for (let i = 0; i < excelData.length; i++) {
      const rowIndex = i + 2; // Excel row number (accounting for header)
      const row = excelData[i];

      // Validate row data
      const rowErrors = validateSupervisorRow(row, rowIndex);
      if (rowErrors.length > 0) {
        validationErrors.push({
          row: rowIndex,
          email: row.email,
          errors: rowErrors
        });
        continue;
      }

      // Convert row to supervisor object
      const supervisorData = convertRowToSupervisor(row, facilityId);
      validatedData.push({
        rowIndex,
        data: supervisorData
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
    
    const allEmails = validatedData
      .filter(item => item.data.email)
      .map(item => item.data.email!.toLowerCase());
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
    if (allEmails.length > 0) {
      const existingSupervisors = await getRepository(FacilitySupervisor).find({ 
        where: { email: In(allEmails) } 
      });

      if (existingSupervisors.length > 0) {
        const existingEmails = existingSupervisors.map(s => s.email).join(', ');
        throw new Error(`The following emails already exist in the system: ${existingEmails}`);
      }
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

    // PHASE 4: Get Supervisor role ID
    const supervisorRoleId = await RoleService.getRoleIdByName('Supervisor');

    // PHASE 5: Start single transaction for ALL database operations
    console.log('💾 Phase 5: Starting database transaction for all records...');
    
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const createdSupervisors: Array<{ supervisor_id: number; email: string; full_name: string }> = [];

    try {
      // Process all records within the single transaction
      for (let i = 0; i < validatedData.length; i++) {
        const { data: supervisorData, rowIndex } = validatedData[i];
        
        console.log(`📝 Creating facility supervisor ${i + 1}/${validatedData.length}: ${supervisorData.full_name}`);

        // Create facility supervisor record
        const supervisor = new FacilitySupervisor();
        supervisor.full_name = supervisorData.full_name;
        supervisor.designation = supervisorData.designation;
        supervisor.mobile_number = supervisorData.mobile_number;
        supervisor.email = supervisorData.email || null;
        supervisor.photograph = null;
        supervisor.facility_id = supervisorData.facility_id;
        supervisor.facility_name = supervisorData.facility_name || null;
        supervisor.branch_site = supervisorData.branch_site || null;
        supervisor.facility_types = supervisorData.facility_types || [];
        supervisor.facility_address = supervisorData.facility_address || null;
        supervisor.max_students_can_handle = supervisorData.max_students_can_handle || null;
        supervisor.id_proof_document = null;
        supervisor.police_check_document = null;
        supervisor.authorization_letter_document = null;
        supervisor.portal_access_enabled = supervisorData.portal_access_enabled || false;
        supervisor.user_id = null; // Will be updated after user creation

        const savedSupervisor = await queryRunner.manager.save(FacilitySupervisor, supervisor);

        // Create user account
        const user = new User();
        user.loginID = supervisorData.login.userID;
        user.password = passwordMap.get(i); // Use pre-hashed password
        user.roleID = supervisorRoleId;
        user.studentID = null;
        user.facilityID = null;
        user.supervisorID = savedSupervisor.supervisor_id;
        user.placementExecutiveID = null;
        user.trainerID = null;
        user.status = 'active';

        const savedUser = await queryRunner.manager.save(User, user);

        // Update facility supervisor with user_id
        await queryRunner.manager.update(FacilitySupervisor, { supervisor_id: savedSupervisor.supervisor_id }, {
          user_id: savedUser.id
        });

        createdSupervisors.push({
          supervisor_id: savedSupervisor.supervisor_id,
          email: savedSupervisor.email || '',
          full_name: savedSupervisor.full_name
        });
      }

      // If we reach here, all records were processed successfully
      await queryRunner.commitTransaction();
      
      result.success = true;
      result.successCount = createdSupervisors.length;
      result.failureCount = 0;
      result.createdSupervisors = createdSupervisors;
      
      console.log(`✅ All ${createdSupervisors.length} facility supervisors created successfully in single transaction`);
      
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
    'full_name', 'designation', 'mobile_number', 'email',
    'facility_name', 'branch_site',
    'facility_types', 'facility_address', 'max_students_can_handle',
    'portal_access_enabled', 'login_id', 'password'
  ];

  const sampleData = [
    {
      full_name: 'John Supervisor',
      designation: 'Senior Supervisor',
      mobile_number: '0412345678',
      email: 'john.supervisor@example.com',
      facility_name: 'Sunshine Aged Care',
      branch_site: 'Main Branch',
      facility_types: 'Aged Care,Disability',
      facility_address: '123 Care Street, Sydney NSW 2000',
      max_students_can_handle: '10',
      portal_access_enabled: 'true',
      login_id: 'john.supervisor',
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
