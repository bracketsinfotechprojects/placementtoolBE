import express from 'express';

// Controller
import AuthController from '../../controllers/auth/auth.controller';

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email and password, returns JWT token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - loginID
 *               - password
 *             properties:
 *               loginID:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: test123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                     expiresIn:
 *                       type: integer
 *                     tokenType:
 *                       type: string
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', AuthController.login);

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify JWT token
 *     description: Verify if JWT token is valid
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     loginID:
 *                       type: string
 *                     roleID:
 *                       type: integer
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Invalid or expired token
 */
router.post('/verify', AuthController.verifyToken);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh JWT token
 *     description: Get a new JWT token using current token
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Invalid or expired token
 */
router.post('/refresh', AuthController.refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logout user (remove token on client side)
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/logout', AuthController.logout);

export default router;
