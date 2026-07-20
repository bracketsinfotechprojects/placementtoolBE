import { getRepository, getConnection, EntityManager, In } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Express } from 'express';
import { Trainer } from '../../entities/trainer/trainer.entity';
import { User } from '../../entities/user/user.entity';
import { File, EntityType, DocumentType } from '../../entities/file/file.entity';
import { CourseAssignment } from '../../entities/course-assignment/course-assignment.entity';
import { PlacementAssignment } from '../../entities/placement-assignment/placement-assignment.entity';
import TrainerRepository, { ITrainerQueryParams } from '../../repositories/trainer.repository';
import ApiUtility from '../../utilities/api.utility';
import PasswordUtility from '../../utilities/password.utility';
import ExcelUtility, { IExcelValidationError, IExcelProcessResult } from '../../utilities/excel.utility';
import RoleService from '../role/role.service';
import FileService from '../file/file.service';
import { StringError } from '../../errors/string.error';

/**
 * Upload photograph and create file record within transaction
 */
const uploadPhotograph = async (
  file: Express.Multer.File,
  trainerId: number,
  manager: EntityManager
): Promise<string> => {
  // Validate file type for images
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed for photographs.');
  }

  // Generate folder path
  const folderPath = path.join('uploads', 'trainers', trainerId.toString());

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
  fileRecord.entity_type = EntityType.TRAINER;
  fileRecord.entity_id = trainerId;
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
 * Upload WWC document and create file record within transaction
 */
const uploadWWCDocument = async (
  file: Express.Multer.File,
  trainerId: number,
  manager: EntityManager
): Promise<string> => {
  // Validate file type for documents
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg', 'image/jpg', 'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only PDF, images, or Word documents are allowed for WWC documents.');
  }

  // Generate folder path
  const folderPath = path.join('uploads', 'trainers', trainerId.toString());

  // Ensure directory exists
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true, mode: 0o755 });
  }

  // Generate secure filename
  const ext = path.extname(file.originalname).toLowerCase();
  const timestamp = Date.now();
  const filename = `WWC_DOCUMENT_${timestamp}${ext}`;
  const fullPath = path.join(folderPath, filename);

  // Move file from temp location
  fs.renameSync(file.path, fullPath);
  fs.chmodSync(fullPath, 0o644);

  // Create file record within the transaction
  const fileRecord = new File();
  fileRecord.entity_type = EntityType.TRAINER;
  fileRecord.entity_id = trainerId;
  fileRecord.doc_type = DocumentType.WORK_CHILD_CHECK;
  fileRecord.file_path = fullPath.replace(/\\/g, '/');
  fileRecord.file_name = file.originalname;
  fileRecord.mime_type = file.mimetype;
  fileRecord.file_size = file.size;
  fileRecord.version = 1;
  fileRecord.expiry_date = null;

  await manager.save(fileRecord);

  console.log(`✅ WWC Document uploaded: ${fullPath}`);

  return fullPath.replace(/\\/g, '/');
};

/**
 * Upload Police Check document and create file record within transaction
 */
const uploadPoliceCheckDocument = async (
  file: Express.Multer.File,
  trainerId: number,
  manager: EntityManager
): Promise<string> => {
  // Validate file type for documents
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg', 'image/jpg', 'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only PDF, images, or Word documents are allowed for Police Check documents.');
  }

  // Generate folder path
  const folderPath = path.join('uploads', 'trainers', trainerId.toString());

  // Ensure directory exists
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true, mode: 0o755 });
  }

  // Generate secure filename
  const ext = path.extname(file.originalname).toLowerCase();
  const timestamp = Date.now();
  const filename = `POLICE_CHECK_DOCUMENT_${timestamp}${ext}`;
  const fullPath = path.join(folderPath, filename);

  // Move file from temp location
  fs.renameSync(file.path, fullPath);
  fs.chmodSync(fullPath, 0o644);

  // Create file record within the transaction
  const fileRecord = new File();
  fileRecord.entity_type = EntityType.TRAINER;
  fileRecord.entity_id = trainerId;
  fileRecord.doc_type = DocumentType.POLICE_CHECK;
  fileRecord.file_path = fullPath.replace(/\\/g, '/');
  fileRecord.file_name = file.originalname;
  fileRecord.mime_type = file.mimetype;
  fileRecord.file_size = file.size;
  fileRecord.version = 1;
  fileRecord.expiry_date = null;

  await manager.save(fileRecord);

  console.log(`✅ Police Check Document uploaded: ${fullPath}`);

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

/**
 * Cleanup document on rollback
 */
const cleanupDocument = (documentPath: string) => {
  try {
    if (documentPath && fs.existsSync(documentPath)) {
      fs.unlinkSync(documentPath);
      console.log(`🗑️ Cleaned up document file: ${documentPath}`);
    }
  } catch (error) {
    console.error('❌ Failed to cleanup document file:', error);
  }
};

