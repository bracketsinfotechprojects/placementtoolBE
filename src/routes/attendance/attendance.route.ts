import { Router } from 'express';
import AttendanceController from '../../controllers/attendance/attendance.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Attendance
 *     description: Attendance logging and approval management
 */

/**
 * @swagger
 * /api/attendance/log:
 *   post:
 *     summary: Log daily attendance for a student
 *     description: |
 *       Create an attendance log entry for a student at a facility.
 *       This records the student's attendance status, login/logout times, and other details.
 *       
 *       **Workflow:**
 *       - Attendance is created with PENDING approval status by default
 *       - Facility supervisors must approve or reject the attendance using the /approve endpoint
 *       - Once approved, the attendance is finalized
 *       
 *       **Required Fields:**
 *       - student_id: ID of the student
 *       - facility_id: ID of the facility
 *       - placement_slot_id: ID of the placement slot
 *       - attendance_date: Date of attendance (YYYY-MM-DD)
 *       - status: Attendance status (present, absent, leave, half_day, late, early_departure)
 *       - logged_by_user_id: ID of the user logging attendance (usually facility supervisor)
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - student_id
 *               - facility_id
 *               - placementslot_id
 *               - assignment_id
 *               - attendance_date
 *               - status
 *               - logged_by_user_id
 *             properties:
 *               student_id:
 *                 type: integer
 *                 example: 1
 *                 description: ID of the student
 *               facility_id:
 *                 type: integer
 *                 example: 5
 *                 description: ID of the facility where attendance is being logged
 *               placementslot_id:
 *                 type: integer
 *                 example: 10
 *                 description: ID of the placement slot
 *               assignment_id:
 *                 type: integer
 *                 example: 15
 *                 description: ID of the course assignment (identifies which course under the placement)
 *               branch_id:
 *                 type: integer
 *                 example: 2
 *                 description: Optional ID of the facility branch site
 *               attendance_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-05-16"
 *                 description: Date of attendance (YYYY-MM-DD format)
 *               status:
 *                 type: string
 *                 enum: [present, absent, leave, half_day, late, early_departure]
 *                 example: "present"
 *                 description: |
 *                   Attendance status:
 *                   - present: Student was present
 *                   - absent: Student was absent
 *                   - leave: Student took leave
 *                   - half_day: Student worked half day
 *                   - late: Student arrived late
 *                   - early_departure: Student left early
 *               login_time:
 *                 type: string
 *                 format: time
 *                 example: "09:00:00"
 *                 description: Time when student logged in/arrived (HH:MM:SS format)
 *               logout_time:
 *                 type: string
 *                 format: time
 *                 example: "17:30:00"
 *                 description: Time when student logged out/left (HH:MM:SS format)
 *               break_duration_minutes:
 *                 type: integer
 *                 example: 60
 *                 description: Break duration in minutes
 *               worked_hours:
 *                 type: number
 *                 format: float
 *                 example: 8.5
 *                 description: Total hours worked (calculated)
 *               task_description:
 *                 type: string
 *                 example: "Completed database migration and unit tests"
 *                 description: Tasks completed during the day
 *               supervisor_notes:
 *                 type: string
 *                 example: "Good performance, completed all assigned tasks"
 *                 description: Notes from facility supervisor
 *               logged_by_user_id:
 *                 type: integer
 *                 example: 3
 *                 description: ID of the user logging this attendance (usually facility supervisor)
 *               updated_by_user_id:
 *                 type: integer
 *                 example: 4
 *                 description: Optional ID of the user who last updated this record
 *     responses:
 *       201:
 *         description: Attendance logged successfully with PENDING approval status
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
 *                   example: "Attendance logged successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     attendance_log_id:
 *                       type: integer
 *                       example: 1
 *                     student_id:
 *                       type: integer
 *                       example: 1
 *                     facility_id:
 *                       type: integer
 *                       example: 5
 *                     placement_slot_id:
 *                       type: integer
 *                       example: 10
 *                     assignment_id:
 *                       type: integer
 *                       example: 15
 *                     attendance_date:
 *                       type: string
 *                       format: date
 *                       example: "2026-05-16"
 *                     status:
 *                       type: string
 *                       enum: [present, absent, leave, half_day, late, early_departure]
 *                       example: "present"
 *                     login_time:
 *                       type: string
 *                       example: "09:00:00"
 *                     logout_time:
 *                       type: string
 *                       example: "17:30:00"
 *                     break_duration_minutes:
 *                       type: integer
 *                       example: 60
 *                     worked_hours:
 *                       type: number
 *                       example: 8.5
 *                     task_description:
 *                       type: string
 *                       example: "Completed database migration and unit tests"
 *                     supervisor_notes:
 *                       type: string
 *                       example: "Good performance"
 *                     approval_status:
 *                       type: string
 *                       enum: [pending, approved, rejected]
 *                       example: "pending"
 *                       description: Initial status is always PENDING
 *                     approved_by_user_id:
 *                       type: integer
 *                       example: null
 *                     approved_at:
 *                       type: string
 *                       format: date-time
 *                       example: null
 *                     approval_remarks:
 *                       type: string
 *                       example: null
 *                     logged_by_user_id:
 *                       type: integer
 *                       example: 3
 *                     logged_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-05-16T10:30:00Z"
 *                     updated_by_user_id:
 *                       type: integer
 *                       example: null
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-05-16T10:30:00Z"
 *       400:
 *         description: Validation error or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Student with ID 999 not found"
 *       401:
 *         description: Unauthorized - JWT token missing or invalid
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to log attendance"
 */
