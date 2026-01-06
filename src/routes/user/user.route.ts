import express from 'express';
const schemaValidator = require('express-joi-validator');

// Controller
import userController from '../../controllers/user/user.controller';

// Schema
import userSchema from '../../validations/schemas/user.schema';

// Middleware
import { isAdmin } from '../../middlewares/permission-handler.middleware';
import { validateUserRole } from '../../middlewares/role-validator.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Create new user
 *     description: Create a new user account (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
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
 *               password:
 *                 type: string
 *               userRole:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  isAdmin(),
  schemaValidator(userSchema.createUser),
  validateUserRole, // Dynamic role validation from database
  userController.create,
);

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: List all users
 *     description: Get paginated list of users with filtering
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  userController.list,
);

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve specific user information
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
router.get(
  '/:id',
  userController.getById,
);

/**
 * @swagger
 * /api/user/{id}:
 *   put:
 *     summary: Update user
 *     description: Update user information (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               loginID:
 *                 type: string
 *               password:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/:id',
  isAdmin(),
  schemaValidator(userSchema.updateUser),
  validateUserRole, // Dynamic role validation from database
  userController.update,
);

/**
 * @swagger
 * /api/user/{id}:
 *   delete:
 *     summary: Delete user
 *     description: Soft delete user (mark as inactive)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete(
  '/:id',
  isAdmin(),
  userController.delete,
);

export default router;
