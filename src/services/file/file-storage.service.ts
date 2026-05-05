/**
 * File Storage Service
 * Handles file system operations
 */

import * as fs from 'fs';
import * as path from 'path';
import { EntityType } from '../../entities/file/file.entity';

class FileStorageService {
  /**
   * Generate folder path based on entity type and ID
   */
  generateFolderPath(entityType: EntityType, entityId: number): string {
    const baseUploadPath = 'uploads';
    const entityFolder = entityType.toLowerCase().replace(/_/g, '-');
    return path.join(baseUploadPath, entityFolder, entityId.toString());
  }

  /**
   * Generate secure filename
   */
  generateSecureFilename(originalFilename: string, docType: string): string {
    const ext = path.extname(originalFilename).toLowerCase();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const sanitizedDocType = docType.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${sanitizedDocType}_${timestamp}_${randomString}${ext}`;
  }

  /**
   * Ensure directory exists
   */
  ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
    }
  }

  /**
   * Move file from temp to permanent location
   */
  moveFile(sourcePath: string, destinationPath: string): void {
    fs.renameSync(sourcePath, destinationPath);
    fs.chmodSync(destinationPath, 0o644);
  }

  /**
   * Delete file from filesystem
   */
  deleteFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  /**
   * Check if file exists
   */
  fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  /**
   * Get file stats
   */
  getFileStats(filePath: string): fs.Stats | null {
    try {
      return fs.statSync(filePath);
    } catch (error) {
      return null;
    }
  }
}

export default new FileStorageService();
