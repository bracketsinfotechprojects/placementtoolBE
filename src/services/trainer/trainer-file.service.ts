import * as fs from 'fs';
import * as path from 'path';

/**
 * Trainer File Service
 * Handles file upload operations for trainers
 */
class TrainerFileService {
  /**
   * Upload photograph
   */
  async uploadPhotograph(file: Express.Multer.File, trainerId: number): Promise<string> {
    const folderPath = path.join('uploads', 'trainers', trainerId.toString());

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true, mode: 0o755 });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const filename = `photograph_${timestamp}${ext}`;
    const fullPath = path.join(folderPath, filename);

    fs.renameSync(file.path, fullPath);
    fs.chmodSync(fullPath, 0o644);

    return fullPath.replace(/\\/g, '/');
  }

  /**
   * Upload WWC document
   */
  async uploadWWCDocument(file: Express.Multer.File, trainerId: number): Promise<string> {
    const folderPath = path.join('uploads', 'trainers', trainerId.toString());

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true, mode: 0o755 });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const filename = `wwc_check_${timestamp}${ext}`;
    const fullPath = path.join(folderPath, filename);

    fs.renameSync(file.path, fullPath);
    fs.chmodSync(fullPath, 0o644);

    return fullPath.replace(/\\/g, '/');
  }

  /**
   * Upload police check document
   */
  async uploadPoliceCheckDocument(file: Express.Multer.File, trainerId: number): Promise<string> {
    const folderPath = path.join('uploads', 'trainers', trainerId.toString());

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true, mode: 0o755 });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const filename = `police_check_${timestamp}${ext}`;
    const fullPath = path.join(folderPath, filename);

    fs.renameSync(file.path, fullPath);
    fs.chmodSync(fullPath, 0o644);

    return fullPath.replace(/\\/g, '/');
  }

  /**
   * Cleanup photograph
   */
  cleanupPhotograph(photographPath: string) {
    if (photographPath && fs.existsSync(photographPath)) {
      try {
        fs.unlinkSync(photographPath);
        console.log(`✅ Deleted old photograph: ${photographPath}`);
      } catch (error) {
        console.error(`⚠️ Failed to delete photograph: ${error.message}`);
      }
    }
  }

  /**
   * Cleanup document
   */
  cleanupDocument(documentPath: string) {
    if (documentPath && fs.existsSync(documentPath)) {
      try {
        fs.unlinkSync(documentPath);
        console.log(`✅ Deleted old document: ${documentPath}`);
      } catch (error) {
        console.error(`⚠️ Failed to delete document: ${error.message}`);
      }
    }
  }
}

export default new TrainerFileService();
