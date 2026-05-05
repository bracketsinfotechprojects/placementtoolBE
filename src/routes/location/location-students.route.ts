import { Router } from 'express';
import LocationController from '../../controllers/location/location.controller';

const router = Router();

// Students nearby coordinates
router.get('/students/nearby', LocationController.getStudentsNearby);

// Students near facility
router.get('/facilities/:facilityId/nearby-students', LocationController.getStudentsNearFacility);

export default router;
