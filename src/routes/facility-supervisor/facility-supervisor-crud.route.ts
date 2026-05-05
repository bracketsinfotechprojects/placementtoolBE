import express from 'express';
import FacilitySupervisorController from '../../controllers/facility-supervisor/facility-supervisor.controller';
import { upload } from '../../configs/multer.config';

const router = express.Router();

// Create
router.post('/', upload.fields([
  { name: 'photograph', maxCount: 1 },
  { name: 'id_proof_document', maxCount: 1 },
  { name: 'police_check_document', maxCount: 1 },
  { name: 'authorization_letter_document', maxCount: 1 }
]), FacilitySupervisorController.create);

// Read
router.get('/', FacilitySupervisorController.list);
router.get('/:id', FacilitySupervisorController.getById);

// Update
router.put('/:id', upload.fields([
  { name: 'photograph', maxCount: 1 },
  { name: 'id_proof_document', maxCount: 1 },
  { name: 'police_check_document', maxCount: 1 },
  { name: 'authorization_letter_document', maxCount: 1 }
]), FacilitySupervisorController.update);

// Delete
router.delete('/:id', FacilitySupervisorController.delete);

export default router;
