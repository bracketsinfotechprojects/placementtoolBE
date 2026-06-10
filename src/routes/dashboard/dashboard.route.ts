import * as express from 'express';
import DashboardController from '../../controllers/dashboard/dashboard.controller';

const router = express.Router();

/**
 * @swagger
 * /api/dashboard/admin-stats:
 *   get:
 *     summary: Get admin/PE dashboard stats
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalStudents:
 *                   type: integer
 *                 facilityCount:
 *                   type: integer
 *                 trainerCount:
 *                   type: integer
 *                 slotsAvailable:
 *                   type: integer
 *                 trainingSlots:
 *                   type: integer
 *                 slotsBooked:
 *                   type: integer
 *                 internshipAmountPaid:
 *                   type: number
 *                 activeInterns:
 *                   type: integer
 */
router.get('/admin-stats', DashboardController.getAdminStats);

export default router;
