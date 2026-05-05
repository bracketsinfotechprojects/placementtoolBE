import { Router } from 'express';
import StudentController from '../../controllers/student/student.controller';
import { upload } from '../../configs/multer.config';

const router = Router();

/**
 * Student Bulk Operations Routes
 * Bulk upload, bulk status update, template download
 */

// Bulk update status
router.post('/bulk-update-status', StudentController.bulkUpdateStatus);

// Bulk upload students from Excel
router.post('/bulk-upload', upload.single('file'), StudentController.bulkUpload);

// Download Excel template
router.get('/template', StudentController.downloadTemplate);

export default router;
