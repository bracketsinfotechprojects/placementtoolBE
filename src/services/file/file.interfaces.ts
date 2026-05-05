/**
 * File Service Interfaces
 * Centralized type definitions for file operations
 */

import { EntityType, DocumentType } from '../../entities/file/file.entity';

export interface IUploadFileParams {
  file: Express.Multer.File;
  entity_type: EntityType;
  entity_id: number;
  doc_type: DocumentType;
  expiry_date?: Date;
}

export interface IListFilesParams {
  entity_type?: EntityType;
  entity_id?: number;
  doc_type?: DocumentType;
  is_active?: boolean;
  limit?: number;
  page?: number;
}

export interface IUploadMultipleFilesParams {
  files: Express.Multer.File[];
  entity_type: EntityType;
  entity_id: number;
  doc_type: DocumentType;
  expiry_date?: Date;
}

export interface IFileStatistics {
  total_files: number;
  active_files: number;
  inactive_files: number;
  total_size_mb: number;
  by_entity_type?: Record<string, number>;
  by_doc_type?: Record<string, number>;
}