const create = async (params: ICreateTrainer, photographFile?: Express.Multer.File, wwcDocumentFile?: Express.Multer.File, policeCheckDocumentFile?: Express.Multer.File) => {
  // Validate required fields
  if (!params.first_name) {
    throw new Error('first_name is required');
  }
  if (!params.last_name) {
    throw new Error('last_name is required');
  }
  if (!params.gender) {
    throw new Error('gender is required');
  }
  if (!params.date_of_birth) {
    throw new Error('date_of_birth is required');
  }
  if (!params.mobile_number) {
    throw new Error('mobile_number is required');
  }
  if (!params.email) {
    throw new Error('email is required');
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
  let wwcDocumentPath: string | null = null;
  let policeCheckDocumentPath: string | null = null;

  try {
    // Check if email already exists
    const existingTrainer = await TrainerRepository.findByEmail(params.email);
    if (existingTrainer) {
      throw new Error(`Email '${params.email}' already exists`);
    }

    // Check if loginID already exists
    const existingUser = await queryRunner.manager.findOne(User, {
      where: { loginID: params.login.userID }
    });

    if (existingUser) {
      throw new Error(`Login ID '${params.login.userID}' already exists`);
    }

    // Get Trainer role ID
    const trainerRoleId = await RoleService.getRoleIdByName('Trainer');

    // Create trainer first
    const trainer = new Trainer();
    trainer.first_name = params.first_name;
    trainer.last_name = params.last_name;
    trainer.gender = params.gender;
    trainer.date_of_birth = new Date(params.date_of_birth);
    trainer.mobile_number = params.mobile_number;
    trainer.alternate_contact = params.alternate_contact;
    trainer.email = params.email;
    trainer.trainer_type = params.trainer_type;
    trainer.course_auth = params.course_auth;
    trainer.acc_numbers = params.acc_numbers;
    trainer.yoe = params.yoe;
    trainer.state_covered = params.state_covered || [];
    trainer.cities_covered = params.cities_covered || [];
    trainer.available_days = params.available_days || [];
    trainer.time_slots = params.time_slots || [];
    // Convert suprise_visit to integer format
    const convertSupriseVisitValue = (value: any): number => {
      if (value === undefined || value === null || value === '') return 0;
      
      const normalized = value.toString().trim().toLowerCase();
      
      // If user provides yes/no, convert to 1/0
      if (normalized === 'yes' || normalized === 'true') return 1;
      if (normalized === 'no' || normalized === 'false') return 0;
      
      // If user provides 1/0, keep as is (convert to number)
      if (normalized === '1') return 1;
      if (normalized === '0') return 0;
      
      // Default to 0 for any other value
      return 0;
    };

    trainer.suprise_visit = convertSupriseVisitValue(params.suprise_visit);
    trainer.wwchildcheck = params.wwchildcheck;
    trainer.wwcExpiryDate = params.wwcExpiryDate ? new Date(params.wwcExpiryDate) : null;
    trainer.policeCheckNumber = params.policeCheckNumber;
    trainer.policeCheckExpiryDate = params.policeCheckExpiryDate ? new Date(params.policeCheckExpiryDate) : null;
    trainer.photograph = null; // Will be updated after file upload
    trainer.user_id = null; // Will be updated after user creation

    const savedTrainer = await queryRunner.manager.save(trainer);

    // Create user account with trainerID auto-filled
    const user = new User();
    user.loginID = params.login.userID;
    user.password = await PasswordUtility.hashPassword(params.login.password);
    user.roleID = trainerRoleId;
    user.studentID = null;
    user.facilityID = null;
    user.supervisorID = null;
    user.placementExecutiveID = null;
    user.trainerID = savedTrainer.trainer_id; // Auto-filled
    user.status = 'active';

    const savedUser = await queryRunner.manager.save(user);

    // Update trainer with user_id
    await queryRunner.manager.update(Trainer, { trainer_id: savedTrainer.trainer_id }, {
      user_id: savedUser.id
    });

    // Upload photograph if provided (within transaction)
    if (photographFile) {
      photographPath = await uploadPhotograph(
        photographFile,
        savedTrainer.trainer_id,
        queryRunner.manager
      );

      // Update trainer with photograph path
      await queryRunner.manager.update(Trainer, { trainer_id: savedTrainer.trainer_id }, {
        photograph: photographPath
      });
    }

    // Upload WWC document if provided (within transaction)
    if (wwcDocumentFile) {
      wwcDocumentPath = await uploadWWCDocument(
        wwcDocumentFile,
        savedTrainer.trainer_id,
        queryRunner.manager
      );

      // Update trainer with WWC document path
      await queryRunner.manager.update(Trainer, { trainer_id: savedTrainer.trainer_id }, {
        wwcDocument: wwcDocumentPath
      });
    }

    // Upload Police Check document if provided (within transaction)
    if (policeCheckDocumentFile) {
      policeCheckDocumentPath = await uploadPoliceCheckDocument(
        policeCheckDocumentFile,
        savedTrainer.trainer_id,
        queryRunner.manager
      );

      // Update trainer with Police Check document path
      await queryRunner.manager.update(Trainer, { trainer_id: savedTrainer.trainer_id }, {
        policeCheckDocument: policeCheckDocumentPath
      });
    }

    await queryRunner.commitTransaction();

    console.log(`✅ Created trainer with user account (userID=${savedUser.id}, trainerID=${savedTrainer.trainer_id})`);

    return await TrainerRepository.findById(savedTrainer.trainer_id);

  } catch (error) {
    // Only rollback if transaction was started and not committed
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    console.error('❌ Transaction failed, rolling back all changes:', error);

    // Cleanup uploaded files if they were moved
    if (photographPath) {
      cleanupPhotograph(photographPath);
    }
    if (wwcDocumentPath) {
      cleanupDocument(wwcDocumentPath);
    }
    if (policeCheckDocumentPath) {
      cleanupDocument(policeCheckDocumentPath);
    }

    throw error;
  } finally {
    await queryRunner.release();
  }
};

const getById = async (id: number) => {
  const trainer = await TrainerRepository.findById(id);
  if (!trainer) {
    throw new StringError('Trainer does not exist');
  }

  // Get photograph file from files table (case-insensitive search for doc_type)
  const photographFiles = await FileService.getFilesByEntityAndDocTypeCaseInsensitive(
    EntityType.TRAINER,
    id,
    'PHOTOGRAPH'
  );

  // Add photograph URL to trainer object if exists
  const trainerWithPhoto = {
    ...trainer,
    photograph_url: photographFiles.length > 0 ? photographFiles[0].file_path : null,
    photograph_filename: photographFiles.length > 0 ? photographFiles[0].file_name : null
  };

  return trainerWithPhoto;
};

const update = async (params: IUpdateTrainer, photographFile?: Express.Multer.File, wwcDocumentFile?: Express.Multer.File, policeCheckDocumentFile?: Express.Multer.File) => {
  const trainer = await TrainerRepository.findById(params.id);
  if (!trainer) {
    throw new StringError('Trainer does not exist');
  }

  // Check email uniqueness if being updated
  if (params.email && params.email !== trainer.email) {
    const existingTrainer = await TrainerRepository.findByEmail(params.email);
    if (existingTrainer) {
      throw new Error(`Email '${params.email}' already exists`);
    }
  }

  // Prepare update data
  const updateData: Partial<Trainer> = {
    updatedAt: new Date()
  };

  if (params.first_name !== undefined) updateData.first_name = params.first_name;
  if (params.last_name !== undefined) updateData.last_name = params.last_name;
  if (params.gender !== undefined) updateData.gender = params.gender;
  if (params.date_of_birth !== undefined) updateData.date_of_birth = new Date(params.date_of_birth);
  if (params.mobile_number !== undefined) updateData.mobile_number = params.mobile_number;
  if (params.alternate_contact !== undefined) updateData.alternate_contact = params.alternate_contact;
  if (params.email !== undefined) updateData.email = params.email;
  if (params.trainer_type !== undefined) updateData.trainer_type = params.trainer_type;
  if (params.course_auth !== undefined) updateData.course_auth = params.course_auth;
  if (params.acc_numbers !== undefined) updateData.acc_numbers = params.acc_numbers;
  if (params.yoe !== undefined) updateData.yoe = params.yoe;
  if (params.state_covered !== undefined) updateData.state_covered = params.state_covered;
  if (params.cities_covered !== undefined) updateData.cities_covered = params.cities_covered;
  if (params.available_days !== undefined) updateData.available_days = params.available_days;
  if (params.time_slots !== undefined) updateData.time_slots = params.time_slots;
  
  // Convert suprise_visit for update operations
  const convertSupriseVisitForUpdate = (value: any): number => {
    if (value === undefined || value === null || value === '') return 0;
    
    const normalized = value.toString().trim().toLowerCase();
    
    // If user provides yes/no, convert to 1/0
    if (normalized === 'yes' || normalized === 'true') return 1;
    if (normalized === 'no' || normalized === 'false') return 0;
    
    // If user provides 1/0, keep as is (convert to number)
    if (normalized === '1') return 1;
    if (normalized === '0') return 0;
    
    // Default to 0 for any other value
    return 0;
  };

  if (params.suprise_visit !== undefined) updateData.suprise_visit = convertSupriseVisitForUpdate(params.suprise_visit);
  if (params.wwchildcheck !== undefined) updateData.wwchildcheck = params.wwchildcheck;
  if (params.wwcExpiryDate !== undefined) updateData.wwcExpiryDate = new Date(params.wwcExpiryDate);
  if (params.policeCheckNumber !== undefined) updateData.policeCheckNumber = params.policeCheckNumber;
  if (params.policeCheckExpiryDate !== undefined) updateData.policeCheckExpiryDate = new Date(params.policeCheckExpiryDate);

  // If no files provided, do simple update without transaction
  if (!photographFile && !wwcDocumentFile && !policeCheckDocumentFile) {
    await getRepository(Trainer).update({ trainer_id: params.id }, updateData);
    console.log('✅ Trainer updated successfully (no file upload)');
    return await getById(params.id);
  }

  // If any file is provided, use transaction
  const queryRunner = getConnection().createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  let photographPath: string | null = null;
  let wwcDocumentPath: string | null = null;
  let policeCheckDocumentPath: string | null = null;

  try {
    // Update trainer data
    await queryRunner.manager.update(Trainer, { trainer_id: params.id }, updateData);

    // Handle photograph upload
    if (photographFile) {
      // Deactivate old photograph files
      await queryRunner.manager.update(
        File,
        { 
          entity_type: EntityType.TRAINER, 
          entity_id: params.id,
          doc_type: DocumentType.PHOTOGRAPH,
          is_active: true 
        },
        { is_active: false }
      );

      // Upload new photograph
      photographPath = await uploadPhotograph(
        photographFile,
        params.id,
        queryRunner.manager
      );

      // Update trainer with new photograph path
      await queryRunner.manager.update(Trainer, { trainer_id: params.id }, {
        photograph: photographPath
      });
    }

    // Handle WWC document upload
    if (wwcDocumentFile) {
      // Deactivate old WWC document files
      await queryRunner.manager.update(
        File,
        { 
          entity_type: EntityType.TRAINER, 
          entity_id: params.id,
          doc_type: DocumentType.WORK_CHILD_CHECK,
          is_active: true 
        },
        { is_active: false }
      );

      // Upload new WWC document
      wwcDocumentPath = await uploadWWCDocument(
        wwcDocumentFile,
        params.id,
        queryRunner.manager
      );

      // Update trainer with new WWC document path
      await queryRunner.manager.update(Trainer, { trainer_id: params.id }, {
        wwcDocument: wwcDocumentPath
      });
    }

    // Handle Police Check document upload
    if (policeCheckDocumentFile) {
      // Deactivate old Police Check document files
      await queryRunner.manager.update(
        File,
        { 
          entity_type: EntityType.TRAINER, 
          entity_id: params.id,
          doc_type: DocumentType.POLICE_CHECK,
          is_active: true 
        },
        { is_active: false }
      );

      // Upload new Police Check document
      policeCheckDocumentPath = await uploadPoliceCheckDocument(
        policeCheckDocumentFile,
        params.id,
        queryRunner.manager
      );

      // Update trainer with new Police Check document path
      await queryRunner.manager.update(Trainer, { trainer_id: params.id }, {
        policeCheckDocument: policeCheckDocumentPath
      });
    }

    // Commit transaction
    await queryRunner.commitTransaction();
    console.log('✅ Trainer updated successfully with file uploads');

    return await getById(params.id);

  } catch (error) {
    // Rollback transaction on error
    await queryRunner.rollbackTransaction();
    console.error('❌ Error in trainer update, rolling back...', error.message);

    // Cleanup uploaded files if they were moved
    if (photographPath) {
      cleanupPhotograph(photographPath);
    }
    if (wwcDocumentPath) {
      cleanupDocument(wwcDocumentPath);
    }
    if (policeCheckDocumentPath) {
      cleanupDocument(policeCheckDocumentPath);
    }

    throw error;
  } finally {
    await queryRunner.release();
  }
};

const list = async (params: ITrainerQueryParams) => {
  const { trainers, total } = await TrainerRepository.findWithFilters(params);
  const pagRes = ApiUtility.getPagination(total, params.limit, params.page);

  return { response: trainers, pagination: pagRes.pagination };
};

const remove = async (id: number) => {
  const trainer = await TrainerRepository.findById(id);
  if (!trainer) {
    throw new StringError('Trainer does not exist');
  }

  await TrainerRepository.softDelete(id);
  return { success: true };
};

const permanentlyDelete = async (id: number) => {
  const trainer = await TrainerRepository.findById(id);
  if (!trainer) {
    throw new StringError('Trainer does not exist');
  }

  await TrainerRepository.permanentlyDelete(id);
  return { success: true };
};

export interface ICreateTrainer {
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string | Date;
  mobile_number: string;
  alternate_contact?: string;
  email: string;
  trainer_type?: string[];
  course_auth?: string[];
  acc_numbers?: string;
  yoe?: number;
  state_covered?: string[];
  cities_covered?: string[];
  available_days?: string[];
  time_slots?: string[];
  suprise_visit?: number; // Changed from string to number to match database
  wwchildcheck?: number;
  wwcExpiryDate?: string | Date;
  policeCheckNumber?: string;
  policeCheckExpiryDate?: string | Date;
  login?: {
    userID: string;
    password: string;
  };
  login_userID?: string;
  login_password?: string;
}

interface IBulkTrainerRow {
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  mobile_number: string;
  alternate_contact?: string;
  email: string;
  trainer_type?: string;
  course_auth?: string;
  acc_numbers?: string;
  yoe?: string;
  state_covered?: string;
  cities_covered?: string;
  available_days?: string;
  time_slots?: string;
  suprise_visit?: string;
  wwchildcheck?: string;
  wwc_expiry_date?: string;
  police_check_number?: string;
  police_check_expiry_date?: string;
  login_user_id: string;
  login_password: string;
}

interface IBulkUploadResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  failureCount: number;
  errors: Array<{
    row: number;
    email?: string;
    errors: string[];
  }>;
  createdTrainers: Array<{
    trainer_id: number;
    email: string;
    full_name: string;
  }>;
  transactionRolledBack?: boolean; // Indicates if transaction was rolled back due to failures
}