/**
 * @swagger
 * /api/attendance/student/{attendance_log_id}:
 *   put:
 *     summary: Update attendance record by student
 *     description: |
 *       Students can update their own attendance records that are in PENDING status.
 *       
 *       **Allowed Fields for Students:**
 *       - attendance_date: Date of attendance
 *       - status: Attendance status (present, absent, leave, half_day, late, early_departure)
 *       - login_time: Time when student logged in/arrived
 *       - logout_time: Time when student logged out/left
 *       - break_duration_minutes: Break duration in minutes
 *       - worked_hours: Total hours worked
 *       - task_description: Tasks completed during the day
 *       
 *       **Restrictions:**
 *       - Students can only update their own records
 *       - Only PENDING records can be updated
 *       - Students cannot update supervisor_notes
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attendance_log_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the attendance log to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attendance_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-05-16"
 *               status:
 *                 type: string
 *                 enum: [present, absent, leave, half_day, late, early_departure]
 *                 example: "present"
 *               login_time:
 *                 type: string
 *                 format: time
 *                 example: "09:00:00"
 *               logout_time:
 *                 type: string
 *                 format: time
 *                 example: "17:30:00"
 *               break_duration_minutes:
 *                 type: integer
 *                 example: 60
 *               worked_hours:
 *                 type: number
 *                 format: float
 *                 example: 8.5
 *               task_description:
 *                 type: string
 *                 example: "Completed database migration and unit tests"
 *     responses:
 *       200:
 *         description: Attendance record updated successfully
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
 *                   example: "Attendance record updated successfully"
 *                 data:
 *                   type: object
 *       400:
 *         description: Cannot update record (not in PENDING status or validation error)
 *       403:
 *         description: Forbidden - Can only update own records
 *       404:
 *         description: Attendance log not found
 *       500:
 *         description: Server error
 */
router.put('/student/:attendance_log_id', AttendanceController.updateAttendanceByStudent);

