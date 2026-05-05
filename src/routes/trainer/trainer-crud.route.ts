import { Router } from 'express';
import TrainerController from '../../controllers/trainer/trainer.controller';
import { upload } from '../../configs/multer.config';

const router = Router();

/**
 * Trainer CRUD Routes
 * Basic Create, Read, Update, Delete operations
 */

// Create trainer with file uploads
router.post('/', upload.fields([
  { name: 'photograph', maxCount: 1 },
  { name: 'wwcDocument', maxCount: 1 },
  { name: 'policeCheckDocument', maxCount: 1 }
]), TrainerController.create);

// List trainers with pagination
router.get('/', TrainerController.list);

// Get trainer by ID
router.get('/:id', TrainerController.getById);

// Update trainer with file uploads
router.put('/:id', upload.fields([
  { name: 'photograph', maxCount: 1 },
  { name: 'wwcDocument', maxCount: 1 },
  { name: 'policeCheckDocument', maxCount: 1 }
]), TrainerController.update);

// Soft delete trainer
router.delete('/:id', TrainerController.delete);

// Permanently delete trainer
router.delete('/:id/permanent', TrainerController.permanentlyDelete);

export default router;