export interface IUpdateTrainer {
  id: number;
  first_name?: string;
  last_name?: string;
  gender?: string;
  date_of_birth?: string | Date;
  mobile_number?: string;
  alternate_contact?: string;
  email?: string;
  trainer_type?: string[];
  course_auth?: string[];
  acc_numbers?: string;
  yoe?: number;
  state_covered?: string[];
  cities_covered?: string[];
  available_days?: string[];
  time_slots?: string[];
  suprise_visit?: number; // Changed from string to number
  wwchildcheck?: number;
  wwcExpiryDate?: string | Date;
  policeCheckNumber?: string;
  policeCheckExpiryDate?: string | Date;
  photograph?: string;
}

const validateTrainerRow = (row: IBulkTrainerRow, rowIndex: number): string[] => {
  const errors: string[] = [];

  // Check if row has any meaningful data at all
  const hasAnyData = Object.values(row).some(value => 
    value && value.toString().trim() !== ''
  );
  
  if (!hasAnyData) {
    errors.push('Row appears to be empty or contains no meaningful data');
    return errors; // Return early for completely empty rows
  }

  // Required field validations
  if (!row.first_name?.trim()) errors.push('first_name is required');
  if (!row.last_name?.trim()) errors.push('last_name is required');
  if (!row.gender?.trim()) errors.push('gender is required');
  if (!row.date_of_birth?.trim()) errors.push('date_of_birth is required');
  if (!row.mobile_number?.trim()) errors.push('mobile_number is required');
  if (!row.email?.trim()) errors.push('email is required');
  if (!row.login_user_id?.trim()) errors.push('login_user_id is required');
  if (!row.login_password?.trim()) errors.push('login_password is required');

  // Email format validation
  if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())) {
    errors.push('Invalid email format');
  }

  // Date format validation
  if (row.date_of_birth && isNaN(Date.parse(row.date_of_birth))) {
    errors.push('Invalid date_of_birth format (use YYYY-MM-DD)');
  }

  // Gender validation
  if (row.gender && !['Male', 'Female', 'Other'].includes(row.gender.trim())) {
    errors.push('gender must be Male, Female, or Other');
  }

  // Mobile number validation (basic)
  if (row.mobile_number && !/^\d{10,15}$/.test(row.mobile_number.replace(/\s+/g, ''))) {
    errors.push('mobile_number must be 10-15 digits');
  }

  // WWC validation
  if (row.wwchildcheck && !['0', '1', '2'].includes(row.wwchildcheck.trim())) {
    errors.push('wwchildcheck must be 0 (Pending), 1 (Approved), or 2 (Expired)');
  }

  // YOE validation
  if (row.yoe && (isNaN(Number(row.yoe)) || Number(row.yoe) < 0)) {
    errors.push('yoe (Years of Experience) must be a positive number');
  }

  // Surprise visit validation - accept yes/no or 1/0 formats
  if (row.suprise_visit && !['yes', 'no', 'true', 'false', '1', '0'].includes(row.suprise_visit.trim().toLowerCase())) {
    errors.push('suprise_visit must be "yes"/"no" or "1"/"0" (will be converted to 1=yes, 0=no)');
  }

  // Date validations for optional date fields
  if (row.wwc_expiry_date && row.wwc_expiry_date.trim() && isNaN(Date.parse(row.wwc_expiry_date))) {
    errors.push('Invalid wwc_expiry_date format (use YYYY-MM-DD)');
  }

  if (row.police_check_expiry_date && row.police_check_expiry_date.trim() && isNaN(Date.parse(row.police_check_expiry_date))) {
    errors.push('Invalid police_check_expiry_date format (use YYYY-MM-DD)');
  }

  return errors;
};

