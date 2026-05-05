import * as fs from 'fs';
import * as path from 'path';

/**
 * Placement Executive File Service
 * Handles file upload operations for placement executives
 */
class PlacementExecutiveFileService {
  /**
   * Upload photograph
   */
  async uploadPhotograph(file: Express.Multer.File, executiveId: number): Promise<string> {
    const folderPath = path.join('uploads', 'placement_executives', executiveId.toString());

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
}

export default new PlacementExecutiveFileService();
