import express from 'express';
import PlacementAssignmentController from '../../controllers/placement-assignment/placement-assignment.controller';
import jwtAuth from '../../middlewares/jwt-auth.middleware';
import { authorizeRoles } from '../../middlewares/permission-handler.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Placement Assignments
 *     description: Student assignment to placement slots management
 */

/**
 * @swagger
 * /api/placement-assignments:
 *   post:
 *     summary: Assign a student to a placement slot
 *     description: |
 *       Assigns a student to a placement slot with validation checks:
 *       - Slot must exist and not be deleted
 *       - Placement end date must not have passed
 *       - Slot must not be full (based on total_slots_offered)
 *       - Student must exist
 *       - Student must not already be assigned to this slot
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlacementAssignmentInput'
 *     responses:
 *       201:
 *         description: Student assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PlacementAssignment'
 *       400:
 *         description: Bad request - validation failed (slot full, past date, etc.)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Slot or student not found
 */
router.post('/', jwtAuth, authorizeRoles(2, 3, 4, 5, 6), PlacementAssignmentController.create);

/**
 * @swagger
 * /api/placement-assignments:
 *   get:
 *     summary: List placement assignments with filters and pagination
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: placementslot_id
 *         schema:
 *           type: integer
 *         description: Filter by placement slot ID
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: integer
 *         description: Filter by student ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Assigned, Active, Completed, Cancelled, Dropped]
 *         description: Filter by assignment status
 *       - in: query
 *         name: start_date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date from
 *       - in: query
 *         name: start_date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date to
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: assignment_id
 *         description: Field to sort by
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of results per page
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PlacementAssignment'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalPages:
 *                       type: integer
 *                     previousPage:
 *                       type: integer
 *                       nullable: true
 *                     currentPage:
 *                       type: integer
 *                     nextPage:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/', jwtAuth, PlacementAssignmentController.list);

/**
 * @swagger
 * /api/placement-assignments/slot/{slotId}:
 *   get:
 *     summary: Get all assignments for a specific placement slot
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Placement slot ID
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PlacementAssignment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.get('/slot/:slotId', jwtAuth, PlacementAssignmentController.getBySlotId);

/**
 * @swagger
 * /api/placement-assignments/student/{studentId}:
 *   get:
 *     summary: Get all assignments for a specific student
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PlacementAssignment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.get('/student/:studentId', jwtAuth, PlacementAssignmentController.getByStudentId);

/**
 * @swagger
 * /api/placement-assignments/internships/{studentId}:
 *   get:
 *     summary: Get all internships for a student (multiple placements across different facilities)
 *     description: |
 *       Retrieves all internship records for a student across multiple facilities.
 *       Each student can have multiple internships with the same or different facilities.
 *       
 *       **Response includes:**
 *       - Student and facility information
 *       - Placement slot details (type, dates, hours, shift info)
 *       - Assignment status and facility confirmation status
 *       - Actual start/end dates for the internship
 *       - Shift timings and working days
 *       
 *       **Filters (optional):**
 *       - `status`: Filter by assignment status (Assigned, Active, Completed, Cancelled, Dropped, Allocated, Started)
 *       - `sort_by`: Field to sort by (default: assignment.created_at)
 *       - `sort_order`: ASC or DESC (default: DESC)
 *       - `limit`: Results per page (default: 20)
 *       - `page`: Page number (default: 1)
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Assigned, Active, Completed, Cancelled, Dropped]
 *         description: Filter by assignment status
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: assignment.created_at
 *         description: Field to sort by
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of results per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: Student internships retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       assignment_id:
 *                         type: integer
 *                       student_id:
 *                         type: integer
 *                       student_name:
 *                         type: string
 *                       student_type:
 *                         type: string
 *                       facility_id:
 *                         type: string
 *                       facility_name:
 *                         type: string
 *                       placementslot_id:
 *                         type: integer
 *                       assignment_status:
 *                         type: string
 *                         enum: [Assigned, Active, Completed, Cancelled, Dropped]
 *                       facility_confirmation_status:
 *                         type: string
 *                         enum: [Approved, Rejected]
 *                         nullable: true
 *                       slot_type:
 *                         type: array
 *                         items:
 *                           type: string
 *                       course_applicable:
 *                         type: array
 *                         items:
 *                           type: string
 *                       slot_start_date:
 *                         type: string
 *                         format: date
 *                       slot_end_date:
 *                         type: string
 *                         format: date
 *                       actual_start_date:
 *                         type: string
 *                         format: date
 *                       actual_end_date:
 *                         type: string
 *                         format: date
 *                       total_hours_required:
 *                         type: integer
 *                       shift_type:
 *                         type: array
 *                         items:
 *                           type: string
 *                       shift_timings:
 *                         type: string
 *                       working_days:
 *                         type: array
 *                         items:
 *                           type: string
 *                       notes:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalPages:
 *                       type: integer
 *                     previousPage:
 *                       type: integer
 *                       nullable: true
 *                     currentPage:
 *                       type: integer
 *                     nextPage:
 *                       type: integer
 *                       nullable: true
 *                     totalItems:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Student not found or no internships
 */