const convertRowToTrainer = (row: IBulkTrainerRow): ICreateTrainer => {
  // Helper function to parse comma-separated values
  const parseArray = (value?: string): string[] => {
    if (!value?.trim()) return [];
    return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
  };

  // Helper function to convert suprise_visit to proper integer format for database
  const convertSupriseVisit = (value?: string): number => {
    if (!value?.trim()) return 0; // Default to 0 (no)
    const normalized = value.trim().toLowerCase();
    
    // If user provides yes/no, convert to 1/0
    if (normalized === 'yes' || normalized === 'true') return 1;
    if (normalized === 'no' || normalized === 'false') return 0;
    
    // If user provides 1/0, keep as is (convert to number)
    if (normalized === '1') return 1;
    if (normalized === '0') return 0;
    
    // Default to 0 for any other value
    return 0;
  };

  return {
    first_name: row.first_name.trim(),
    last_name: row.last_name.trim(),
    gender: row.gender.trim(),
    date_of_birth: row.date_of_birth.trim(),
    mobile_number: row.mobile_number.trim(),
    alternate_contact: row.alternate_contact?.trim() || undefined,
    email: row.email.trim().toLowerCase(),
    trainer_type: parseArray(row.trainer_type),
    course_auth: parseArray(row.course_auth),
    acc_numbers: row.acc_numbers?.trim() || undefined,
    yoe: row.yoe ? Number(row.yoe) : undefined,
    state_covered: parseArray(row.state_covered),
    cities_covered: parseArray(row.cities_covered),
    available_days: parseArray(row.available_days),
    time_slots: parseArray(row.time_slots),
    suprise_visit: convertSupriseVisit(row.suprise_visit),
    wwchildcheck: row.wwchildcheck ? Number(row.wwchildcheck) : undefined,
    wwcExpiryDate: row.wwc_expiry_date?.trim() || undefined,
    policeCheckNumber: row.police_check_number?.trim() || undefined,
    policeCheckExpiryDate: row.police_check_expiry_date?.trim() || undefined,
    login: {
      userID: row.login_user_id.trim(),
      password: row.login_password.trim()
    }
  };
};

