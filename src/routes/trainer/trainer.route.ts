import express from 'express';
import TrainerController from '../../controllers/trainer/trainer.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Trainers
 *     description: Trainer management endpoints
 */

/**
 * @swagger
 * /api/trainers:
 *   post:
 *     summary: Create new trainer
 *     tags:
 *       - Trainers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - gender
 *               - date_of_birth
 *               - mobile_number
 *               - email
 *               - login
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 example: "Doe"
 *               gender:
 *                 type: string
 *                 example: "Male"
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-15"
 *               mobile_number:
 *                 type: string
 *                 example: "0912345678"
 *               alternate_contact:
 *                 type: string
 *                 example: "0912345679"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               trainer_type:
 *                 type: string
 *                 example: "Full-time"
 *               course_auth:
 *                 type: string
 *                 example: "CHC33021 - Certificate III in Individual Support"
 *               acc_numbers:
 *                 type: string
 *                 example: "ACC123456"
 *               yoe:
 *                 type: integer
 *                 example: 5
 *               state_covered:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["NSW", "VIC"]
 *               cities_covered:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Sydney", "Melbourne"]
 *               available_days:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Monday", "Tuesday", "Wednesday"]
 *               time_slots:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["09:00-12:00", "14:00-17:00"]
 *               suprise_visit:
 *                 type: boolean
 *                 example: true
 *               photograph:
 *                 type: string
 *                 example: "/uploads/photos/john-doe.jpg"
 *               login:
 *                 type: object
 *                 required:
 *                   - userID
 *                   - password
 *                 properties:
 *                   userID:
 *                     type: string
 *                     example: "john.doe"
 *                   password:
 *                     type: string
 *                     example: "SecurePass123"
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 */
router.post('/', TrainerController.create);

/**
 * @swagger
 * /api/trainers:
 *   get:
 *     summary: List trainers
 *     tags:
 *       - Trainers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search in name, email, or mobile number
 *       - in: query
 *         name: trainer_type
 *         schema:
 *           type: string
 *         description: Filter by trainer type
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [trainer_id, first_name, last_name, email, createdAt]
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
 *       401:
 *         description: Unauthorized
 */
router.get('/', TrainerController.list);

/**
 * @swagger
 * /api/trainers/{id}:
 *   get:
 *     summary: Get trainer by ID
 *     tags:
 *       - Trainers
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
router.get('/:id', TrainerController.getById);

/**
 * @swagger
 * /api/trainers/{id}:
 *   put:
 *     summary: Update trainer
 *     tags:
 *       - Trainers
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
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               gender:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               mobile_number:
 *                 type: string
 *               alternate_contact:
 *                 type: string
 *               email:
 *                 type: string
 *               trainer_type:
 *                 type: string
 *               course_auth:
 *                 type: string
 *               acc_numbers:
 *                 type: string
 *               yoe:
 *                 type: integer
 *               state_covered:
 *                 type: array
 *                 items:
 *                   type: string
 *               cities_covered:
 *                 type: array
 *                 items:
 *                   type: string
 *               available_days:
 *                 type: array
 *                 items:
 *                   type: string
 *               time_slots:
 *                 type: array
 *                 items:
 *                   type: string
 *               suprise_visit:
 *                 type: boolean
 *               photograph:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not Found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', TrainerController.update);

/**
 * @swagger
 * /api/trainers/{id}:
 *   delete:
 *     summary: Soft delete trainer
 *     tags:
 *       - Trainers
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
router.delete('/:id', TrainerController.delete);

/**
 * @swagger
 * /api/trainers/{id}/permanent:
 *   delete:
 *     summary: Permanently delete trainer
 *     tags:
 *       - Trainers
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
router.delete('/:id/permanent', TrainerController.permanentlyDelete);

export default router;
