import express from 'express';
import FacilitySupervisorController from '../../controllers/facility-supervisor/facility-supervisor.controller';
import FacilitySupervisorComplaintController from '../../controllers/complaint/facility-supervisor-complaint.controller';
import { upload } from '../../configs/multer.config';
import { authorizeRoles } from '../../middlewares/permission-handler.middleware';

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
 *       Upload multiple facility supervisors at once using an Excel file, all assigned to a single facility.
 *
 *       **Features:**
 *       - Upload up to 2,000 facility supervisors per file
 *       - All-or-nothing transaction (if any record fails, all changes are rolled back)
 *       - Duplicate detection (within file and database)
 *       - Detailed per-row error reporting
 *       - Automatic password hashing
 *
 *       **facility_id** is passed as a separate form field (select the facility in the UI first) and applies to every row in the file — it is not a column in the Excel sheet.
 *
 *       **Required Excel Columns:**
 *       - full_name
 *       - designation
 *       - mobile_number
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
 *               - facility_id
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file (.xlsx or .xls) with facility supervisor data
 *               facility_id:
 *                 type: integer
 *                 description: Facility ID that all uploaded supervisors will be linked to
 *                 example: 1
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

/**
 * @swagger
 * /api/facility-supervisors/{facilityId}/supervisor-complaints:
 *   post:
 *     summary: Create a new facility supervisor complaint against student
 *     description: |
 *       Create a new complaint regarding student misconduct or issues. 
 *       Can be used by both Facility users and Supervisors.
 *       Supports file attachments (PDF, DOC, DOCX, JPG, PNG - max 10MB each).
 *       Files are stored in /uploads/complaints/{facilityId}/ directory.
 *       If is_anonymous is true, supervisor_id will not be included in response.
 *     tags:
 *       - Facility Supervisor Complaints
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Facility ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - student_id
 *               - student_name
 *               - complaint_type
 *               - urgency_level
 *               - location
 *               - description
 *             properties:
 *               supervisor_id:
 *                 type: integer
 *                 description: ID of the supervisor raising the complaint (optional - for supervisors only)
 *                 example: 10
 *               student_id:
 *                 type: integer
 *                 description: ID of the student being complained against
 *                 example: 123
 *               student_name:
 *                 type: string
 *                 description: Name of the student being complained against
 *                 example: "John Doe"
 *               complaint_type:
 *                 type: string
 *                 description: Type of complaint
 *                 example: "Misconduct"
 *               urgency_level:
 *                 type: string
 *                 description: Urgency level
 *                 example: "High"
 *               location:
 *                 type: string
 *                 description: Location where the incident occurred
 *                 example: "Building A, Room 203"
 *               description:
 *                 type: string
 *                 description: Detailed description of the complaint
 *                 example: "Student was disruptive during class"
 *               is_anonymous:
 *                 type: boolean
 *                 description: Whether to report anonymously (supervisor_id won't be in response)
 *                 example: false
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: File attachments (max 5 files, 10MB each)
 *     responses:
 *       201:
 *         description: Complaint created successfully
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
 *                   example: "Complaint created successfully"
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Facility or student not found
 */

/**
 * @swagger
 * /api/facility-supervisors/{facilityId}/supervisor-complaints/{complaintId}:
 *   get:
 *     summary: Get complaint by ID
 *     description: Retrieve a specific complaint by its ID
 *     tags:
 *       - Facility Supervisor Complaints
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Complaint retrieved successfully
 *       404:
 *         description: Complaint not found
 */

/**
 * @swagger
 * /api/facility-supervisors/{facilityId}/supervisor-complaints:
 *   get:
 *     summary: Get all complaints for a facility
 *     description: Retrieve all complaints for a specific facility with pagination
 *     tags:
 *       - Facility Supervisor Complaints
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: integer
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
 *         description: Complaints retrieved successfully
 */

/**
 * @swagger
 * /api/facility-supervisors/{facilityId}/supervisors/{supervisorId}/complaints:
 *   get:
 *     summary: Get all complaints by a specific supervisor
 *     description: Retrieve all complaints raised by a specific supervisor with pagination
 *     tags:
 *       - Facility Supervisor Complaints
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: supervisorId
 *         required: true
 *         schema:
 *           type: integer
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
 *         description: Complaints retrieved successfully
 */

/**
 * @swagger
 * /api/facility-supervisors/{facilityId}/supervisor-complaints/{complaintId}:
 *   put:
 *     summary: Update complaint
 *     description: Update a specific complaint
 *     tags:
 *       - Facility Supervisor Complaints
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: complaintId
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
 *               complaint_type:
 *                 type: string
 *               urgency_level:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               resolution_notes:
 *                 type: string
 *               resolved_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Complaint updated successfully
 *       404:
 *         description: Complaint not found
 */

/**
 * @swagger
 * /api/facility-supervisors/{facilityId}/supervisor-complaints/{complaintId}:
 *   delete:
 *     summary: Delete complaint
 *     description: Soft delete a specific complaint
 *     tags:
 *       - Facility Supervisor Complaints
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Complaint deleted successfully
 *       404:
 *         description: Complaint not found
 */
// Multer configuration for facility supervisor complaints
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Use a temporary directory, then move files after body is parsed
const tempComplaintUploadDir = path.join(process.cwd(), 'uploads', 'complaints', 'temp');

// Create temp directory if it doesn't exist
if (!fs.existsSync(tempComplaintUploadDir)) {
  fs.mkdirSync(tempComplaintUploadDir, { recursive: true });
}

const supervisorComplaintStorage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, tempComplaintUploadDir);
  },
  filename: (req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `complaint_${uniqueSuffix}${ext}`);
  }
});

const supervisorComplaintFileFilter = (req: any, file: any, cb: any) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'));
  }
};

const supervisorComplaintUpload = multer({
  storage: supervisorComplaintStorage,
  fileFilter: supervisorComplaintFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Middleware to move files to correct directory after body is parsed
const moveSupervisorComplaintFiles = (req: any, res: any, next: any) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return next();
  }

  const facilityId = req.params.facilityId;
  const targetDir = path.join(process.cwd(), 'uploads', 'complaints', facilityId.toString());

  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Move files from temp to target directory
  req.files.forEach((file: any) => {
    const oldPath = file.path;
    const newPath = path.join(targetDir, file.filename);
    try {
      fs.renameSync(oldPath, newPath);
      file.path = newPath;
    } catch (e) {
      console.error('Error moving file:', e);
    }
  });

  next();
};

router.post('/:facilityId/supervisor-complaints', authorizeRoles(1, 2, 3), supervisorComplaintUpload.array('attachments', 5), moveSupervisorComplaintFiles, FacilitySupervisorComplaintController.create);

router.get('/:facilityId/supervisor-complaints/:complaintId', authorizeRoles(1, 2, 3), FacilitySupervisorComplaintController.getById);
router.get('/:facilityId/supervisor-complaints', authorizeRoles(1, 2, 3), FacilitySupervisorComplaintController.getByFacilityId);
router.get('/:facilityId/supervisors/:supervisorId/complaints', authorizeRoles(1, 2, 3), FacilitySupervisorComplaintController.getBySupervisorId);
router.put('/:facilityId/supervisor-complaints/:complaintId', authorizeRoles(1, 2, 3), FacilitySupervisorComplaintController.update);
router.delete('/:facilityId/supervisor-complaints/:complaintId', authorizeRoles(1, 2, 3), FacilitySupervisorComplaintController.delete);

export default router;
