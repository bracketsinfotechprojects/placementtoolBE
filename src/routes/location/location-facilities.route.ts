import { Router } from 'express';
import LocationController from '../../controllers/location/location.controller';

const router = Router();

// Facilities nearby coordinates
router.get('/facilities/nearby', LocationController.getFacilitiesNearby);

// Facilities near student
router.get('/students/:studentId/nearby-facilities', LocationController.getFacilitiesNearStudent);

// Facilities with student count
router.get('/facilities-with-student-count', LocationController.getFacilitiesWithStudentCount);

export default router;