router.get('/internships/:studentId', jwtAuth, PlacementAssignmentController.getStudentInternships);

/**
 * @swagger
 * /api/placement-assignments/facility-students:
 *   get:
 *     summary: Get students linked to facility's placement slots
 *     description: |
 *       Fetches all students assigned to placement slots belonging to the logged-in facility or supervisor.
 *       
 *       **Access Control:**
 *       - Facility users (roleID=2): Returns students for their linked facility
 *       - Supervisor users (roleID=3): Returns students for their assigned facility
 *       
 *       **Response includes:** student details, assignment status, placement slot info, and contact details.
 *       
 *       **Filters (optional):**
 *       - `status`: Filter by student status (active, inactive, graduated, etc.)
       *       - `assignment_status`: Filter by assignment status (Assigned, Active, Completed, Cancelled, Dropped)
 *       - `student_type`: Filter by student type (domestic, international)
 *       - `search`: Search in student first name, last name, or email
 *       - `limit`: Results per page (default: 20)
 *       - `page`: Page number (default: 1)
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: facilityid
 *         schema:
 *           type: integer
 *         description: Filter by facility ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, internship_completed, eligible_for_certification, placement_initiated, placement_approved, self_placement_verification_pending, self_placement_approved, certified, completed, graduated, withdrawn]
 *         description: Filter by student status
 *       - in: query
 *         name: assignment_status
 *         schema:
 *           type: string
 *           enum: [Assigned, Active, Completed, Cancelled, Dropped]
 *         description: Filter by assignment status
 *       - in: query
 *         name: student_type
 *         schema:
 *           type: string
 *           enum: [domestic, international]
 *         description: Filter by student type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in student first name, last name, or email
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of results per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: Students retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PlacementAssignmentStudentDetail'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only Facility or Supervisor users can access
 *       404:
 *         description: No students found
 */
router.get(
  '/facility-students',
  jwtAuth,
  authorizeRoles(2, 3), // Facility and Supervisor only
  PlacementAssignmentController.getStudentsByFacility
);

/**
 * @swagger
 * /api/placement-assignments/facility-students/all:
 *   get:
 *     summary: Get all students linked to facility's placement slots (no pagination)
 *     description: |
 *       Fetches ALL students assigned to placement slots belonging to the logged-in facility or supervisor.
 *       Use this endpoint when you need the complete list without pagination.
 *       
 *       **Access Control:**
 *       - Facility users (roleID=2): Returns students for their linked facility
 *       - Supervisor users (roleID=3): Returns students for their assigned facility
 *       
 *       **Note:** For large datasets, use `/facility-students` with pagination instead.
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All students retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PlacementAssignmentStudentDetail'
 *                 total:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only Facility or Supervisor users can access
 */
router.get(
  '/facility-students/all',
  jwtAuth,
  authorizeRoles(2, 3),
  PlacementAssignmentController.getAllStudentsByFacility
);

/**
 * @swagger
 * /api/placement-assignments/{id}:
 *   get:
 *     summary: Get placement assignment by ID
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Assignment ID
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
 *                 data:
 *                   $ref: '#/components/schemas/PlacementAssignment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.get('/:id', jwtAuth, PlacementAssignmentController.getById);

/**
 * @swagger
 * /api/placement-assignments/{id}:
 *   put:
 *     summary: Update placement assignment
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Assignment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlacementAssignmentUpdateInput'
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PlacementAssignment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.put('/:id', jwtAuth, authorizeRoles(2, 3, 4, 5, 6), PlacementAssignmentController.update);

/**
 * @swagger
 * /api/placement-assignments/{id}:
 *   delete:
 *     summary: Delete placement assignment
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Assignment ID
 *     responses:
 *       200:
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.delete('/:id', jwtAuth, authorizeRoles(2, 3, 4, 5, 6), PlacementAssignmentController.delete);

/**
 * @swagger
 * /api/placement-assignments/placements/{id}/confirm:
 *   post:
 *     summary: Confirm placement slot assignments
 *     description: Confirms all 'Assigned' status assignments for a placement slot by changing their status to 'Started'
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Placement Slot ID
 *     responses:
 *       200:
 *         description: Placement assignments confirmed successfully
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
 *                   example: "3 placement assignment(s) confirmed successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PlacementAssignment'
 *       400:
 *         description: Bad request - no assignments to confirm
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Placement slot not found
 *       500:
 *         description: Internal server error
 */