/**
 * @swagger
 * /api/attendance/supervisor/{attendance_log_id}:
 *   put:
 *     summary: Update attendance record by facility supervisor
 *     description: |
 *       Facility supervisors and admins can update attendance records for their facility.
 *       
 *       **Allowed Fields for Supervisors:**
 *       - attendance_date: Date of attendance
 *       - status: Attendance status (present, absent, leave, half_day, late, early_departure)
 *       - login_time: Time when student logged in/arrived
 *       - logout_time: Time when student logged out/left
 *       - break_duration_minutes: Break duration in minutes
 *       - worked_hours: Total hours worked
 *       - task_description: Tasks completed during the day
 *       - supervisor_notes: Notes from facility supervisor
 *       - approval_status: Approval status (pending, approved, rejected)
 *       - approval_remarks: Remarks for approval/rejection
 *       - approved_by_user_id: Email or User ID of the approver (optional, defaults to current user)
 *       
 *       **Auto-Set Fields:**
 *       - approved_by_user_id: Automatically set from current user (JWT token)
 *       - approved_at: Automatically set when approval_status is updated
 *       
 *       **Restrictions:**
 *       - Supervisors can only update records for their assigned facility
 *       - Admins can update any facility's records
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attendance_log_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the attendance log to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attendance_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-05-16"
 *               status:
 *                 type: string
 *                 enum: [present, absent, leave, half_day, late, early_departure]
 *                 example: "present"
 *               login_time:
 *                 type: string
 *                 format: time
 *                 example: "09:00:00"
 *               logout_time:
 *                 type: string
 *                 format: time
 *                 example: "17:30:00"
 *               break_duration_minutes:
 *                 type: integer
 *                 example: 60
 *               worked_hours:
 *                 type: number
 *                 format: float
 *                 example: 8.5
 *               task_description:
 *                 type: string
 *                 example: "Completed database migration and unit tests"
 *               supervisor_notes:
 *                 type: string
 *                 example: "Good performance, completed all assigned tasks"
 *               approval_status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *                 example: "approved"
 *               approval_remarks:
 *                 type: string
 *                 example: "Approved"
 *     responses:
 *       200:
 *         description: Attendance record updated successfully
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
 *                   example: "Attendance record updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     attendance_log_id:
 *                       type: integer
 *                     approval_status:
 *                       type: string
 *                       example: "approved"
 *                     approved_by_user_id:
 *                       type: integer
 *                       description: Automatically set from current user
 *                     approved_at:
 *                       type: string
 *                       format: date-time
 *                       description: Automatically set when approval_status is updated
 *       403:
 *         description: Forbidden - Can only update records for assigned facility
 *       404:
 *         description: Attendance log not found
 *       500:
 *         description: Server error
 */
router.put('/supervisor/:attendance_log_id', AttendanceController.updateAttendanceBySupervisor);

