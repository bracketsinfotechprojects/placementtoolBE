import { Router } from 'express';
import TrainerController from '../../controllers/trainer/trainer.controller';
import { upload } from '../../configs/multer.config';

const router = Router();

/**
 * Trainer Bulk Operations Routes
 * Bulk upload, template download
 */

// Bulk upload trainers from Excel
router.post('/bulk-upload', upload.single('file'), TrainerController.bulkUpload);

// Download Excel template
router.get('/template', TrainerController.downloadTemplate);

export default router;
