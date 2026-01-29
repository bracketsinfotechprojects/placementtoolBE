import { Router } from 'express';
import ActivationController from '../../controllers/common/activation.controller';

const router = Router();

/**
 * @swagger
 * /api/{tableName}/{id}/activate:
 *   patch:
 *     summary: Generic activation/deactivation endpoint
 *     description: |
 *       Activate or deactivate a record in any supported table by updating the isDeleted flag.
 *       
 *       **Supported Tables:**
 *       - students (also updates users table where roleID=6)
 *       - facilities or facility (also updates users table where roleID=2)
 *       - users (updates only users table)
 *       
 *       **Future Support (when entities are created):**
 *       - supervisors (will update users table where roleID=3)
 *       - placement_executives (will update users table where roleID=4)
 *       - trainers (will update users table where roleID=5)
 *       
 *       **How it works:**
 *       - activate=true → Sets isDeleted = 0 (record is active/visible)
 *       - activate=false → Sets isDeleted = 1 (record is deactivated/hidden)
 *       
 *       **Special Behavior for Role-Based Tables:**
 *       When tableName is a role-based table (students, facilities, supervisors, etc.), 
 *       it also updates the associated user account in the users table by matching:
 *       - students → users.studentID (roleID=6)
 *       - facilities → users.facilityID (roleID=2)
 *       - supervisors → users.supervisorID (roleID=3) [future]
 *       - placement_executives → users.placementExecutiveID (roleID=4) [future]
 *       - trainers → users.trainerID (roleID=5) [future]
 *     tags:
 *       - Common
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tableName
 *         required: true
 *         schema:
 *           type: string
 *         description: |
 *           Name of the table (e.g., students, users, facility)
 *           
 *           Currently supported: students, facility (or facilities), users
 *           Future support: supervisors, placement_executives, trainers
 *         example: facility
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Record ID
 *         example: 123
 *       - in: query
 *         name: activate
 *         required: true
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: |
 *           true = Activate (isDeleted = 0)
 *           false = Deactivate (isDeleted = 1)
 *         example: true
 *     responses:
 *       200:
 *         description: Activation status updated successfully
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
 *                   example: "Student and associated user account activated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Student and associated user account activated successfully"
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: 'Query parameter "activate" is required and must be "true" or "false"'
 *       404:
 *         description: Record not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.patch('/:tableName/:id/activate', ActivationController.toggleActivation);

export default router;
