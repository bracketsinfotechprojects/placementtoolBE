import { Router } from 'express';
import StudentController from '../../controllers/student/student.controller';

const router = Router();

/**
 * @swagger
 * /api/students:
 *   post:
 *     summary: Create new student with all related data
 *     description: Create a new student with complete profile including contact details, visa, addresses, eligibility, lifestyle, placement preferences, facility records, address change requests, and job status updates. All data is created in a single transaction.
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
 *                 example: "Sneha"
 *               last_name:
 *                 type: string
 *                 example: "Patil"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "2000-03-15"
 *               gender:
 *                 type: string
 *                 example: "female"
 *               nationality:
 *                 type: string
 *                 example: "Indian"
 *               student_type:
 *                 type: string
 *                 enum: [domestic, international]
 *                 example: "international"
 *               status:
 *                 type: string
 *                 enum: [active, inactive, graduated, withdrawn]
 *                 example: "active"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email for user account creation
 *                 example: "sneha.patil@example.com"
 *               password:
 *                 type: string
 *                 description: Password for user account (will be hashed)
 *                 example: "StrongPass789"
 *               contact_details:
 *                 type: object
 *                 properties:
 *                   primary_mobile:
 *                     type: string
 *                     example: "+91-9876543210"
 *                   email:
 *                     type: string
 *                     example: "sneha.patil@example.com"
 *                   emergency_contact:
 *                     type: string
 *                     example: "+91-9876543211"
 *                   contact_type:
 *                     type: string
 *                     enum: [mobile, landline, whatsapp]
 *                     example: "mobile"
 *                   is_primary:
 *                     type: boolean
 *                     example: true
 *                   verified_at:
 *                     type: string
 *                     format: date-time
 *               visa_details:
 *                 type: object
 *                 properties:
 *                   visa_type:
 *                     type: string
 *                     example: "Work Permit"
 *                   visa_number:
 *                     type: string
 *                     example: "WP123456789"
 *                   start_date:
 *                     type: string
 *                     format: date
 *                     example: "2025-09-01"
 *                   expiry_date:
 *                     type: string
 *                     format: date
 *                     example: "2027-09-01"
 *                   status:
 *                     type: string
 *                     enum: [active, expired, revoked, pending]
 *                     example: "active"
 *                   issuing_country:
 *                     type: string
 *                     example: "Canada"
 *                   document_path:
 *                     type: string
 *                     example: "/documents/work_permit.pdf"
 *               addresses:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     line1:
 *                       type: string
 *                       example: "22 Tech Valley"
 *                     city:
 *                       type: string
 *                       example: "Bangalore"
 *                     state:
 *                       type: string
 *                       example: "Karnataka"
 *                     country:
 *                       type: string
 *                       example: "India"
 *                     postal_code:
 *                       type: string
 *                       example: "560001"
 *                     address_type:
 *                       type: string
 *                       enum: [current, permanent, temporary, mailing]
 *                       example: "current"
 *                     is_primary:
 *                       type: boolean
 *                       example: true
 *               eligibility_status:
 *                 type: object
 *                 properties:
 *                   classes_completed:
 *                     type: boolean
 *                     example: true
 *                   fees_paid:
 *                     type: boolean
 *                     example: false
 *                   assignments_submitted:
 *                     type: boolean
 *                     example: true
 *                   documents_submitted:
 *                     type: boolean
 *                     example: true
 *                   trainer_consent:
 *                     type: boolean
 *                     example: false
 *                   override_requested:
 *                     type: boolean
 *                     example: true
 *                   requested_by:
 *                     type: string
 *                     example: "Admin"
 *                   reason:
 *                     type: string
 *                     example: "Pending fee clearance"
 *                   comments:
 *                     type: string
 *                     example: "Awaiting payment confirmation"
 *                   overall_status:
 *                     type: string
 *                     enum: [eligible, not_eligible, pending, override]
 *                     example: "eligible"
 *               student_lifestyle:
 *                 type: object
 *                 properties:
 *                   currently_working:
 *                     type: boolean
 *                     example: false
 *                   working_hours:
 *                     type: string
 *                     example: "0"
 *                   has_dependents:
 *                     type: boolean
 *                     example: true
 *                   married:
 *                     type: boolean
 *                     example: true
 *                   driving_license:
 *                     type: boolean
 *                     example: false
 *                   own_vehicle:
 *                     type: boolean
 *                     example: true
 *                   public_transport_only:
 *                     type: boolean
 *                     example: false
 *                   can_travel_long_distance:
 *                     type: boolean
 *                     example: false
 *                   drop_support_available:
 *                     type: boolean
 *                     example: true
 *                   fully_flexible:
 *                     type: boolean
 *                     example: true
 *                   rush_placement_required:
 *                     type: boolean
 *                     example: false
 *                   preferred_days:
 *                     type: string
 *                     example: "Monday to Friday"
 *                   preferred_time_slots:
 *                     type: string
 *                     example: "9 AM to 5 PM"
 *                   additional_notes:
 *                     type: string
 *                     example: "Prefers remote work opportunities"
 *               placement_preferences:
 *                 type: object
 *                 properties:
 *                   preferred_states:
 *                     type: string
 *                     example: "Karnataka, Telangana"
 *                   preferred_cities:
 *                     type: string
 *                     example: "Bangalore, Hyderabad"
 *                   max_travel_distance_km:
 *                     type: integer
 *                     example: 15
 *                   morning_only:
 *                     type: boolean
 *                     example: true
 *                   evening_only:
 *                     type: boolean
 *                     example: false
 *                   night_shift:
 *                     type: boolean
 *                     example: false
 *                   weekend_only:
 *                     type: boolean
 *                     example: false
 *                   part_time:
 *                     type: boolean
 *                     example: false
 *                   full_time:
 *                     type: boolean
 *                     example: true
 *                   with_friend:
 *                     type: boolean
 *                     example: false
 *                   friend_name_or_id:
 *                     type: string
 *                   with_spouse:
 *                     type: boolean
 *                     example: true
 *                   spouse_name_or_id:
 *                     type: string
 *                     example: "STU456"
 *                   earliest_start_date:
 *                     type: string
 *                     format: date
 *                     example: "2026-03-01"
 *                   latest_start_date:
 *                     type: string
 *                     format: date
 *                     example: "2026-05-01"
 *                   specific_month_preference:
 *                     type: string
 *                     example: "April 2026"
 *                   urgency_level:
 *                     type: string
 *                     enum: [immediate, within_month, within_quarter, flexible]
 *                     example: "within_month"
 *                   additional_preferences:
 *                     type: string
 *                     example: "Interested in frontend development roles"
 *               facility_records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     facility_name:
 *                       type: string
 *                       example: "SkillUp Institute"
 *                     facility_type:
 *                       type: string
 *                       example: "Training Center"
 *                     branch_site:
 *                       type: string
 *                       example: "Bangalore"
 *                     facility_address:
 *                       type: string
 *                       example: "88 Learning Lane, Bangalore"
 *                     contact_person_name:
 *                       type: string
 *                       example: "Dr. Meera"
 *                     contact_email:
 *                       type: string
 *                       example: "meera@skillup.com"
 *                     contact_phone:
 *                       type: string
 *                       example: "+91-9876543212"
 *                     supervisor_name:
 *                       type: string
 *                       example: "Mr. Arjun"
 *                     distance_from_student_km:
 *                       type: integer
 *                       example: 5
 *                     slot_id:
 *                       type: string
 *                       example: "SLOT005"
 *                     course_type:
 *                       type: string
 *                       example: "Frontend Development"
 *                     shift_timing:
 *                       type: string
 *                       example: "9 AM - 5 PM"
 *                     start_date:
 *                       type: string
 *                       format: date
 *                       example: "2026-02-01"
 *                     duration_hours:
 *                       type: integer
 *                       example: 100
 *                     gender_requirement:
 *                       type: string
 *                       example: "Any"
 *                     applied_on:
 *                       type: string
 *                       format: date
 *                       example: "2026-01-06"
 *                     student_confirmed:
 *                       type: boolean
 *                       example: false
 *                     student_comments:
 *                       type: string
 *                       example: "Waiting for confirmation"
 *                     document_type:
 *                       type: string
 *                       example: "Offer Letter"
 *                     file_path:
 *                       type: string
 *                       example: "/documents/offer_letter.pdf"
 *                     application_status:
 *                       type: string
 *                       enum: [applied, under_review, accepted, rejected, confirmed, completed]
 *                       example: "applied"
 *               address_change_requests:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     current_address:
 *                       type: string
 *                       example: "22 Tech Valley, Bangalore"
 *                     new_address:
 *                       type: string
 *                       example: "55 Innovation Park, Bangalore"
 *                     effective_date:
 *                       type: string
 *                       format: date
 *                       example: "2026-03-10"
 *                     change_reason:
 *                       type: string
 *                       example: "Closer to spouse's workplace"
 *                     impact_acknowledged:
 *                       type: boolean
 *                       example: true
 *                     status:
 *                       type: string
 *                       enum: [pending, approved, rejected, implemented]
 *                       example: "approved"
 *                     reviewed_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-01-10"
 *                     reviewed_by:
 *                       type: string
 *                       example: "Coordinator"
 *                     review_comments:
 *                       type: string
 *                       example: "Approved for relocation"
 *               job_status_updates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "offer_received"
 *                     last_updated_on:
 *                       type: string
 *                       format: date
 *                       example: "2026-01-06"
 *                     employer_name:
 *                       type: string
 *                       example: "NextGen Solutions"
 *                     job_role:
 *                       type: string
 *                       example: "Frontend Developer"
 *                     start_date:
 *                       type: string
 *                       format: date
 *                       example: "2026-03-15"
 *                     employment_type:
 *                       type: string
 *                       example: "full_time"
 *                     offer_letter_path:
 *                       type: string
 *                       example: "/documents/nextgen_offer.pdf"
 *                     actively_applying:
 *                       type: boolean
 *                       example: false
 *                     expected_timeline:
 *                       type: string
 *                       example: "Joining in March"
 *                     searching_comments:
 *                       type: string
 *                       example: "Offer accepted"
 *     responses:
 *       201:
 *         description: Student created successfully with all related data in a single transaction
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
 *                   example: "Student created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     student_id:
 *                       type: integer
 *                       example: 123
 *                     first_name:
 *                       type: string
 *                       example: "Sneha"
 *                     last_name:
 *                       type: string
 *                       example: "Patil"
 *       400:
 *         description: Validation error or missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error - transaction rolled back, no data saved
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
