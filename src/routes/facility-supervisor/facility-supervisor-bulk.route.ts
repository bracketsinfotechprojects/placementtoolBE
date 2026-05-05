import express from 'express';
import FacilitySupervisorController from '../../controllers/facility-supervisor/facility-supervisor.controller';
import { upload } from '../../configs/multer.config';

const router = express.Router();

// Template download
router.get('/template', FacilitySupervisorController.downloadTemplate);

// Bulk upload
router.post('/bulk-upload', upload.single('file'), FacilitySupervisorController.bulkUpload);

export default router;
