import express from 'express';
import FacilitySupervisorController from '../../controllers/facility-supervisor/facility-supervisor.controller';
import { upload } from '../../configs/multer.config';

const router = express.Router();

/**
 * @swagger
 * /api/facility-supervisors/students/booked:
 *   get:
 *     summary: Get all students who booked placement slots for facility/supervisor
 *     description: |
 *       Retrieve all students assigned to placement slots for the authenticated facility or supervisor.
 *       
 *       **Access Control:**
 *       - Facility users (roleID: 2) - Can view students for their linked facility
 *       - Facility Supervisors (roleID: 3) - Can view students for their assigned facility
 *       - Optional: Pass facility_id to override and view students for a different facility (if authorized)
 *       
 *       **Response Fields:**
 *       - assignment_id: Unique assignment identifier
 *       - student_id: Student ID
 *       - first_name: Student first name
 *       - last_name: Student last name
 *       - status: Student status
 *       - assignment_status: Assignment status (Assigned, Active, Completed, Cancelled, Dropped, Allocated, Started)
 *       - student_type: Type of student
 *       - email: Student email
 *       - primary_mobile: Student mobile number
 *       - course_applicable: Applicable courses (JSON array)
 *       - placement_start_date: Placement slot start date
 *       - placement_end_date: Placement slot end date
 *       - start_date: Actual assignment start date
 *       - end_date: Actual assignment end date
 *       - placementslot_id: Placement slot ID
 *       - remaining_seats: Remaining seats in the slot
 *       - facility_id: Facility ID
 *     tags:
 *       - Facility Supervisors
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: facility_id
 *         schema:
 *           type: integer
 *         description: Optional - Facility ID to filter students (if not provided, uses authenticated user's facility)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by student status
 *       - in: query
 *         name: assignment_status
 *         schema:
 *           type: string
 *           enum: [Assigned, Active, Completed, Cancelled, Dropped, Allocated, Started]
 *         description: Filter by assignment status
 *       - in: query
 *         name: student_type
 *         schema:
 *           type: string
 *         description: Filter by student type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by student name or email
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of records per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
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
 *                   example: "Students retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       assignment_id:
 *                         type: integer
 *                         example: 1
 *                       student_id:
 *                         type: integer
 *                         example: 101
 *                       first_name:
 *                         type: string
 *                         example: "John"
 *                       last_name:
 *                         type: string
 *                         example: "Doe"
 *                       status:
 *                         type: string
 *                         example: "Active"
 *                       assignment_status:
 *                         type: string
 *                         example: "Allocated"
 *                       student_type:
 *                         type: string
 *                         example: "Domestic"
 *                       email:
 *                         type: string
 *                         example: "john@example.com"
 *                       primary_mobile:
 *                         type: string
 *                         example: "0412345678"
 *                       course_applicable:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["First Aid", "Manual Handling"]
 *                       placement_start_date:
 *                         type: string
 *                         format: date
 *                         example: "2026-06-01"
 *                       placement_end_date:
 *                         type: string
 *                         format: date
 *                         example: "2026-08-31"
 *                       start_date:
 *                         type: string
 *                         format: date
 *                         example: "2026-06-01"
 *                       end_date:
 *                         type: string
 *                         format: date
 *                         example: "2026-08-31"
 *                       placementslot_id:
 *                         type: integer
 *                         example: 5
 *                       remaining_seats:
 *                         type: integer
 *                         example: 3
 *                       facility_id:
 *                         type: string
 *                         example: "1"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                       example: 50
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only Facility or Supervisor users can access this endpoint
 */
router.get('/students/booked', FacilitySupervisorController.getStudentsByFacility);

/**
 * @swagger
 * /api/facility-supervisors/template:
 *   get:
 *     summary: Download Excel template for bulk upload
 *     tags:
 *       - Facility Supervisors
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Excel template file
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 */
router.get('/template', FacilitySupervisorController.downloadTemplate);

/**
 * @swagger
 * /api/facility-supervisors/bulk-upload:
 *   post:
 *     summary: Bulk upload facility supervisors from Excel file
 *     description: |
 *       Upload multiple facility supervisors at once using an Excel file.
 *       
 *       **Features:**
 *       - Upload up to 2,000 facility supervisors per file
 *       - All-or-nothing transaction (if any record fails, all changes are rolled back)
 *       - Duplicate detection (within file and database)
 *       - Detailed per-row error reporting
 *       - Automatic password hashing
 *       
 *       **Required Excel Columns:**
 *       - full_name
 *       - designation
 *       - mobile_number
 *       - facility_id (numeric)
 *       - login_id
 *       - password
 *       
 *       **Optional Excel Columns:**
 *       - email
 *       - facility_name
 *       - branch_site
 *       - facility_types (comma-separated: Aged Care,Disability,Home Care)
 *       - facility_address
 *       - max_students_can_handle (numeric)
 *       - portal_access_enabled (true/false, yes/no, 1/0)
 *       
 *       **Download template first:** GET /api/facility-supervisors/template
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
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file (.xlsx or .xls) with facility supervisor data
 *     responses:
 *       200:
 *         description: Bulk upload completed
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
 *                   example: "Bulk upload completed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     totalRows:
 *                       type: integer
 *                       example: 50
 *                     successCount:
 *                       type: integer
 *                       example: 50
 *                     failureCount:
 *                       type: integer
 *                       example: 0
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           row:
 *                             type: integer
 *                             example: 5
 *                           email:
 *                             type: string
 *                             example: "john@example.com"
 *                           errors:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["email must be a valid email address"]
 *                     createdSupervisors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           supervisor_id:
 *                             type: integer
 *                             example: 1001
 *                           email:
 *                             type: string
 *                             example: "john.supervisor@example.com"
 *                           full_name:
 *                             type: string
 *                             example: "John Supervisor"
 *       400:
 *         description: Bad Request - Validation errors or duplicate data
 *       401:
 *         description: Unauthorized
 */
router.post('/bulk-upload', upload.single('file'), FacilitySupervisorController.bulkUpload);

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
