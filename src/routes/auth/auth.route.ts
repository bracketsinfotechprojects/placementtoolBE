import express from 'express';
const schemaValidator = require('express-joi-validator');

// Controllers
import AuthController from '../../controllers/auth/auth.controller';
import PasswordResetController from '../../controllers/auth/password-reset.controller';

// Validation
import passwordResetSchema from '../../validations/schemas/password-reset.schema';

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

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset (Email OTP)
 *     description: |
 *       Generate a 6-digit OTP for password reset and send it via email.
 *       - OTP is valid for 5 minutes
 *       - Email is sent to the user's registered email address (loginID)
 *       - Previous OTPs for the user are invalidated
 *       - In development mode, OTP is also returned in the response for testing
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
 *             properties:
 *               loginID:
 *                 type: string
 *                 format: email
 *                 description: User's email address (registered loginID)
 *                 example: dhuriatu@gmail.com
 *     responses:
 *       200:
 *         description: OTP generated and email sent successfully
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
 *                   example: Password reset OTP has been sent to your registered email
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Password reset OTP has been sent to your registered email
 *                     otp:
 *                       type: string
 *                       description: 6-digit OTP (only returned in development mode)
 *                       example: "123456"
 *                 response_time_ms:
 *                   type: integer
 *                   example: 56
 *       400:
 *         description: Bad request - User not found or account inactive
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
 *                       example: User not found
 *       500:
 *         description: Server error
 */
router.post('/forgot-password', schemaValidator(passwordResetSchema.requestPasswordReset), PasswordResetController.requestPasswordReset);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP (Optional Step)
 *     description: |
 *       Verify the OTP sent via email for password reset.
 *       - This is an optional step before resetting the password
 *       - OTP must be exactly 6 digits
 *       - OTP must not be expired (valid for 5 minutes)
 *       - OTP is not deleted after verification (only after password reset)
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
 *               - otp
 *             properties:
 *               loginID:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: dhuriatu@gmail.com
 *               otp:
 *                 type: string
 *                 pattern: '^[0-9]{6}$'
 *                 description: 6-digit OTP received via email
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
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
 *                   example: OTP verified successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: OTP verified successfully
 *                     valid:
 *                       type: boolean
 *                       example: true
 *                 response_time_ms:
 *                   type: integer
 *                   example: 10
 *       400:
 *         description: Invalid or expired OTP
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
 *                       example: Invalid or expired OTP
 */
router.post('/verify-otp', schemaValidator(passwordResetSchema.verifyOTP), PasswordResetController.verifyOTP);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with OTP
 *     description: |
 *       Reset user password using the OTP received via email.
 *       - OTP must be valid and not expired (5 minutes validity)
 *       - New password must be at least 8 characters long
 *       - After successful reset, all OTPs for the user are deleted
 *       - User can login with the new password immediately
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
 *               - otp
 *               - newPassword
 *             properties:
 *               loginID:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: dhuriatu@gmail.com
 *               otp:
 *                 type: string
 *                 pattern: '^[0-9]{6}$'
 *                 description: 6-digit OTP received via email
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *                 description: New password (minimum 8 characters)
 *                 example: newSecurePassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
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
 *                   example: Password has been reset successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Password has been reset successfully
 *                 response_time_ms:
 *                   type: integer
 *                   example: 375
 *       400:
 *         description: Invalid request, expired OTP, or weak password
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
 *                       example: Invalid or expired OTP
 *       500:
 *         description: Server error
 */
router.post('/reset-password', schemaValidator(passwordResetSchema.resetPassword), PasswordResetController.resetPassword);

export default router;
