import express from 'express';
import PlacementExecutiveController from '../../controllers/placement-executive/placement-executive.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Placement Executives
 *     description: Placement Executive management endpoints
 */

/**
 * @swagger
 * /api/placement-executives:
 *   post:
 *     summary: Create new placement executive
 *     tags:
 *       - Placement Executives
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - mobile_number
 *               - joining_date
 *               - employment_type
 *               - login
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: "John Smith"
 *               mobile_number:
 *                 type: string
 *                 example: "0412345678"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.smith@example.com"
 *               photograph:
 *                 type: string
 *                 example: "/uploads/photos/john-smith.jpg"
 *               joining_date:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               employment_type:
 *                 type: string
 *                 enum: [full-time, part-time, contract]
 *                 example: "full-time"
 *               facility_types_handled:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Aged Care", "Disability"]
 *               login:
 *                 type: object
 *                 required:
 *                   - userID
 *                   - password
 *                 properties:
 *                   userID:
 *                     type: string
 *                     example: "john.smith"
 *                   password:
 *                     type: string
 *                     example: "SecurePass123"
 *     responses:
 *       201:
 *         description: Created
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
 *                   example: "Placement Executive created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     executive_id:
 *                       type: integer
 *                       example: 1
 *                     full_name:
 *                       type: string
 *                       example: "John Smith"
 *                     mobile_number:
 *                       type: string
 *                       example: "0412345678"
 *                     email:
 *                       type: string
 *                       example: "john.smith@example.com"
 *                     joining_date:
 *                       type: string
 *                       format: date
 *                       example: "2024-01-15"
 *                     employment_type:
 *                       type: string
 *                       example: "full-time"
 *                     facility_types_handled:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Aged Care", "Disability"]
 *                     user_id:
 *                       type: integer
 *                       example: 10
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 */
router.post('/', PlacementExecutiveController.create);

/**
 * @swagger
 * /api/placement-executives:
 *   get:
 *     summary: List placement executives
 *     tags:
 *       - Placement Executives
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search in name, email, or mobile number
 *       - in: query
 *         name: employment_type
 *         schema:
 *           type: string
 *           enum: [full-time, part-time, contract]
 *         description: Filter by employment type
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [executive_id, full_name, joining_date, employment_type, createdAt]
 *           default: createdAt
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Success
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
 *                   example: "Placement Executives retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/', PlacementExecutiveController.list);

/**
 * @swagger
 * /api/placement-executives/{id}:
 *   get:
 *     summary: Get placement executive by ID
 *     tags:
 *       - Placement Executives
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
 *         description: Success
 *       404:
 *         description: Not Found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', PlacementExecutiveController.getById);

/**
 * @swagger
 * /api/placement-executives/{id}:
 *   put:
 *     summary: Update placement executive
 *     tags:
 *       - Placement Executives
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
 *               full_name:
 *                 type: string
 *                 example: "John Smith Updated"
 *               mobile_number:
 *                 type: string
 *                 example: "0412345679"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.smith.updated@example.com"
 *               photograph:
 *                 type: string
 *                 example: "/uploads/photos/john-smith-new.jpg"
 *               joining_date:
 *                 type: string
 *                 format: date
 *                 example: "2024-02-01"
 *               employment_type:
 *                 type: string
 *                 enum: [full-time, part-time, contract]
 *                 example: "part-time"
 *               facility_types_handled:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Aged Care", "Home Care"]
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not Found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', PlacementExecutiveController.update);

/**
 * @swagger
 * /api/placement-executives/{id}:
 *   delete:
 *     summary: Soft delete placement executive
 *     tags:
 *       - Placement Executives
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
 *         description: Deleted
 *       404:
 *         description: Not Found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', PlacementExecutiveController.delete);

/**
 * @swagger
 * /api/placement-executives/{id}/permanent:
 *   delete:
 *     summary: Permanently delete placement executive
 *     tags:
 *       - Placement Executives
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
 *         description: Permanently Deleted
 *       404:
 *         description: Not Found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id/permanent', PlacementExecutiveController.permanentlyDelete);

export default router;
