import { Router } from 'express';
import FacilityController from '../../controllers/facility/facility.controller';
import { uploadMultiple } from '../../configs/multer.config';

const router = Router();

/**
 * Facility CRUD Routes
 * Basic Create, Read, Update, Delete operations
 */

// Create facility
router.post('/', uploadMultiple.any(), FacilityController.create);

// List facilities with pagination
router.get('/', FacilityController.list);

// List facilities (simplified response)
router.get('/simplified', FacilityController.listSimplified);

// Get facility by ID
router.get('/:id', FacilityController.getById);

// Update facility
router.put('/:id', uploadMultiple.any(), FacilityController.update);

// Complete update (replaces all related entities)
router.put('/:id/complete', uploadMultiple.any(), FacilityController.updateComplete);

// Soft delete facility
router.delete('/:id', FacilityController.delete);

// Permanently delete facility
router.delete('/:id/permanent', FacilityController.permanentlyDelete);

export default router;
