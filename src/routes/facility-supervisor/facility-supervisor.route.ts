import express from 'express';
import FacilitySupervisorController from '../../controllers/facility-supervisor/facility-supervisor.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Facility Supervisors
 *     description: Facility Supervisor management endpoints
 */

/**
 * @swagger
 * /api/facility-supervisors:
 *   post:
 *     summary: Create new facility supervisor
 *     tags:
 *       - Facility Supervisors
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
 *               - designation
 *               - mobile_number
 *               - facility_id
 *               - login
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: "Atul Dhuri"
 *               designation:
 *                 type: string
 *                 example: "Senior Supervisor"
 *               mobile_number:
 *                 type: string
 *                 example: "09004576271"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "dhuriatu@gmail.com"
 *               photograph:
 *                 type: string
 *                 example: "/uploads/photos/atul-dhuri.jpg"
 *               facility_id:
 *                 type: integer
 *                 example: 1
 *               facility_name:
 *                 type: string
 *                 example: "Disability Center"
 *               branch_site:
 *                 type: string
 *                 example: "Main Branch"
 *               facility_types:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Home Care"]
 *               facility_address:
 *                 type: string
 *                 example: "123 Main St, Sydney NSW 2000"
 *               max_students_can_handle:
 *                 type: integer
 *                 example: 10
 *               id_proof_document:
 *                 type: string
 *                 example: "/uploads/documents/id-proof.pdf"
 *               police_check_document:
 *                 type: string
 *                 example: "/uploads/documents/police-check.pdf"
 *               authorization_letter_document:
 *                 type: string
 *                 example: "/uploads/documents/auth-letter.pdf"
 *               portal_access_enabled:
 *                 type: boolean
 *                 example: true
 *               login:
 *                 type: object
 *                 required:
 *                   - userID
 *                   - password
 *                 properties:
 *                   userID:
 *                     type: string
 *                     example: "atul.dhuri"
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
router.post('/', FacilitySupervisorController.create);

/**
 * @swagger
 * /api/facility-supervisors:
 *   get:
 *     summary: List facility supervisors
 *     tags:
 *       - Facility Supervisors
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search in name, email, mobile number, or designation
 *       - in: query
 *         name: facility_id
 *         schema:
 *           type: integer
 *         description: Filter by facility ID
 *       - in: query
 *         name: portal_access_enabled
 *         schema:
 *           type: boolean
 *         description: Filter by portal access status
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [supervisor_id, full_name, designation, facility_id, createdAt]
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
router.get('/', FacilitySupervisorController.list);

/**
 * @swagger
 * /api/facility-supervisors/{id}:
 *   get:
 *     summary: Get facility supervisor by ID
 *     tags:
 *       - Facility Supervisors
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
router.get('/:id', FacilitySupervisorController.getById);

/**
 * @swagger
 * /api/facility-supervisors/{id}:
 *   put:
 *     summary: Update facility supervisor
 *     tags:
 *       - Facility Supervisors
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
 *               designation:
 *                 type: string
 *               mobile_number:
 *                 type: string
 *               email:
 *                 type: string
 *               photograph:
 *                 type: string
 *               facility_id:
 *                 type: integer
 *               facility_name:
 *                 type: string
 *               branch_site:
 *                 type: string
 *               facility_types:
 *                 type: array
 *                 items:
 *                   type: string
 *               facility_address:
 *                 type: string
 *               max_students_can_handle:
 *                 type: integer
 *               id_proof_document:
 *                 type: string
 *               police_check_document:
 *                 type: string
 *               authorization_letter_document:
 *                 type: string
 *               portal_access_enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not Found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', FacilitySupervisorController.update);

/**
 * @swagger
 * /api/facility-supervisors/{id}:
 *   delete:
 *     summary: Soft delete facility supervisor
 *     tags:
 *       - Facility Supervisors
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
router.delete('/:id', FacilitySupervisorController.delete);

/**
 * @swagger
 * /api/facility-supervisors/{id}/permanent:
 *   delete:
 *     summary: Permanently delete facility supervisor
 *     tags:
 *       - Facility Supervisors
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
router.delete('/:id/permanent', FacilitySupervisorController.permanentlyDelete);

export default router;