/**
 * @swagger
 * /api/attendance/log:
 *   post:
 *     summary: Log daily attendance for a student
 *     description: |
 *       Create an attendance log entry for a student at a facility.
 *       This records the student's attendance status, login/logout times, and other details.
 *       
 *       **Workflow:**
 *       - Attendance is created with PENDING approval status by default
 *       - Facility supervisors must approve or reject the attendance using the /approve endpoint
 *       - Once approved, the attendance is finalized
 *       
 *       **Required Fields:**
 *       - student_id: ID of the student
 *       - facility_id: ID of the facility
 *       - placement_slot_id: ID of the placement slot
 *       - attendance_date: Date of attendance (YYYY-MM-DD)
 *       - status: Attendance status (present, absent, leave, half_day, late, early_departure)
 *       - logged_by_user_id: ID of the user logging attendance (usually facility supervisor)
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - student_id
 *               - facility_id
 *               - placementslot_id
 *               - assignment_id
 *               - attendance_date
 *               - status
 *               - logged_by_user_id
 *             properties:
 *               student_id:
 *                 type: integer
 *                 example: 1
 *                 description: ID of the student
 *               facility_id:
 *                 type: integer
 *                 example: 5
 *                 description: ID of the facility where attendance is being logged
 *               placementslot_id:
 *                 type: integer
 *                 example: 10
 *                 description: ID of the placement slot
 *               assignment_id:
 *                 type: integer
 *                 example: 15
 *                 description: ID of the course assignment (identifies which course under the placement)
 *               branch_id:
 *                 type: integer
 *                 example: 2
 *                 description: Optional ID of the facility branch site
 *               attendance_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-05-16"
 *                 description: Date of attendance (YYYY-MM-DD format)
 *               status:
 *                 type: string
 *                 enum: [present, absent, leave, half_day, late, early_departure]
 *                 example: "present"
 *                 description: |
 *                   Attendance status:
 *                   - present: Student was present
 *                   - absent: Student was absent
 *                   - leave: Student took leave
 *                   - half_day: Student worked half day
 *                   - late: Student arrived late
 *                   - early_departure: Student left early
 *               login_time:
 *                 type: string
 *                 format: time
 *                 example: "09:00:00"
 *                 description: Time when student logged in/arrived (HH:MM:SS format)
 *               logout_time:
 *                 type: string
 *                 format: time
 *                 example: "17:30:00"
 *                 description: Time when student logged out/left (HH:MM:SS format)
 *               break_duration_minutes:
 *                 type: integer
 *                 example: 60
 *                 description: Break duration in minutes
 *               worked_hours:
 *                 type: number
 *                 format: float
 *                 example: 8.5
 *                 description: Total hours worked (calculated)
 *               task_description:
 *                 type: string
 *                 example: "Completed database migration and unit tests"
 *                 description: Tasks completed during the day
 *               supervisor_notes:
 *                 type: string
 *                 example: "Good performance, completed all assigned tasks"
 *                 description: Notes from facility supervisor
 *               logged_by_user_id:
 *                 type: integer
 *                 example: 3
 *                 description: ID of the user logging this attendance (usually facility supervisor)
 *               updated_by_user_id:
 *                 type: integer
 *                 example: 4
 *                 description: Optional ID of the user who last updated this record
 *     responses:
 *       201:
 *         description: Attendance logged successfully with PENDING approval status
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
 *                   example: "Attendance logged successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     attendance_log_id:
 *                       type: integer
 *                       example: 1
 *                     student_id:
 *                       type: integer
 *                       example: 1
 *                     facility_id:
 *                       type: integer
 *                       example: 5
 *                     placement_slot_id:
 *                       type: integer
 *                       example: 10
 *                     assignment_id:
 *                       type: integer
 *                       example: 15
 *                     attendance_date:
 *                       type: string
 *                       format: date
 *                       example: "2026-05-16"
 *                     status:
 *                       type: string
 *                       enum: [present, absent, leave, half_day, late, early_departure]
 *                       example: "present"
 *                     login_time:
 *                       type: string
 *                       example: "09:00:00"
 *                     logout_time:
 *                       type: string
 *                       example: "17:30:00"
 *                     break_duration_minutes:
 *                       type: integer
 *                       example: 60
 *                     worked_hours:
 *                       type: number
 *                       example: 8.5
 *                     task_description:
 *                       type: string
 *                       example: "Completed database migration and unit tests"
 *                     supervisor_notes:
 *                       type: string
 *                       example: "Good performance"
 *                     approval_status:
 *                       type: string
 *                       enum: [pending, approved, rejected]
 *                       example: "pending"
 *                       description: Initial status is always PENDING
 *                     approved_by_user_id:
 *                       type: integer
 *                       example: null
 *                     approved_at:
 *                       type: string
 *                       format: date-time
 *                       example: null
 *                     approval_remarks:
 *                       type: string
 *                       example: null
 *                     logged_by_user_id:
 *                       type: integer
 *                       example: 3
 *                     logged_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-05-16T10:30:00Z"
 *                     updated_by_user_id:
 *                       type: integer
 *                       example: null
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-05-16T10:30:00Z"
 *       400:
 *         description: Validation error or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Student with ID 999 not found"
 *       401:
 *         description: Unauthorized - JWT token missing or invalid
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to log attendance"
 */
router.post('/log', AttendanceController.logAttendance);

/**
 * @swagger
 * /api/attendance/approve:
 *   post:
 *     summary: Approve or reject attendance
 *     description: |
 *       Update the approval status of an attendance log entry.
 *       
 *       **Approval Workflow:**
 *       - pending: Attendance is waiting for approval
 *       - approved: Attendance has been approved by supervisor
 *       - rejected: Attendance has been rejected by supervisor
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - attendance_log_id
 *               - approval_status
 *               - approved_by_user_id
 *             properties:
 *               attendance_log_id:
 *                 type: integer
 *                 example: 1
 *               approval_status:
 *                 type: string
 *                 enum: [approved, rejected, pending]
 *                 example: "approved"
 *               approved_by_user_id:
 *                 type: integer
 *                 example: 3
 *               approval_remarks:
 *                 type: string
 *                 example: "Approved"
 *     responses:
 *       200:
 *         description: Attendance approval status updated successfully
 *       400:
 *         description: Validation error or user not found
 *       404:
 *         description: Attendance log not found
 *       500:
 *         description: Server error
 */
