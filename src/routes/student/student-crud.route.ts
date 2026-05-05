import { Router } from 'express';
import StudentController from '../../controllers/student/student.controller';

const router = Router();

/**
 * Student CRUD Routes
 * Basic Create, Read, Update, Delete operations
 */

// Create student
router.post('/', StudentController.create);

// Create external student (no user account)
router.post('/external', StudentController.createExternal);

// List students with pagination
router.get('/', StudentController.list);

// Get students list with specific fields
router.get('/list', StudentController.getStudentsList);

// Get student statistics
router.get('/stats', StudentController.getStatistics);

// Advanced search
router.get('/advanced-search', StudentController.advancedSearch);

// Get all student details (comprehensive)
router.get('/:id/all-details', StudentController.getAllDetails);

// Get student by ID
router.get('/:id', StudentController.detail);

// Update student
router.put('/:id', StudentController.update);

// Soft delete student
router.delete('/:id', StudentController.delete);

// Permanently delete student
router.delete('/:id/permanent', StudentController.permanentlyDelete);

export default router;