const bulkUpload = async (filePath: string): Promise<IBulkUploadResult> => {
  const result: IBulkUploadResult = {
    success: false,
    totalRows: 0,
    successCount: 0,
    failureCount: 0,
    errors: [],
    createdTrainers: []
  };

  // Single transaction for all operations
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();

  try {
    // Parse Excel file
    const excelData = ExcelUtility.parseExcelFile<IBulkTrainerRow>(filePath);
    result.totalRows = excelData.length;

    console.log(`📋 Processing ${excelData.length} trainer records from Excel file`);

    if (excelData.length === 0) {
      throw new Error('Excel file contains no data rows with actual content');
    }

    // Capacity check
    if (excelData.length > 2000) {
      throw new Error(`File contains ${excelData.length} rows. Maximum allowed is 2000 records per upload. Please split into smaller files.`);
    }

    // Required columns for validation
    const requiredFields = [
      'first_name', 'last_name', 'gender', 'date_of_birth', 
      'mobile_number', 'email', 'login_user_id', 'login_password'
    ];

    // Validate Excel structure
    const structureErrors = ExcelUtility.validateExcelStructure(excelData, requiredFields);
    if (structureErrors.length > 0) {
      result.errors.push({
        row: 0,
        errors: structureErrors.map(err => err.message)
      });
      return result;
    }

    // PHASE 1: Validate ALL records first (before any database operations)
    console.log('🔍 Phase 1: Validating all records...');
    
    const validationErrors: Array<{ row: number; email?: string; errors: string[] }> = [];
    const validatedData: Array<{ rowIndex: number; data: ICreateTrainer }> = [];

    for (let i = 0; i < excelData.length; i++) {
      const rowIndex = i + 2; // Excel row number (accounting for header)
      const row = excelData[i];

      // Validate row data
      const rowErrors = validateTrainerRow(row, rowIndex);
      if (rowErrors.length > 0) {
        validationErrors.push({
          row: rowIndex,
          email: row.email,
          errors: rowErrors
        });
        continue;
      }

      // Convert row to trainer object
      const trainerData = convertRowToTrainer(row);
      validatedData.push({
        rowIndex,
        data: trainerData
      });
    }

    // If ANY validation errors, fail the entire operation
    if (validationErrors.length > 0) {
      result.errors = validationErrors;
      result.failureCount = validationErrors.length;
      result.successCount = 0;
      throw new Error(`Validation failed for ${validationErrors.length} records. All records must be valid for bulk upload to proceed.`);
    }

    // PHASE 2: Check for duplicates in database
    console.log('🔍 Phase 2: Checking for duplicate emails and login IDs...');
    
    const allEmails = validatedData.map(item => item.data.email.toLowerCase());
    const allLoginIds = validatedData.map(item => item.data.login.userID);

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
    const [existingTrainers, existingUsers] = await Promise.all([
      getRepository(Trainer).find({ where: { email: In(allEmails) } }),
      getRepository(User).find({ where: { loginID: In(allLoginIds) } })
    ]);

    if (existingTrainers.length > 0) {
      const existingEmails = existingTrainers.map(t => t.email).join(', ');
      throw new Error(`The following emails already exist in the system: ${existingEmails}`);
    }

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

    // PHASE 4: Get trainer role ID
    const trainerRoleId = await RoleService.getRoleIdByName('Trainer');

    // PHASE 5: Start single transaction for ALL database operations
    console.log('💾 Phase 5: Starting database transaction for all records...');
    
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const createdTrainers: Array<{ trainer_id: number; email: string; full_name: string }> = [];

    try {
      // Process all records within the single transaction
      for (let i = 0; i < validatedData.length; i++) {
        const { data: trainerData } = validatedData[i];
        
        console.log(`📝 Creating trainer ${i + 1}/${validatedData.length}: ${trainerData.email}`);

        // Create trainer
        const trainer = new Trainer();
        trainer.first_name = trainerData.first_name;
        trainer.last_name = trainerData.last_name;
        trainer.gender = trainerData.gender;
        trainer.date_of_birth = new Date(trainerData.date_of_birth);
        trainer.mobile_number = trainerData.mobile_number;
        trainer.alternate_contact = trainerData.alternate_contact;
        trainer.email = trainerData.email;
        trainer.trainer_type = trainerData.trainer_type;
        trainer.course_auth = trainerData.course_auth;
        trainer.acc_numbers = trainerData.acc_numbers;
        trainer.yoe = trainerData.yoe;
        trainer.state_covered = trainerData.state_covered || [];
        trainer.cities_covered = trainerData.cities_covered || [];
        trainer.available_days = trainerData.available_days || [];
        trainer.time_slots = trainerData.time_slots || [];
        trainer.suprise_visit = trainerData.suprise_visit || 0;
        trainer.wwchildcheck = trainerData.wwchildcheck;
        trainer.wwcExpiryDate = trainerData.wwcExpiryDate ? new Date(trainerData.wwcExpiryDate) : null;
        trainer.policeCheckNumber = trainerData.policeCheckNumber;
        trainer.policeCheckExpiryDate = trainerData.policeCheckExpiryDate ? new Date(trainerData.policeCheckExpiryDate) : null;
        trainer.photograph = null;
        trainer.user_id = null;

        const savedTrainer = await queryRunner.manager.save(trainer);

        // Create user account with pre-hashed password
        const user = new User();
        user.loginID = trainerData.login.userID;
        user.password = passwordMap.get(i); // Use pre-hashed password
        user.roleID = trainerRoleId;
        user.studentID = null;
        user.facilityID = null;
        user.supervisorID = null;
        user.placementExecutiveID = null;
        user.trainerID = savedTrainer.trainer_id;
        user.status = 'active';

        const savedUser = await queryRunner.manager.save(user);

        // Update trainer with user_id
        await queryRunner.manager.update(Trainer, { trainer_id: savedTrainer.trainer_id }, {
          user_id: savedUser.id
        });

        createdTrainers.push({
          trainer_id: savedTrainer.trainer_id,
          email: savedTrainer.email,
          full_name: `${savedTrainer.first_name} ${savedTrainer.last_name}`
        });
      }

      // If we reach here, all records were processed successfully
      await queryRunner.commitTransaction();
      
      result.success = true;
      result.successCount = createdTrainers.length;
      result.failureCount = 0;
      result.createdTrainers = createdTrainers;
      
      console.log(`✅ All ${createdTrainers.length} trainers created successfully in single transaction`);
      
      return result;

    } catch (dbError) {
      // Rollback the entire transaction if ANY database operation fails
      await queryRunner.rollbackTransaction();
      console.error('❌ Database error occurred, rolling back ALL changes:', dbError.message);
      throw new Error(`Database operation failed: ${dbError.message}. All changes have been rolled back.`);
    }

  } catch (error) {
    // Handle any errors (validation, duplicate check, database errors)
    console.error('❌ Bulk upload failed:', error.message);
    
    result.success = false;
    result.successCount = 0;
    
    // If it's a validation error, we already have the errors populated
    if (result.errors.length === 0) {
      result.errors.push({
        row: 0,
        errors: [error.message]
      });
    }
    
    throw error;
    
  } finally {
    // Always release the query runner
    if (queryRunner.isReleased === false) {
      await queryRunner.release();
    }
    
    // Cleanup uploaded file
    ExcelUtility.cleanupFile(filePath);
  }
};

