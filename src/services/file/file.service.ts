import * as fs from 'fs';
import * as path from 'path';
import sanitize from 'sanitize-filename';
import { v4 as uuidv4 } from 'uuid';
import archiver from 'archiver';
import FileRepository, { ICreateFile } from '../../repositories/file.repository';
import { File, EntityType, DocumentType } from '../../entities/file/file.entity';
import { StringError } from '../../errors/string.error';
import { getRepository } from 'typeorm';
import { Student } from '../../entities/student/student.entity';
import { Facility } from '../../entities/facility/facility.entity';
import { Trainer } from '../../entities/trainer/trainer.entity';

export default class FileService {
  
  /**
   * Validate if entity exists in database
   */
  private static async validateEntityExists(
    entityType: EntityType,
    entityId: number
  ): Promise<void> {
    let exists = false;

    switch (entityType) {
      case EntityType.STUDENT:
        const student = await getRepository(Student).findOne({ 
          where: { student_id: entityId, isDeleted: false } 
        });
        exists = !!student;
        break;
      
      case EntityType.FACILITY:
        const facility = await getRepository(Facility).findOne({ 
          where: { facility_id: entityId, isDeleted: false } 
        });
        exists = !!facility;
        break;
      
      case EntityType.TRAINER:
        const trainer = await getRepository(Trainer).findOne({ 
          where: { trainer_id: entityId, isDeleted: false } 
        });
        exists = !!trainer;
        break;
      
      // Add other entity types as needed
      case EntityType.PLACEMENT:
      case EntityType.VISA:
      case EntityType.JOB:
      case EntityType.AGREEMENT:
        // For now, skip validation for these types
        exists = true;
        break;
      
      default:
        throw new StringError('Invalid entity type');
    }

    if (!exists) {
      throw new StringError(`${entityType} with ID ${entityId} does not exist`);
    }
  }

