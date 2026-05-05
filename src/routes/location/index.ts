import { Router } from 'express';
import facilitiesRoutes from './location-facilities.route';
import studentsRoutes from './location-students.route';

const router = Router();

// Mount all sub-routes
router.use('/', facilitiesRoutes);
router.use('/', studentsRoutes);

export default router;
