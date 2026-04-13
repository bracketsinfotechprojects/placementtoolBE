import express from 'express';
import FacilitySupervisorController from '../../controllers/facility-supervisor/facility-supervisor.controller';
import { upload } from '../../configs/multer.config';

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
 *     summary: Create new facility supervisor with optional documents
 *     description: |
 *       Create a new facility supervisor with optional file uploads.
 *       Files are stored in the files table with proper entity association.
 *       
 *       **File Uploads:**
 *       - photograph: Profile photo (JPEG, PNG, GIF, WebP)
 *       - id_proof_document: ID proof document (PDF, Image, Word)
 *       - police_check_document: Police verification document (PDF, Image, Word)
 *       - authorization_letter_document: Authorization letter (PDF, Image, Word)
 *       
 *       All files are saved to the files table with entity_type = 'facility_supervisor'
 *     tags:
 *       - Facility Supervisors
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *                 format: binary
 *                 description: Photograph file (JPEG, PNG, GIF, WebP)
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
 *                 format: binary
 *                 description: ID proof document file (PDF, Image, Word)
 *               police_check_document:
 *                 type: string
 *                 format: binary
 *                 description: Police check document file (PDF, Image, Word)
 *               authorization_letter_document:
 *                 type: string
 *                 format: binary
 *                 description: Authorization letter document file (PDF, Image, Word)
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
 *                     description: User ID for login
 *                     example: "atul.dhuri"
 *                   password:
 *                     type: string
 *                     description: Password for login
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
 *                   example: "Facility Supervisor created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     supervisor_id:
 *                       type: integer
 *                       example: 1
 *                     full_name:
 *                       type: string
 *                       example: "Atul Dhuri"
 *                     photograph:
 *                       type: string
 *                       example: "uploads/facility_supervisors/1/PHOTOGRAPH_1234567890.jpg"
 *                     id_proof_document:
 *                       type: string
 *                       example: "uploads/facility_supervisors/1/ID_PROOF_1234567890.pdf"
 *                     police_check_document:
 *                       type: string
 *                       example: "uploads/facility_supervisors/1/POLICE_CHECK_1234567890.pdf"
 *                     authorization_letter_document:
 *                       type: string
 *                       example: "uploads/facility_supervisors/1/AUTHORIZATION_LETTER_1234567890.pdf"
 *                     uploaded_files:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           entity_type:
 *                             type: string
 *                           entity_id:
 *                             type: integer
 *                           doc_type:
 *                             type: string
 *                           file_path:
 *                             type: string
 *                           file_name:
 *                             type: string
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 */
router.post('/', upload.fields([
  { name: 'photograph', maxCount: 1 },
  { name: 'id_proof_document', maxCount: 1 },
  { name: 'police_check_document', maxCount: 1 },
  { name: 'authorization_letter_document', maxCount: 1 }
]), FacilitySupervisorController.create);

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
 *     summary: Update facility supervisor with optional file uploads
 *     description: |
 *       Update facility supervisor information with support for file uploads.
 *       Only upload new files if provided in the request.
 *       If a new file is uploaded, the old file will be deactivated.
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
 *         multipart/form-data:
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
 *                 format: binary
 *                 description: New photograph file (optional)
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
 *                 format: binary
 *                 description: New ID proof document file (optional)
 *               police_check_document:
 *                 type: string
 *                 format: binary
 *                 description: New police check document file (optional)
 *               authorization_letter_document:
 *                 type: string
 *                 format: binary
 *                 description: New authorization letter document file (optional)
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
router.put('/:id', upload.fields([
  { name: 'photograph', maxCount: 1 },
  { name: 'id_proof_document', maxCount: 1 },
  { name: 'police_check_document', maxCount: 1 },
  { name: 'authorization_letter_document', maxCount: 1 }
]), FacilitySupervisorController.update);

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
