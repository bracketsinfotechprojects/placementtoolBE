import { Router } from 'express';
import FacilityController from '../../controllers/facility/facility.controller';
import { uploadMultiple } from '../../configs/multer.config';

const router = Router();

/**
 * Facility Bulk Operations Routes
 * Bulk upload from Excel
 */

// Bulk upload facilities from Excel
router.post('/bulk-upload', uploadMultiple.single('file'), FacilityController.bulkUpload);

export default router;
