import express from 'express';

// Controller
import userController from '../../controllers/user/user.controller';

const router = express.Router();

/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: Get current user profile
 *     description: Get the profile of the currently authenticated user
 *     tags:
 *       - Me (Current User)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/', (req, res) => {
  res.json({ message: 'Me endpoint - authentication not implemented' });
});

/**
 * @swagger
 * /api/me:
 *   put:
 *     summary: Update current user profile
 *     description: Update the profile of the currently authenticated user
 *     tags:
 *       - Me (Current User)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated
 *       401:
 *         description: Unauthorized
 */
router.put('/', (req, res) => {
  res.json({ message: 'Update me endpoint - authentication not implemented' });
});

/**
 * @swagger
 * /api/me/change-password:
 *   put:
 *     summary: Change my password
 *     description: Change password for the currently authenticated user (students, admins, all users)
 *     tags:
 *       - Me (Current User)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *               - new_password
 *             properties:
 *               current_password:
 *                 type: string
 *                 description: Current password
 *                 example: "OldPassword123"
 *               new_password:
 *                 type: string
 *                 description: New password (minimum 6 characters)
 *                 example: "NewPassword456"
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                   example: "Password changed successfully"
 *       400:
 *         description: Bad request (invalid input or current password incorrect)
 *       401:
 *         description: Unauthorized (not logged in or invalid token)
 *       404:
 *         description: User not found
 */
router.put('/change-password', userController.changePassword);

export default router;
