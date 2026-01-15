import * as express from 'express';

// Middleware
import { jwtAuth, adminOnly } from '../middlewares/jwt-auth.middleware';

import defaultRouter from './default/default.route';
import authRouter from './auth/auth.route';
import meRouter from './me/me.route';
import userRouter from './user/user.route';
import studentRouter from './student/student.route';
import facilityRouter from './facility/facility.route';
import cleanupRouter from './admin/cleanup.route';

const router = express.Router();

// Public routes (no authentication required)
router.use('/', defaultRouter);
router.use('/auth', authRouter); // Login and register endpoints

// Protected routes (JWT authentication required)
router.use('/me', jwtAuth, meRouter);
router.use('/user', jwtAuth, adminOnly, userRouter); // Admin only
router.use('/students', jwtAuth, studentRouter); // Authenticated users
router.use('/facilities', jwtAuth, facilityRouter); // Authenticated users
router.use('/admin/cleanup', jwtAuth, adminOnly, cleanupRouter); // Admin only

export default router;