const generateTemplate = (): Buffer => {
  const headers = [
    'first_name', 'last_name', 'gender', 'date_of_birth', 'mobile_number',
    'alternate_contact', 'email', 'trainer_type', 'course_auth', 'acc_numbers',
    'yoe', 'state_covered', 'cities_covered', 'available_days', 'time_slots',
    'suprise_visit', 'wwchildcheck', 'wwc_expiry_date', 'police_check_number',
    'police_check_expiry_date', 'login_user_id', 'login_password'
  ];

  const sampleData = [{
    first_name: 'John',
    last_name: 'Doe',
    gender: 'Male',
    date_of_birth: '1990-01-15',
    mobile_number: '0912345678',
    alternate_contact: '0912345679',
    email: 'john.doe@example.com',
    trainer_type: 'Full-time,Part-time',
    course_auth: 'CHC33021 - Certificate III in Individual Support,CHC43021 - Certificate IV in Ageing Support',
    acc_numbers: 'ACC123456',
    yoe: '5',
    state_covered: 'NSW,VIC',
    cities_covered: 'Sydney,Melbourne',
    available_days: 'Monday,Tuesday,Wednesday',
    time_slots: '09:00-12:00,14:00-17:00',
    suprise_visit: '1',
    wwchildcheck: '1',
    wwc_expiry_date: '2025-12-31',
    police_check_number: 'POL-2024-12345',
    police_check_expiry_date: '2025-06-30',
    login_user_id: 'john.doe',
    login_password: 'SecurePass123'
  }];

  return ExcelUtility.generateTemplate(headers, sampleData);
};