  /**
   * Validate file type
   */
  private static validateFileType(mimetype: string, originalname: string): void {
    const allowedMimeTypes = [
      // PDF
      'application/pdf',
      // Images
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      // Word documents
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Excel spreadsheets
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    const allowedExtensions = [
      '.pdf',                                    // PDF
      '.jpg', '.jpeg', '.png', '.gif', '.webp', // Images
      '.doc', '.docx',                          // Word
      '.xls', '.xlsx'                           // Excel
    ];
    
    const ext = path.extname(originalname).toLowerCase();

    if (!allowedMimeTypes.includes(mimetype)) {
      throw new StringError(`File type ${mimetype} is not allowed. Allowed: PDF, Images, Word, Excel`);
    }

    if (!allowedExtensions.includes(ext)) {
      throw new StringError(`File extension ${ext} is not allowed. Allowed: ${allowedExtensions.join(', ')}`);
    }

    // Check for executable files
    const dangerousExtensions = ['.exe', '.sh', '.bat', '.cmd', '.js', '.jar', '.app', '.msi', '.vbs'];
    if (dangerousExtensions.includes(ext)) {
      throw new StringError('Executable files are not allowed');
    }
  }

  /**
   * Generate secure folder path
   */
  private static generateFolderPath(
    entityType: EntityType,
    entityId: number
  ): string {
    // Base upload directory
    const baseDir = 'uploads';
    
    // Generate path: uploads/{entity_type}s/{entity_id}
    const entityFolder = `${entityType}s`;
    const folderPath = path.join(baseDir, entityFolder, entityId.toString());
    
    return folderPath;
  }

  /**
   * Generate secure filename
   */
  private static generateSecureFilename(
    docType: DocumentType,
    originalFilename: string
  ): string {
    // Get file extension
    const ext = path.extname(originalFilename).toLowerCase();
    
    // Sanitize original filename (remove extension)
    const nameWithoutExt = path.basename(originalFilename, ext);
    const sanitizedName = sanitize(nameWithoutExt)
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .substring(0, 50); // Limit length
    
    // Generate unique filename: {DOC_TYPE}_{timestamp}_{sanitized_name}{ext}
    const timestamp = Date.now();
    const filename = `${docType}_${timestamp}_${sanitizedName}${ext}`;
    
    return filename;
  }

  /**
   * Ensure directory exists, create if not
   */
  private static ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
      console.log(`✅ Created directory: ${dirPath}`);
    }
  }

  /**
   * Upload file
   */
  static async uploadFile(params: IUploadFileParams): Promise<File> {
    const { file, entity_type, entity_id, doc_type, expiry_date } = params;

    // 1. Validate entity exists
    await this.validateEntityExists(entity_type, entity_id);

    // 2. Validate file type
    this.validateFileType(file.mimetype, file.originalname);

    // 3. Check if file with same doc_type exists (for versioning)
    const existingFile = await FileRepository.getLatestVersion(
      entity_type,
      entity_id,
      doc_type
    );

    // 4. Deactivate old version if exists
    if (existingFile) {
      await FileRepository.softDelete(existingFile.id);
      console.log(`📝 Deactivated old version: ${existingFile.file_path}`);
    }

    // 5. Generate folder path
    const folderPath = this.generateFolderPath(entity_type, entity_id);

    // 6. Ensure directory exists
    this.ensureDirectoryExists(folderPath);

    // 7. Generate secure filename
    const secureFilename = this.generateSecureFilename(doc_type, file.originalname);

    // 8. Full file path
    const fullPath = path.join(folderPath, secureFilename);

    // 9. Move file from temp location to final destination
    try {
      fs.renameSync(file.path, fullPath);
      
      // Set file permissions (read/write for owner, read for others)
      fs.chmodSync(fullPath, 0o644);
      
      console.log(`✅ File saved: ${fullPath}`);
    } catch (error) {
      console.error('❌ Error saving file:', error);
      throw new StringError('Failed to save file to disk');
    }

    // 10. Calculate version number
    const version = existingFile ? existingFile.version + 1 : 1;

    // 11. Save file metadata to database
    const fileRecord = await FileRepository.create({
      entity_type,
      entity_id,
      doc_type,
      file_path: fullPath.replace(/\\/g, '/'), // Normalize path separators
      file_name: file.originalname,
      mime_type: file.mimetype,
      file_size: file.size,
      version
    });

    console.log(`✅ File record created in database: ID ${fileRecord.id}`);

    return fileRecord;
  }

  /**
   * Get file by ID
   */
  static async getFileById(id: number): Promise<File> {
    const file = await FileRepository.findById(id);
    
    if (!file) {
      throw new StringError('File not found');
    }

    return file;
  }

  /**
   * Get all files for an entity
   */
  static async getFilesByEntity(
    entityType: EntityType,
    entityId: number
  ): Promise<File[]> {
    return await FileRepository.findByEntity(entityType, entityId);
  }

  /**
   * Create ZIP archive of all files for an entity
   */
  static async createEntityFilesZip(
    entityType: EntityType,
    entityId: number
  ): Promise<{ archive: archiver.Archiver; filename: string; fileCount: number }> {
    // Get all files for the entity
    const files = await FileRepository.findByEntity(entityType, entityId);

    if (files.length === 0) {
      throw new StringError(`No files found for ${entityType} with ID ${entityId}`);
    }

    // Create archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Add each file to the archive
    let addedCount = 0;
    for (const file of files) {
      const filePath = path.resolve(file.file_path);
      
      // Check if file exists
      if (fs.existsSync(filePath)) {
        // Create a clean filename for the archive
        const archiveFileName = `${file.doc_type}_v${file.version}_${file.file_name}`;
        archive.file(filePath, { name: archiveFileName });
        addedCount++;
      } else {
        console.warn(`⚠️ File not found on disk: ${filePath}`);
      }
    }

    if (addedCount === 0) {
      throw new StringError('No files available for download');
    }

    // Finalize the archive
    archive.finalize();

    // Generate filename for the ZIP
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `${entityType}_${entityId}_files_${timestamp}.zip`;

    return { archive, filename, fileCount: addedCount };
  }

  /**
   * Get files by entity and document type
   */
  static async getFilesByEntityAndDocType(
    entityType: EntityType,
    entityId: number,
    docType: DocumentType
  ): Promise<File[]> {
    return await FileRepository.findByEntityAndDocType(entityType, entityId, docType);
  }

  /**
   * Delete file (soft delete)
   */
  static async deleteFile(id: number): Promise<void> {
    const file = await FileRepository.findById(id);
    
    if (!file) {
      throw new StringError('File not found');
    }

    await FileRepository.softDelete(id);
    console.log(`🗑️ File marked as inactive: ${file.file_path}`);
  }

  /**
   * Delete file permanently (removes from disk and database)
   */
  static async permanentlyDeleteFile(id: number): Promise<void> {
    const file = await FileRepository.findById(id);
    
    if (!file) {
      throw new StringError('File not found');
    }

    // Delete physical file
    try {
      if (fs.existsSync(file.file_path)) {
        fs.unlinkSync(file.file_path);
        console.log(`🗑️ Physical file deleted: ${file.file_path}`);
      }
    } catch (error) {
      console.error('⚠️ Error deleting physical file:', error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await FileRepository.permanentlyDelete(id);
    console.log(`🗑️ File record deleted from database: ID ${id}`);
  }

  /**
   * Get file statistics
   */
  static async getStatistics(entityType?: EntityType): Promise<any> {
    if (entityType) {
      return await FileRepository.getStatsByEntityType(entityType);
    }

    // Get stats for all entity types
    const allStats = await Promise.all(
      Object.values(EntityType).map(async (type) => {
        const stats = await FileRepository.getStatsByEntityType(type);
        return { entity_type: type, ...stats };
      })
    );

    return allStats;
  }

  /**
   * List files with filters
   */
  static async listFiles(params: IListFilesParams): Promise<{
    files: File[];
    total: number;
    pagination: any;
  }> {
    const result = await FileRepository.findWithFilters(params);
    
    // Calculate pagination
    const limit = params.limit || 20;
    const page = params.page || 1;
    const totalPages = Math.ceil(result.total / limit);

    return {
      files: result.files,
      total: result.total,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages
      }
    };
  }

  /**
   * Upload multiple files
   */
  static async uploadMultipleFiles(params: IUploadMultipleFilesParams): Promise<File[]> {
    const { files, entity_type, entity_id, doc_types, expiry_date } = params;
    
    // Convert expiry_date string to Date if provided
    const expiryDate = expiry_date ? new Date(expiry_date) : null;

    // Validate entity exists once
    await this.validateEntityExists(entity_type, entity_id);

    const uploadedFiles: File[] = [];
    const errors: Array<{ filename: string; error: string }> = [];

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const doc_type = doc_types[i];

      try {
        // Validate file type
        this.validateFileType(file.mimetype, file.originalname);

        // Check if file with same doc_type exists (for versioning)
        const existingFile = await FileRepository.getLatestVersion(
          entity_type,
          entity_id,
          doc_type
        );

        // Deactivate old version if exists
        if (existingFile) {
          await FileRepository.softDelete(existingFile.id);
          console.log(`📝 Deactivated old version: ${existingFile.file_path}`);
        }

        // Generate folder path
        const folderPath = this.generateFolderPath(entity_type, entity_id);

        // Ensure directory exists
        this.ensureDirectoryExists(folderPath);

        // Generate secure filename
        const secureFilename = this.generateSecureFilename(doc_type, file.originalname);

        // Full file path
        const fullPath = path.join(folderPath, secureFilename);

        // Move file from temp location to final destination
        fs.renameSync(file.path, fullPath);
        fs.chmodSync(fullPath, 0o644);

        console.log(`✅ File saved: ${fullPath}`);

        // Calculate version number
        const version = existingFile ? existingFile.version + 1 : 1;

        // Save file metadata to database
        const fileRecord = await FileRepository.create({
          entity_type,
          entity_id,
          doc_type,
          file_path: fullPath.replace(/\\/g, '/'),
          file_name: file.originalname,
          mime_type: file.mimetype,
          file_size: file.size,
          version,
          expiry_date: expiryDate
        });

        uploadedFiles.push(fileRecord);
        console.log(`✅ File record created: ID ${fileRecord.id}`);

      } catch (error: any) {
        // Clean up file if it exists
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        errors.push({
          filename: file.originalname,
          error: error.message || 'Unknown error'
        });

        console.error(`❌ Error uploading ${file.originalname}:`, error.message);
      }
    }

    // If all files failed, throw error
    if (uploadedFiles.length === 0 && errors.length > 0) {
      throw new StringError(`All files failed to upload: ${JSON.stringify(errors)}`);
    }

    // If some files failed, log warning but return successful uploads
    if (errors.length > 0) {
      console.warn(`⚠️ Some files failed to upload:`, errors);
    }

    return uploadedFiles;
  }

  /**
   * Get download path for a file
   */
  static async getDownloadPath(id: number): Promise<string> {
    const file = await this.getFileById(id);
    
    // Verify file exists on disk
    if (!fs.existsSync(file.file_path)) {
      throw new StringError('File not found on disk');
    }

    return file.file_path;
  }
}

export interface IUploadFileParams {
  file: Express.Multer.File;
  entity_type: EntityType;
  entity_id: number;
  doc_type: DocumentType;
  expiry_date?: string;
}

export interface IListFilesParams {
  entity_type?: EntityType;
  entity_id?: number;
  doc_type?: DocumentType;
  mime_type?: string;
  uploaded_from?: string;
  uploaded_to?: string;
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  page?: number;
}


export interface IUploadMultipleFilesParams {
  files: Express.Multer.File[];
  entity_type: EntityType;
  entity_id: number;
  doc_types: DocumentType[];
  expiry_date?: string;
}