router.post('/placements/:id/confirm', jwtAuth, PlacementAssignmentController.confirm);

/**
 * @swagger
 * /api/placement-assignments/{id}/facility-confirm:
 *   post:
 *     summary: Facility confirms a placement assignment
 *     description: Facility confirms/allocates a placement assignment by setting facility_confirmation_status to 'Approved'
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Assignment ID
 *     responses:
 *       200:
 *         description: Placement assignment confirmed by facility
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
 *                   example: "Placement assignment confirmed by facility"
 *                 data:
 *                   $ref: '#/components/schemas/PlacementAssignment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/facility-confirm', jwtAuth, authorizeRoles(2, 3), PlacementAssignmentController.confirmByFacility);

/**
 * @swagger
 * /api/placement-assignments/{id}/facility-reject:
 *   post:
 *     summary: Facility rejects a placement assignment
 *     description: Facility rejects a placement assignment by setting facility_confirmation_status to 'Rejected'
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Assignment ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for rejection
 *                 example: "Student does not meet requirements"
 *     responses:
 *       200:
 *         description: Placement assignment rejected by facility
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
 *                   example: "Placement assignment rejected by facility"
 *                 data:
 *                   $ref: '#/components/schemas/PlacementAssignment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/facility-reject', jwtAuth, authorizeRoles(2, 3), PlacementAssignmentController.rejectByFacility);

/**
 * @swagger
 * /api/placement-assignments/{id}/facility-status:
 *   put:
 *     summary: Update facility confirmation status
 *     description: Update the facility confirmation status of a placement assignment (Approved, Rejected)
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Assignment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               facility_confirmation_status:
 *                 type: string
 *                 enum: ['Approved', 'Rejected']
 *                 description: New facility confirmation status
 *                 example: "Approved"
 *     responses:
 *       200:
 *         description: Facility confirmation status updated successfully
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
 *                   example: "Facility confirmation status updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/PlacementAssignment'
 *       400:
 *         description: Bad request - invalid status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/facility-status', jwtAuth, authorizeRoles(2, 3), PlacementAssignmentController.updateFacilityStatus);

/**
 * @swagger
 * /api/placement-assignments/{id}/status:
 *   put:
 *     summary: Update assignment status
 *     description: Update the assignment status of a placement assignment (Allocated, Started, Completed, Cancelled). Updates remaining seats if status changes between active and inactive states.
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Assignment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ['Assigned', 'Active', 'Completed', 'Cancelled', 'Dropped']
 *                 description: New assignment status
 *                 example: "Active"
 *     responses:
 *       200:
 *         description: Assignment status updated successfully
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
 *                   example: "Assignment status updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/PlacementAssignment'
 *       400:
 *         description: Bad request - invalid status or no remaining seats
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/status', jwtAuth, authorizeRoles(2, 3, 4, 5, 6), PlacementAssignmentController.updateAssignmentStatus);

/**
 * @swagger
 * /api/placement-assignments/by-student-slot/status:
 *   put:
 *     summary: Update assignment status by student and placement slot
 *     description: Update the assignment status using student_id and placementslot_id instead of assignment_id. Updates remaining seats if status changes between active and inactive states.
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlacementAssignmentStatusUpdateByStudentSlot'
 *     responses:
 *       200:
 *         description: Assignment status updated successfully
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
 *                   example: "Assignment status updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/PlacementAssignment'
 *       400:
 *         description: Bad request - missing required fields or invalid status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Assignment not found for this student and placement slot
 *       500:
 *         description: Internal server error
 */
router.put('/by-student-slot/status', jwtAuth, authorizeRoles(2, 3, 4, 5, 6), PlacementAssignmentController.updateStatusByStudentAndSlot);

/**
 * @swagger
 * /api/placement-assignments/by-student-slot/facility-status:
 *   put:
 *     summary: Update facility confirmation status by student and placement slot
 *     description: Update the facility confirmation status using student_id and placementslot_id instead of assignment_id
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlacementAssignmentFacilityStatusUpdateByStudentSlot'
 *     responses:
 *       200:
 *         description: Facility confirmation status updated successfully
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
 *                   example: "Facility confirmation status updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/PlacementAssignment'
 *       400:
 *         description: Bad request - missing required fields or invalid status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Assignment not found for this student and placement slot
 *       500:
 *         description: Internal server error
 */
router.put('/by-student-slot/facility-status', jwtAuth, authorizeRoles(2, 3), PlacementAssignmentController.updateFacilityStatusByStudentAndSlot);

export default router;
