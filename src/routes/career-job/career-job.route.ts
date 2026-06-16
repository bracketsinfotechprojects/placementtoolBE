import express from 'express';
import CareerJobController from '../../controllers/career-job/career-job.controller';

const router = express.Router();

// List all jobs (admin) — ?is_active=true|false
router.get('/', CareerJobController.list);

// Student: get jobs assigned to a specific student (must be before /:jobId)
router.get('/student/:studentId', CareerJobController.getStudentAssignedJobs);

// Get single job by ID
router.get('/:jobId', CareerJobController.getById);

// Create job
router.post('/', CareerJobController.create);

// Update job
router.put('/:jobId', CareerJobController.update);

// Toggle active/inactive
router.patch('/:jobId/toggle-active', CareerJobController.toggleActive);

// Assign students to a job
router.post('/:jobId/assign-students', CareerJobController.assignStudents);

// Student: submit interest for a job
router.post('/:jobId/interested', CareerJobController.submitInterest);

// Admin: get interested students for a job
router.get('/:jobId/interested-students', CareerJobController.getInterestedStudents);

export default router;
