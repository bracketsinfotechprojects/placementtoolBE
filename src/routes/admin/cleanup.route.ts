import express from 'express';
import CleanupController from '../../controllers/admin/cleanup.controller';

const router = express.Router();

/**
 * @swagger
 * /api/admin/cleanup/status:
 *   get:
 *     summary: Get cleanup job status
 *     description: Get the status of the password reset OTP cleanup cron job
 *     tags:
 *       - Admin
 *       - Cleanup
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cleanup job status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Cleanup job status retrieved
 *                 data:
 *                   type: object
 *                   properties:
 *                     running:
 *                       type: boolean
 *                       example: true
 *                     cronExpression:
 *                       type: string
 *                       example: "0 * * * *"
 *                     description:
 *                       type: string
 *                       example: Cleans up expired password reset OTPs every hour
 */
router.get('/status', CleanupController.getStatus);

/**
 * @swagger
 * /api/admin/cleanup/run:
 *   post:
 *     summary: Manually run cleanup job
 *     description: Manually trigger the cleanup of expired password reset OTPs
 *     tags:
 *       - Admin
 *       - Cleanup
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cleanup completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Cleanup completed. 5 expired OTP(s) deleted
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCount:
 *                       type: integer
 *                       example: 5
 */
router.post('/run', CleanupController.runCleanup);

export default router;
