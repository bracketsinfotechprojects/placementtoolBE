import { Router } from 'express';
import StudentController from '../../controllers/student/student.controller';

const router = Router();

/**
 * @swagger
 * /api/students:
 *   post:
 *     summary: Create new student
 *     description: Create a new student with all details
 *     tags:
 *       - Students
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
 *               - dob
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               gender:
 *                 type: string
 *               nationality:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', StudentController.create);

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: List students
 *     description: Get paginated list of students with filtering
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Students retrieved successfully
 */
router.get('/', StudentController.list);

/**
 * @swagger
 * /api/students/stats:
 *   get:
 *     summary: Get student statistics
 *     description: Get statistics about students
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/stats', StudentController.getStatistics);

/**
 * @swagger
 * /api/students/advanced-search:
 *   get:
 *     summary: Advanced search students
 *     description: Search students with advanced filters
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: nationality
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/advanced-search', StudentController.advancedSearch);

/**
 * @swagger
 * /api/students/bulk-update-status:
 *   post:
 *     summary: Bulk update student status
 *     description: Update status for multiple students
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               student_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.post('/bulk-update-status', StudentController.bulkUpdateStatus);

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Get student details
 *     description: Retrieve specific student information
 *     tags:
 *       - Students
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
 *         description: Student found
 *       404:
 *         description: Student not found
 */
router.get('/:id', StudentController.detail);

/**
 * @swagger
 * /api/students/{id}:
 *   put:
 *     summary: Update student
 *     description: Update student information
 *     tags:
 *       - Students
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
 *     responses:
 *       200:
 *         description: Student updated successfully
 */
router.put('/:id', StudentController.update);

/**
 * @swagger
 * /api/students/{id}:
 *   delete:
 *     summary: Delete student
 *     description: Soft delete student (mark as inactive)
 *     tags:
 *       - Students
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
 *         description: Student deleted successfully
 */
router.delete('/:id', StudentController.delete);

/**
 * @swagger
 * /api/students/{id}/permanent:
 *   delete:
 *     summary: Permanently delete student
 *     description: Permanently delete student and all related data
 *     tags:
 *       - Students
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
 *         description: Student permanently deleted
 */
router.delete('/:id/permanent', StudentController.permanentlyDelete);

export default router;
