import express from 'express';
import FacilitySupervisorController from '../../controllers/facility-supervisor/facility-supervisor.controller';

const router = express.Router();

// Permanent delete
router.delete('/:id/permanent', FacilitySupervisorController.permanentlyDelete);

export default router;
