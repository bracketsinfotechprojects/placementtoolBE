import * as express from 'express';

// Middleware
import { jwtAuth, adminOnly } from '../middlewares/jwt-auth.middleware';

import defaultRouter from './default/default.route';
import authRouter from './auth/auth.route';
import meRouter from './me/me.route';
import userRouter from './user/user.route';
import studentRouter from './student/student.route';
import facilityRouter from './facility/facility.route';
import facilitySupervisorRouter from './facility-supervisor/facility-supervisor.route';
import placementExecutiveRouter from './placement-executive/placement-executive.route';
import cleanupRouter from './admin/cleanup.route';
import activationRouter from './common/activation.route';
import fileRouter from './file/file.route';

const router = express.Router();

// Public routes (no authentication required)
router.use('/', defaultRouter);
router.use('/auth', authRouter); // Login and register endpoints

// Protected routes (JWT authentication required)
router.use('/me', jwtAuth, meRouter);
router.use('/user', jwtAuth, adminOnly, userRouter); // Admin only
router.use('/students', jwtAuth, studentRouter); // Authenticated users
router.use('/facilities', jwtAuth, facilityRouter); // Authenticated users
router.use('/facility-supervisors', jwtAuth, facilitySupervisorRouter); // Authenticated users
router.use('/placement-executives', jwtAuth, placementExecutiveRouter); // Authenticated users
router.use('/files', jwtAuth, fileRouter); // File upload and management
router.use('/admin/cleanup', jwtAuth, adminOnly, cleanupRouter); // Admin only

// Generic activation route (must be after specific routes to avoid conflicts)
router.use('/', jwtAuth, activationRouter); // Generic activation for any table

export default router;
