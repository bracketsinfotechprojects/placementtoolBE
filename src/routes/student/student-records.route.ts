import { Router } from 'express';
import StudentController from '../../controllers/student/student.controller';

const router = Router();

/**
 * Student Records Routes
 * Facility records, address changes, job status, self-placements
 */

// Add facility record
router.post('/:studentId/facility-records', StudentController.addFacilityRecord);

// Add address change request
router.post('/:studentId/address-change-requests', StudentController.addAddressChangeRequest);

// Add job status update
router.post('/:studentId/job-status-updates', StudentController.addJobStatusUpdate);

// Add self placement
router.post('/:studentId/self-placements', StudentController.addSelfPlacement);

// Update address change request
router.put('/:studentId/address-change-requests/:acrId', StudentController.updateAddressChangeRequest);

// Update job status update
router.put('/:studentId/job-status-updates/:jsuId', StudentController.updateJobStatusUpdate);

// Update self placement
router.put('/:studentId/self-placements/:placementId', StudentController.updateSelfPlacement);

export default router;