const getTodayClasses = async (trainerId: number) => {
  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const todayDate = today.toISOString().split('T')[0];

  // Import CourseSlots repository dynamically to avoid circular dependencies
  const { getRepository } = require('typeorm');
  const courseRepository = getRepository('CourseSlots');

  // Query for courses scheduled for today with this trainer, including trainer details
  const courses = await courseRepository
    .createQueryBuilder('course')
    .leftJoinAndSelect('course.trainer', 'trainer')
    .where('course.course_date = :date', { date: todayDate })
    .andWhere('course.trainer_id = :trainerId', { trainerId })
    .orderBy('course.reporting_time', 'ASC')
    .getMany();

  return courses;
};

/**
 * A student is considered "assigned" to this trainer via the workshop (CourseAssignment) they
 * took under the trainer. Each such student is then matched against their internship
 * (PlacementAssignment) records that the facility has accepted, to surface facility,
 * internship slot, workshop completion, and internship status together.
 */
const getAssignedInterns = async (trainerId: number) => {
  const workshopAssignments = await getRepository(CourseAssignment)
    .createQueryBuilder('ca')
    .leftJoinAndSelect('ca.course', 'course')
    .leftJoinAndSelect('ca.student', 'student')
    .where('ca.trainer_id = :trainerId', { trainerId })
    .andWhere('student.isDeleted = :studentDeleted', { studentDeleted: false })
    .orderBy('ca.enrollment_date', 'DESC')
    .getMany();

  if (workshopAssignments.length === 0) {
    return [];
  }

  const studentIds = [...new Set(workshopAssignments.map((wa) => wa.student_id))];

  const internshipAssignments = await getRepository(PlacementAssignment)
    .createQueryBuilder('pa')
    .leftJoinAndSelect('pa.placementSlot', 'placementSlot')
    .leftJoinAndSelect('placementSlot.facility', 'facility')
    .where('pa.student_id IN (:...studentIds)', { studentIds })
    .andWhere('pa.facility_confirmation_status = :confirmed', { confirmed: 'Approved' })
    .andWhere('placementSlot.is_deleted = :isDeleted', { isDeleted: false })
    .orderBy('pa.created_at', 'DESC')
    .getMany();

  const internshipsByStudent = new Map<number, PlacementAssignment[]>();
  for (const internshipAssignment of internshipAssignments) {
    const list = internshipsByStudent.get(internshipAssignment.student_id) || [];
    list.push(internshipAssignment);
    internshipsByStudent.set(internshipAssignment.student_id, list);
  }

  const rows: any[] = [];
  for (const workshopAssignment of workshopAssignments) {
    const internships = internshipsByStudent.get(workshopAssignment.student_id) || [];

    for (const internshipAssignment of internships) {
      rows.push({
        student_id: workshopAssignment.student_id,
        student_name: `${workshopAssignment.student.first_name} ${workshopAssignment.student.last_name}`,
        student_type: workshopAssignment.student.student_type,
        workshop_assignment_id: workshopAssignment.assignment_id,
        course_id: workshopAssignment.course_id,
        course_name: workshopAssignment.course?.course_name,
        workshop_status: workshopAssignment.status,
        workshop_attendance_status: workshopAssignment.attendance_status,
        internship_assignment_id: internshipAssignment.assignment_id,
        facility_id: internshipAssignment.placementSlot?.facility_id,
        facility_name: internshipAssignment.placementSlot?.facility?.organization_name || 'N/A',
        placementslot_id: internshipAssignment.placementslot_id,
        internship_status: internshipAssignment.status,
        facility_confirmation_status: internshipAssignment.facility_confirmation_status,
        slot_type: internshipAssignment.placementSlot?.placementslot_type,
        course_applicable: internshipAssignment.placementSlot?.course_applicable,
        shift_type: internshipAssignment.placementSlot?.shift_type,
        shift_timings: internshipAssignment.placementSlot?.shift_timings,
        working_days: internshipAssignment.placementSlot?.working_days,
        slot_start_date: internshipAssignment.placementSlot?.placement_start_date,
        slot_end_date: internshipAssignment.placementSlot?.placement_end_date,
        actual_start_date: internshipAssignment.start_date,
        actual_end_date: internshipAssignment.end_date,
        total_hours_required: internshipAssignment.placementSlot?.total_hours_required
      });
    }
  }

  return rows;
};

export default {
  create,
  getById,
  update,
  list,
  remove,
  permanentlyDelete,
  bulkUpload,
  generateTemplate,
  getTodayClasses,
  getAssignedInterns
};