router.post('/approve', AttendanceController.approveAttendance);

/**
 * @swagger
 * /api/attendance/list:
 *   get:
 *     summary: Get attendance logs with filters
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: facility_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: approval_status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Attendance logs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/list', AttendanceController.getAttendanceLogs);

/**
 * @swagger
 * /api/attendance/logbook:
 *   get:
 *     summary: Generate attendance logbook for a student
 *     description: |
 *       Generate an attendance logbook/summary for a student.
 *       Returns attendance metrics, hours worked, compliance status, and deviations.
 *       If period dates are not provided, all attendance records for the student will be included.
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: student_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *       - in: query
 *         name: facility_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Facility ID
 *       - in: query
 *         name: placement_slot_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Placement slot ID
 *       - in: query
 *         name: period_start_date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date of the period (YYYY-MM-DD). If not provided, uses earliest attendance record date.
 *       - in: query
 *         name: period_end_date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: End date of the period (YYYY-MM-DD). If not provided, uses latest attendance record date.
 *       - in: query
 *         name: summary_period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: weekly
 *         description: Period type for summary
 *     responses:
 *       200:
 *         description: Attendance logbook generated successfully
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
 *                   example: "Attendance logbook generated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary_id:
 *                       type: integer
 *                     student_id:
 *                       type: integer
 *                     facility_id:
 *                       type: integer
 *                     placement_slot_id:
 *                       type: integer
 *                     summary_period:
 *                       type: string
 *                       enum: [daily, weekly, monthly]
 *                     period_start_date:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                     period_end_date:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                     total_days_in_period:
 *                       type: integer
 *                     days_present:
 *                       type: integer
 *                     days_absent:
 *                       type: integer
 *                     days_on_leave:
 *                       type: integer
 *                     half_days:
 *                       type: integer
 *                     late_arrivals:
 *                       type: integer
 *                     early_departures:
 *                       type: integer
 *                     total_hours_worked:
 *                       type: number
 *                     total_hours_required:
 *                       type: number
 *                     hours_shortfall:
 *                       type: number
 *                     average_daily_hours:
 *                       type: number
 *                     attendance_percentage:
 *                       type: number
 *                     meets_minimum_attendance:
 *                       type: boolean
 *                     policy_violations:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [draft, submitted, approved, rejected]
 *       400:
 *         description: Bad request - missing or invalid parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/logbook', AttendanceController.generateLogbook);

/**
 * @swagger
 * /api/attendance/pending:
 *   get:
 *     summary: Get pending attendance records for a specific student
 *     description: |
 *       Retrieve attendance records for a specific student with optional filtering by approval status and facility.
 *       The student_id parameter is mandatory.
 *       
 *       **Approval Status Values:**
 *       - pending: Attendance waiting for approval
 *       - approved: Attendance that has been approved
 *       - rejected: Attendance that has been rejected
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Student ID (mandatory)
 *       - in: query
 *         name: facility_id
 *         schema:
 *           type: integer
 *         description: Optional filter by facility ID
 *       - in: query
 *         name: approval_status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Optional filter by approval status. If not provided, returns all statuses
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
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
 *                   example: "Attendance records retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       attendance_log_id:
 *                         type: integer
 *                       student_id:
 *                         type: integer
 *                       facility_id:
 *                         type: integer
 *                       placement_slot_id:
 *                         type: integer
 *                       attendance_date:
 *                         type: string
 *                         format: date
 *                       status:
 *                         type: string
 *                         enum: [present, absent, leave, half_day, late, early_departure]
 *                       approval_status:
 *                         type: string
 *                         enum: [pending, approved, rejected]
 *                       approved_by_user_id:
 *                         type: integer
 *                       approved_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     per_page:
 *                       type: integer
 *                     current_page:
 *                       type: integer
 *                     last_page:
 *                       type: integer
 *       400:
 *         description: Bad request - student_id is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "student_id is required"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/pending', AttendanceController.getPendingAttendance);

export default router;
