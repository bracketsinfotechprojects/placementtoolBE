import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import BaseController from '../base.controller';
import FileService, { IUploadFileParams, IListFilesParams } from '../../services/file/file.service';
import ApiResponseUtility from '../../utilities/api-response.utility';
import { EntityType, DocumentType } from '../../entities/file/file.entity';
import { StringError } from '../../errors/string.error';

export default class FileController extends BaseController {
  
  /**
   * Upload a file
   * POST /api/files/upload
   */
  static async upload(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      // Check if file was uploaded
      if (!req.file) {
        throw new StringError('No file uploaded');
      }

      // Validate required fields
      const { entity_type, entity_id, doc_type } = req.body;

      if (!entity_type || !entity_id || !doc_type) {
        // Clean up uploaded file
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        throw new StringError('entity_type, entity_id, and doc_type are required');
      }

      // Validate entity_type
      if (!Object.values(EntityType).includes(entity_type)) {
        // Clean up uploaded file
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        throw new StringError(`Invalid entity_type. Allowed values: ${Object.values(EntityType).join(', ')}`);
      }

      // Validate doc_type
      if (!Object.values(DocumentType).includes(doc_type)) {
        // Clean up uploaded file
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        throw new StringError(`Invalid doc_type. Allowed values: ${Object.values(DocumentType).join(', ')}`);
      }

      // Validate entity_id is a positive integer
      const entityId = parseInt(entity_id, 10);
      if (isNaN(entityId) || entityId <= 0) {
        // Clean up uploaded file
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        throw new StringError('entity_id must be a positive integer');
      }

      // Upload file
      const uploadParams: IUploadFileParams = {
        file: req.file,
        entity_type: entity_type as EntityType,
        entity_id: entityId,
        doc_type: doc_type as DocumentType,
        expiry_date: req.body.expiry_date
      };

      const fileRecord = await FileService.uploadFile(uploadParams);

      // Return response with download URL
      const response = {
        ...fileRecord,
        download_url: `/api/files/download/${fileRecord.id}`
      };

      ApiResponseUtility.createdSuccess(res, response, 'File uploaded successfully');
    }, 'File upload failed');
  }

  /**
   * Get file by ID
   * GET /api/files/:id
   */
  static async getById(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const file = await FileService.getFileById(id);

      const response = {
        ...file,
        download_url: `/api/files/download/${file.id}`
      };

      ApiResponseUtility.success(res, response);
    }, 'Failed to retrieve file');
  }

  /**
   * Download file
   * GET /api/files/download/:id
   */
  static async download(req: Request, res: Response) {
    try {
      const id = BaseController.parseId(req, 'id');
      const filePath = await FileService.getDownloadPath(id);
      const file = await FileService.getFileById(id);

      // Set headers for file download
      res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${file.file_name}"`);
      res.setHeader('Content-Length', file.file_size?.toString() || '0');

      // Stream file to response
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      fileStream.on('error', (error) => {
        console.error('Error streaming file:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error downloading file'
          });
        }
      });
    } catch (error: any) {
      if (!res.headersSent) {
        res.status(404).json({
          success: false,
          message: error.message || 'File not found'
        });
      }
    }
  }

  /**
   * Get files by entity
   * GET /api/files/entity/:entity_type/:entity_id
   */
  static async getByEntity(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const { entity_type, entity_id } = req.params;

      // Validate entity_type
      if (!Object.values(EntityType).includes(entity_type as EntityType)) {
        throw new StringError(`Invalid entity_type. Allowed values: ${Object.values(EntityType).join(', ')}`);
      }

      const entityId = parseInt(entity_id, 10);
      if (isNaN(entityId) || entityId <= 0) {
        throw new StringError('entity_id must be a positive integer');
      }

      const files = await FileService.getFilesByEntity(
        entity_type as EntityType,
        entityId
      );

      // Add download URLs
      const filesWithUrls = files.map(file => ({
        ...file,
        download_url: `/api/files/download/${file.id}`
      }));

      ApiResponseUtility.success(res, filesWithUrls, `Found ${files.length} file(s)`);
    }, 'Failed to retrieve files');
  }

  /**
   * Download all files for an entity as ZIP
   * GET /api/files/download/entity/:entity_type/:entity_id
   */
  static async downloadEntityFiles(req: Request, res: Response) {
    try {
      const { entity_type, entity_id } = req.params;

      // Validate entity_type
      if (!Object.values(EntityType).includes(entity_type as EntityType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid entity_type. Allowed values: ${Object.values(EntityType).join(', ')}`
        });
      }

      const entityId = parseInt(entity_id, 10);
      if (isNaN(entityId) || entityId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'entity_id must be a positive integer'
        });
      }

      // Create ZIP archive
      const { archive, filename, fileCount } = await FileService.createEntityFilesZip(
        entity_type as EntityType,
        entityId
      );

      // Set headers for ZIP download
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Handle archive errors
      archive.on('error', (err) => {
        console.error('Archive error:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error creating archive'
          });
        }
      });

      // Pipe archive to response
      archive.pipe(res);

      console.log(`📦 Downloading ${fileCount} file(s) as ${filename}`);
    } catch (error: any) {
      console.error('Download entity files error:', error);
      if (!res.headersSent) {
        res.status(error.message.includes('not found') ? 404 : 500).json({
          success: false,
          message: error.message || 'Failed to download files'
        });
      }
    }
  }

  /**
   * List files with filters
   * GET /api/files
   */
  static async list(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const pagination = BaseController.parsePaginationParams(req.query);

      const params: IListFilesParams = {
        entity_type: req.query.entity_type as EntityType,
        entity_id: req.query.entity_id ? parseInt(req.query.entity_id as string, 10) : undefined,
        doc_type: req.query.doc_type as DocumentType,
        mime_type: req.query.mime_type as string,
        uploaded_from: req.query.uploaded_from as string,
        uploaded_to: req.query.uploaded_to as string,
        sort_by: req.query.sort_by as string,
        sort_order: req.query.sort_order as string,
        ...pagination
      };

      const result = await FileService.listFiles(params);

      // Add download URLs
      const filesWithUrls = result.files.map(file => ({
        ...file,
        download_url: `/api/files/download/${file.id}`
      }));

      ApiResponseUtility.success(
        res,
        filesWithUrls,
        'Files retrieved successfully',
        result.pagination
      );
    }, 'Failed to list files');
  }

  /**
   * Delete file (soft delete)
   * DELETE /api/files/:id
   */
  static async delete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      await FileService.deleteFile(id);

      ApiResponseUtility.success(res, null, 'File deleted successfully');
    }, 'Failed to delete file');
  }

  /**
   * Permanently delete file
   * DELETE /api/files/:id/permanent
   */
  static async permanentlyDelete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      await FileService.permanentlyDeleteFile(id);

      ApiResponseUtility.success(res, null, 'File permanently deleted');
    }, 'Failed to permanently delete file');
  }

  /**
   * Get file statistics
   * GET /api/files/statistics
   */
  static async getStatistics(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const entityType = req.query.entity_type as EntityType;

      const stats = await FileService.getStatistics(entityType);

      ApiResponseUtility.success(res, stats, 'Statistics retrieved successfully');
    }, 'Failed to retrieve statistics');
  }

  /**
   * Upload multiple files
   * POST /api/files/upload-multiple
   */
  static async uploadMultiple(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      // Check if files were uploaded
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new StringError('No files uploaded');
      }

      // Validate required fields
      const { entity_type, entity_id, doc_types } = req.body;

      if (!entity_type || !entity_id || !doc_types) {
        // Clean up uploaded files
        req.files.forEach((file: Express.Multer.File) => {
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        throw new StringError('entity_type, entity_id, and doc_types are required');
      }

      // Parse doc_types (can be JSON array or comma-separated string)
      let docTypesArray: DocumentType[];
      try {
        docTypesArray = typeof doc_types === 'string' 
          ? (doc_types.includes('[') ? JSON.parse(doc_types) : doc_types.split(','))
          : doc_types;
      } catch (error) {
        // Clean up uploaded files
        req.files.forEach((file: Express.Multer.File) => {
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        throw new StringError('doc_types must be a valid JSON array or comma-separated string');
      }

      // Validate doc_types count matches files count
      if (docTypesArray.length !== req.files.length) {
        // Clean up uploaded files
        req.files.forEach((file: Express.Multer.File) => {
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        throw new StringError(`Number of doc_types (${docTypesArray.length}) must match number of files (${req.files.length})`);
      }

      // Validate entity_type
      if (!Object.values(EntityType).includes(entity_type)) {
        // Clean up uploaded files
        req.files.forEach((file: Express.Multer.File) => {
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        throw new StringError(`Invalid entity_type. Allowed values: ${Object.values(EntityType).join(', ')}`);
      }

      // Validate each doc_type
      for (const docType of docTypesArray) {
        if (!Object.values(DocumentType).includes(docType)) {
          // Clean up uploaded files
          req.files.forEach((file: Express.Multer.File) => {
            if (file.path && fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
          throw new StringError(`Invalid doc_type: ${docType}. Allowed values: ${Object.values(DocumentType).join(', ')}`);
        }
      }

      // Validate entity_id is a positive integer
      const entityId = parseInt(entity_id, 10);
      if (isNaN(entityId) || entityId <= 0) {
        // Clean up uploaded files
        req.files.forEach((file: Express.Multer.File) => {
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        throw new StringError('entity_id must be a positive integer');
      }

      // Upload files
      const uploadParams = {
        files: req.files as Express.Multer.File[],
        entity_type: entity_type as EntityType,
        entity_id: entityId,
        doc_types: docTypesArray,
        expiry_date: req.body.expiry_date
      };

      const fileRecords = await FileService.uploadMultipleFiles(uploadParams);

      // Return response with download URLs
      const response = fileRecords.map(file => ({
        ...file,
        download_url: `/api/files/download/${file.id}`
      }));

      ApiResponseUtility.createdSuccess(res, response, `${fileRecords.length} file(s) uploaded successfully`);
    }, 'Multiple file upload failed');
  }
}
