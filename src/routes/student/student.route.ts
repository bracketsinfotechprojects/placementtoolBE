import { Router } from 'express';
import StudentController from '../../controllers/student/student.controller';
import EligibilityCredentialController from '../../controllers/student/eligibility-credential.controller';

const router = Router();

/**
 * @swagger
 * /api/students:
 *   post:
 *     summary: Create new student
 *     description: |
 *       Create a new student with basic profile including contact details, visa, addresses, 
 *       eligibility, lifestyle, and placement preferences. All data is created in a single transaction.
 *       
 *       NOTE: Facility records, address change requests, and job status updates are now managed 
 *       via separate APIs after student creation:
 *       - POST /api/students/{studentId}/facility-records
 *       - POST /api/students/{studentId}/address-change-requests
 *       - POST /api/students/{studentId}/job-status-updates
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
 *                 enum: [active, inactive, internship_completed, eligible_for_certification, placement_initiated, self_placement_verification_pending, self_placement_approved, certified, completed, graduated, withdrawn]
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
 *     responses:
 *       201:
 *         description: Student created successfully
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
 *                       description: Use this ID to add facility records, address changes, and job updates
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
 * /api/students/list:
 *   get:
 *     summary: Get students list with specific fields
 *     description: Get list of students with Name, Email, Primary Phone, Student Type, Course Completed, City, Status, Checklist Approval, and Created On
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Page number
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, internship_completed, eligible_for_certification, placement_initiated, self_placement_verification_pending, self_placement_approved, certified, completed, graduated, withdrawn]
 *         description: Filter by student status
 *       - in: query
 *         name: student_type
 *         schema:
 *           type: string
 *           enum: [domestic, international]
 *         description: Filter by student type
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search by student name
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: |
 *           Filter by student status. Supports multiple values.
 *           Examples:
 *           - Single: ?status=active
 *           - Multiple (array): ?status=active&status=inactive
 *           - Multiple (comma): ?status=active,inactive
 *         example: "active,inactive"
 *       - in: query
 *         name: student_type
 *         schema:
 *           type: string
 *         description: |
 *           Filter by student type. Supports multiple values.
 *           Examples:
 *           - Single: ?student_type=domestic
 *           - Multiple (array): ?student_type=domestic&student_type=international
 *           - Multiple (comma): ?student_type=domestic,international
 *         example: "domestic,international"
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: |
 *           Filter by city. Supports multiple values.
 *           Examples:
 *           - Single: ?city=Sydney
 *           - Multiple (array): ?city=Sydney&city=Melbourne
 *           - Multiple (comma): ?city=Sydney,Melbourne
 *         example: "Sydney,Melbourne"
 *       - in: query
 *         name: course_completed
 *         schema:
 *           type: string
 *         description: |
 *           Filter by completed courses. Supports multiple values and partial matching.
 *           Examples:
 *           - Single: ?course_completed=Frontend
 *           - Multiple (array): ?course_completed=Frontend&course_completed=Backend
 *           - Multiple (comma): ?course_completed=Frontend,Backend
 *         example: "Frontend,Backend"
 *       - in: query
 *         name: checklist_approval
 *         schema:
 *           type: string
 *           enum: [true, false, all]
 *         description: |
 *           Filter by checklist approval status:
 *           - true: Show only students with all eligibility criteria met
 *           - false: Show only students with incomplete eligibility
 *           - all: Show all students (no filter)
 *         example: "true"
 *       - in: query
 *         name: activation_status
 *         schema:
 *           type: string
 *           enum: [active, deactivated, all]
 *           default: active
 *         description: |
 *           Filter by activation status (isDeleted field):
 *           - active: Show only active students (isDeleted = 0)
 *           - deactivated: Show only deactivated students (isDeleted = 1)
 *           - all: Show both active and deactivated students
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Students list retrieved successfully
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
 *                   example: "Students list retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       student_id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         example: "john.doe@example.com"
 *                       primary_phone:
 *                         type: string
 *                         example: "+61-412-345-678"
 *                         description: Primary mobile number from contact details
 *                       student_type:
 *                         type: string
 *                         example: "international"
 *                       course_completed:
 *                         type: string
 *                         example: "Frontend Development, Backend Development"
 *                       city:
 *                         type: string
 *                         example: "Sydney"
 *                       status:
 *                         type: string
 *                         example: "active"
 *                       checklist_approval:
 *                         type: boolean
 *                         example: true
 *                         description: True if all eligibility criteria are met
 *                       activation_status:
 *                         type: string
 *                         enum: [active, deactivated]
 *                         example: "active"
 *                         description: Student activation status (active = isDeleted 0, deactivated = isDeleted 1)
 *                       created_on:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-01-12T10:30:00Z"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     per_page:
 *                       type: integer
 *                       example: 10
 *                     current_page:
 *                       type: integer
 *                       example: 1
 *                     last_page:
 *                       type: integer
 *                       example: 10
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/list', StudentController.getStudentsList);

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
 * /api/students/{id}/all-details:
 *   get:
 *     summary: Get all student details (comprehensive)
 *     description: |
 *       Retrieve complete student information including ALL fields from ALL related tables:
 *       - Student basic info (10 fields)
 *       - Contact details (7 fields per record)
 *       - Visa details (8 fields per record)
 *       - Addresses (8 fields per record)
 *       - Eligibility status (11 fields per record)
 *       - Student lifestyle (14 fields per record)
 *       - Placement preferences (19 fields per record)
 *       - Facility records (22 fields per record)
 *       - Address change requests (10 fields per record)
 *       - Job status updates (11 fields per record)
 *       - User account (7 fields, password excluded)
 *       
 *       Total: 127+ fields returned in a single API call!
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
 *         description: Student ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Complete student details retrieved successfully with all related data
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
 *                   example: "Student all details retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     student_id:
 *                       type: integer
 *                       example: 1
 *                       description: Unique student identifier
 *                     first_name:
 *                       type: string
 *                       example: "John"
 *                     last_name:
 *                       type: string
 *                       example: "Doe"
 *                     dob:
 *                       type: string
 *                       format: date
 *                       example: "1998-05-20"
 *                       description: Date of birth
 *                     gender:
 *                       type: string
 *                       example: "male"
 *                     nationality:
 *                       type: string
 *                       example: "Indian"
 *                     student_type:
 *                       type: string
 *                       enum: [domestic, international]
 *                       example: "international"
 *                     status:
 *                       type: string
 *                       enum: [active, inactive, internship_completed, eligible_for_certification, placement_initiated, self_placement_verification_pending, self_placement_approved, certified, completed, graduated, withdrawn]
 *                       example: "active"
 *                     contact_details:
 *                       type: array
 *                       description: All contact information records
 *                       items:
 *                         type: object
 *                         properties:
 *                           contact_id:
 *                             type: integer
 *                             example: 1
 *                           primary_mobile:
 *                             type: string
 *                             example: "+91-9876543210"
 *                           email:
 *                             type: string
 *                             example: "john.doe@example.com"
 *                           emergency_contact:
 *                             type: string
 *                             example: "+91-9876543211"
 *                           contact_type:
 *                             type: string
 *                             enum: [mobile, landline, whatsapp]
 *                             example: "mobile"
 *                           is_primary:
 *                             type: boolean
 *                             example: true
 *                           verified_at:
 *                             type: string
 *                             format: date-time
 *                     visa_details:
 *                       type: array
 *                       description: Visa information for international students
 *                       items:
 *                         type: object
 *                         properties:
 *                           visa_id:
 *                             type: integer
 *                             example: 1
 *                           visa_type:
 *                             type: string
 *                             example: "Student Visa"
 *                           visa_number:
 *                             type: string
 *                             example: "SV123456789"
 *                           start_date:
 *                             type: string
 *                             format: date
 *                           expiry_date:
 *                             type: string
 *                             format: date
 *                           status:
 *                             type: string
 *                             enum: [active, expired, revoked, pending]
 *                             example: "active"
 *                           issuing_country:
 *                             type: string
 *                             example: "Australia"
 *                           document_path:
 *                             type: string
 *                             example: "/documents/visa.pdf"
 *                     addresses:
 *                       type: array
 *                       description: All address records (current, permanent, etc.)
 *                       items:
 *                         type: object
 *                         properties:
 *                           address_id:
 *                             type: integer
 *                             example: 1
 *                           line1:
 *                             type: string
 *                             example: "123 Main Street"
 *                           city:
 *                             type: string
 *                             example: "Sydney"
 *                           state:
 *                             type: string
 *                             example: "NSW"
 *                           country:
 *                             type: string
 *                             example: "Australia"
 *                           postal_code:
 *                             type: string
 *                             example: "2000"
 *                           address_type:
 *                             type: string
 *                             enum: [current, permanent, temporary, mailing]
 *                             example: "current"
 *                           is_primary:
 *                             type: boolean
 *                             example: true
 *                     eligibility_status:
 *                       type: array
 *                       description: Placement eligibility tracking
 *                       items:
 *                         type: object
 *                         properties:
 *                           eligibility_id:
 *                             type: integer
 *                           classes_completed:
 *                             type: boolean
 *                           fees_paid:
 *                             type: boolean
 *                           assignments_submitted:
 *                             type: boolean
 *                           documents_submitted:
 *                             type: boolean
 *                           trainer_consent:
 *                             type: boolean
 *                           override_requested:
 *                             type: boolean
 *                           requested_by:
 *                             type: string
 *                           reason:
 *                             type: string
 *                           comments:
 *                             type: string
 *                           overall_status:
 *                             type: string
 *                             enum: [eligible, not_eligible, pending, override]
 *                     student_lifestyle:
 *                       type: array
 *                       description: Lifestyle and availability information
 *                       items:
 *                         type: object
 *                         properties:
 *                           lifestyle_id:
 *                             type: integer
 *                           currently_working:
 *                             type: boolean
 *                           working_hours:
 *                             type: string
 *                           has_dependents:
 *                             type: boolean
 *                           married:
 *                             type: boolean
 *                           driving_license:
 *                             type: boolean
 *                           own_vehicle:
 *                             type: boolean
 *                           public_transport_only:
 *                             type: boolean
 *                           can_travel_long_distance:
 *                             type: boolean
 *                           drop_support_available:
 *                             type: boolean
 *                           fully_flexible:
 *                             type: boolean
 *                           rush_placement_required:
 *                             type: boolean
 *                           preferred_days:
 *                             type: string
 *                           preferred_time_slots:
 *                             type: string
 *                           additional_notes:
 *                             type: string
 *                     placement_preferences:
 *                       type: array
 *                       description: Placement location and timing preferences
 *                       items:
 *                         type: object
 *                         properties:
 *                           preference_id:
 *                             type: integer
 *                           preferred_states:
 *                             type: string
 *                           preferred_cities:
 *                             type: string
 *                           max_travel_distance_km:
 *                             type: integer
 *                           morning_only:
 *                             type: boolean
 *                           evening_only:
 *                             type: boolean
 *                           night_shift:
 *                             type: boolean
 *                           weekend_only:
 *                             type: boolean
 *                           part_time:
 *                             type: boolean
 *                           full_time:
 *                             type: boolean
 *                           with_friend:
 *                             type: boolean
 *                           friend_name_or_id:
 *                             type: string
 *                           with_spouse:
 *                             type: boolean
 *                           spouse_name_or_id:
 *                             type: string
 *                           earliest_start_date:
 *                             type: string
 *                             format: date
 *                           latest_start_date:
 *                             type: string
 *                             format: date
 *                           specific_month_preference:
 *                             type: string
 *                           urgency_level:
 *                             type: string
 *                             enum: [immediate, within_month, within_quarter, flexible]
 *                           additional_preferences:
 *                             type: string
 *                     facility_records:
 *                       type: array
 *                       description: Training facility and course records
 *                       items:
 *                         type: object
 *                         properties:
 *                           facility_id:
 *                             type: integer
 *                           facility_name:
 *                             type: string
 *                           facility_type:
 *                             type: string
 *                           branch_site:
 *                             type: string
 *                           facility_address:
 *                             type: string
 *                           contact_person_name:
 *                             type: string
 *                           contact_email:
 *                             type: string
 *                           contact_phone:
 *                             type: string
 *                           supervisor_name:
 *                             type: string
 *                           distance_from_student_km:
 *                             type: integer
 *                           slot_id:
 *                             type: string
 *                           course_type:
 *                             type: string
 *                           shift_timing:
 *                             type: string
 *                           start_date:
 *                             type: string
 *                             format: date
 *                           duration_hours:
 *                             type: integer
 *                           gender_requirement:
 *                             type: string
 *                           applied_on:
 *                             type: string
 *                             format: date
 *                           student_confirmed:
 *                             type: boolean
 *                           student_comments:
 *                             type: string
 *                           document_type:
 *                             type: string
 *                           file_path:
 *                             type: string
 *                           application_status:
 *                             type: string
 *                             enum: [applied, under_review, accepted, rejected, confirmed, completed]
 *                     address_change_requests:
 *                       type: array
 *                       description: Address change request history
 *                       items:
 *                         type: object
 *                         properties:
 *                           request_id:
 *                             type: integer
 *                           current_address:
 *                             type: string
 *                           new_address:
 *                             type: string
 *                           effective_date:
 *                             type: string
 *                             format: date
 *                           change_reason:
 *                             type: string
 *                           impact_acknowledged:
 *                             type: boolean
 *                           status:
 *                             type: string
 *                             enum: [pending, approved, rejected, implemented]
 *                           reviewed_at:
 *                             type: string
 *                             format: date-time
 *                           reviewed_by:
 *                             type: string
 *                           review_comments:
 *                             type: string
 *                     job_status_updates:
 *                       type: array
 *                       description: Employment status tracking
 *                       items:
 *                         type: object
 *                         properties:
 *                           job_status_id:
 *                             type: integer
 *                           status:
 *                             type: string
 *                           last_updated_on:
 *                             type: string
 *                             format: date
 *                           employer_name:
 *                             type: string
 *                           job_role:
 *                             type: string
 *                           start_date:
 *                             type: string
 *                             format: date
 *                           employment_type:
 *                             type: string
 *                           offer_letter_path:
 *                             type: string
 *                           actively_applying:
 *                             type: boolean
 *                           expected_timeline:
 *                             type: string
 *                           searching_comments:
 *                             type: string
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                     user_account:
 *                       type: object
 *                       description: Associated user account (password excluded for security)
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         loginID:
 *                           type: string
 *                           example: "john.doe@example.com"
 *                         roleID:
 *                           type: integer
 *                           example: 3
 *                         roleName:
 *                           type: string
 *                           example: "student"
 *                         status:
 *                           type: string
 *                           example: "active"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Student record creation timestamp
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Student record last update timestamp
 *                 response_time_ms:
 *                   type: integer
 *                   example: 245
 *                   description: API response time in milliseconds
 *       404:
 *         description: Student not found
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
 *                   example: "Student does not exist"
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *       500:
 *         description: Server error
 */
router.get('/:id/all-details', StudentController.getAllDetails);

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
 *     summary: Update student with all related entities
 *     description: |
 *       Update student information including all related entities. Accepts the same payload structure 
 *       as the create endpoint. All fields are optional - only provide the fields you want to update.
 *       
 *       **Update Strategy:**
 *       - Main student fields are updated directly
 *       - Related entities (contact_details, visa_details, etc.) are replaced with new data if provided
 *       - If a related entity is not included in the payload, it remains unchanged
 *       - All updates are performed in a single transaction
 *       
 *       **Note:** Facility records, address change requests, and job status updates are managed 
 *       via their separate APIs and are not affected by this update.
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
 *         description: Student ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *                 enum: [active, inactive, internship_completed, eligible_for_certification, placement_initiated, self_placement_verification_pending, self_placement_approved, certified, completed, graduated, withdrawn]
 *                 example: "active"
 *               contact_details:
 *                 type: object
 *                 description: If provided, replaces existing contact details
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
 *                 description: If provided, replaces existing visa details
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
 *                 description: If provided, replaces all existing addresses
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
 *                 description: If provided, replaces existing eligibility status
 *                 properties:
 *                   classes_completed:
 *                     type: boolean
 *                     example: true
 *                   fees_paid:
 *                     type: boolean
 *                     example: true
 *                   assignments_submitted:
 *                     type: boolean
 *                     example: true
 *                   documents_submitted:
 *                     type: boolean
 *                     example: true
 *                   trainer_consent:
 *                     type: boolean
 *                     example: true
 *                   override_requested:
 *                     type: boolean
 *                     example: false
 *                   requested_by:
 *                     type: string
 *                     example: "Admin"
 *                   reason:
 *                     type: string
 *                     example: "All requirements met"
 *                   comments:
 *                     type: string
 *                     example: "Student is now eligible for placement"
 *                   overall_status:
 *                     type: string
 *                     enum: [eligible, not_eligible, pending, override]
 *                     example: "eligible"
 *               student_lifestyle:
 *                 type: object
 *                 description: If provided, replaces existing lifestyle information
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
 *                     example: true
 *                   own_vehicle:
 *                     type: boolean
 *                     example: true
 *                   public_transport_only:
 *                     type: boolean
 *                     example: false
 *                   can_travel_long_distance:
 *                     type: boolean
 *                     example: true
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
 *                 description: If provided, replaces existing placement preferences
 *                 properties:
 *                   preferred_states:
 *                     type: string
 *                     example: "Karnataka, Telangana"
 *                   preferred_cities:
 *                     type: string
 *                     example: "Bangalore, Hyderabad"
 *                   max_travel_distance_km:
 *                     type: integer
 *                     example: 20
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
 *           examples:
 *             updateBasicInfo:
 *               summary: Update only basic student info
 *               value:
 *                 first_name: "Updated Name"
 *                 status: "graduated"
 *             updateWithRelations:
 *               summary: Update student with all related entities
 *               value:
 *                 first_name: "Sneha"
 *                 last_name: "Patil"
 *                 status: "active"
 *                 contact_details:
 *                   primary_mobile: "+91-9999999999"
 *                   email: "sneha.updated@example.com"
 *                 addresses:
 *                   - line1: "New Address Line 1"
 *                     city: "Mumbai"
 *                     state: "Maharashtra"
 *                     country: "India"
 *                     postal_code: "400001"
 *                     address_type: "current"
 *                     is_primary: true
 *                 eligibility_status:
 *                   classes_completed: true
 *                   fees_paid: true
 *                   overall_status: "eligible"
 *     responses:
 *       200:
 *         description: Student updated successfully
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
 *                   example: "Student updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     student_id:
 *                       type: integer
 *                       example: 1
 *                     first_name:
 *                       type: string
 *                       example: "Sneha"
 *                     last_name:
 *                       type: string
 *                       example: "Patil"
 *       400:
 *         description: Validation error or invalid data
 *       404:
 *         description: Student not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error - transaction rolled back, no changes saved
 */
router.put('/:id', StudentController.update);

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
 * /api/students/{studentId}/facility-records:
 *   post:
 *     summary: Add facility record (Facility Selection / Self Placement)
 *     description: |
 *       Add a facility/placement record for a student. This API supports both:
 *       - Facility Selection: Student selects from available facilities
 *       - Self Placement: Student adds their own facility details
 *     tags:
 *       - Students
 *       - Facility Selection
 *       - Self Placement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *         example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - facility_name
 *             properties:
 *               facility_name:
 *                 type: string
 *                 description: Name of the facility (dropdown or manual entry)
 *                 example: "Sydney General Hospital"
 *               facility_type:
 *                 type: string
 *                 description: Type of facility (dropdown)
 *                 example: "Hospital"
 *               branch_site:
 *                 type: string
 *                 description: Branch or site name
 *                 example: "Main Campus"
 *               facility_address:
 *                 type: string
 *                 description: Complete facility address
 *                 example: "789 Hospital Road, Sydney NSW 2000"
 *               contact_person_name:
 *                 type: string
 *                 description: Primary contact person at facility
 *                 example: "Dr. Sarah Smith"
 *               contact_email:
 *                 type: string
 *                 format: email
 *                 description: Contact person email
 *                 example: "sarah.smith@hospital.com"
 *               contact_phone:
 *                 type: string
 *                 description: Contact person phone number
 *                 example: "+61287654321"
 *               supervisor_name:
 *                 type: string
 *                 description: Name of supervisor at facility
 *                 example: "John Supervisor"
 *               distance_from_student_km:
 *                 type: integer
 *                 description: Distance from student's location in kilometers
 *                 example: 15
 *               slot_id:
 *                 type: string
 *                 description: Unique slot identifier
 *                 example: "SLOT-2026-001"
 *               course_type:
 *                 type: string
 *                 description: Type of course/training
 *                 example: "Clinical Placement"
 *               shift_timing:
 *                 type: string
 *                 description: Shift timing details
 *                 example: "Morning 8AM-4PM"
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: Placement start date
 *                 example: "2026-02-15"
 *               duration_hours:
 *                 type: integer
 *                 description: Total duration in hours
 *                 example: 120
 *               gender_requirement:
 *                 type: string
 *                 description: Gender requirement (dropdown)
 *                 enum: [Any, Male, Female]
 *                 example: "Any"
 *               applied_on:
 *                 type: string
 *                 format: date
 *                 description: Date when student applied
 *                 example: "2026-01-17"
 *               student_confirmed:
 *                 type: boolean
 *                 description: Student confirmation checkbox - "I confirm that I want to apply for this facility slot"
 *                 example: true
 *               student_comments:
 *                 type: string
 *                 description: Comments from student
 *                 example: "I confirm that I want to apply for this facility slot. Looking forward to this placement."
 *               document_type:
 *                 type: string
 *                 description: Type of document uploaded
 *                 example: "Offer Letter"
 *               file_path:
 *                 type: string
 *                 description: Path to uploaded document
 *                 example: "/uploads/documents/offer_letter.pdf"
 *               application_status:
 *                 type: string
 *                 description: Current application status
 *                 enum: [applied, under_review, accepted, rejected, confirmed, completed]
 *                 example: "applied"
 *     responses:
 *       201:
 *         description: Facility record added successfully
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
 *                   example: "Facility record added successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     facility_id:
 *                       type: integer
 *                       example: 1
 *                     student_id:
 *                       type: integer
 *                       example: 123
 *                     facility_name:
 *                       type: string
 *                       example: "Sydney General Hospital"
 *                     application_status:
 *                       type: string
 *                       example: "applied"
 *       400:
 *         description: Bad request - Invalid data or application_status
 *       404:
 *         description: Student not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/:studentId/facility-records', StudentController.addFacilityRecord);

/**
 * @swagger
 * /api/students/{studentId}/address-change-requests:
 *   post:
 *     summary: Add address change request and optionally update address
 *     description: |
 *       Submit a request to change student address. 
 *       
 *       **Three payload structures supported:**
 *       1. **Simple mode:** Provide current_address and new_address as text strings
 *       2. **Detailed mode:** Provide detailed address fields at root level
 *       3. **Nested mode (NEW):** Provide address fields at root + change_request nested object
 *       
 *       When detailed fields are provided, the API will:
 *       - Create an address change request record
 *       - Update the addresses table with the new address
 *       - Return both the request and the new address_id
 *     tags:
 *       - Students
 *       - Address Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               line1:
 *                 type: string
 *                 description: Address line 1 (triggers address table update)
 *                 example: "456 George Street"
 *               line2:
 *                 type: string
 *                 description: Address line 2
 *                 example: "Unit 12, Level 5"
 *               suburb:
 *                 type: string
 *                 description: Suburb
 *                 example: "Haymarket"
 *               city:
 *                 type: string
 *                 description: City
 *                 example: "Sydney"
 *               state:
 *                 type: string
 *                 description: State
 *                 example: "NSW"
 *               country:
 *                 type: string
 *                 description: Country
 *                 example: "Australia"
 *               postal_code:
 *                 type: string
 *                 description: Postal code
 *                 example: "2000"
 *               address_type:
 *                 type: string
 *                 enum: [current, permanent, temporary, mailing]
 *                 description: Type of address
 *                 example: "current"
 *               is_primary:
 *                 type: boolean
 *                 description: Set as primary address
 *                 example: true
 *               change_request:
 *                 type: object
 *                 description: Nested change request details (optional)
 *                 properties:
 *                   current_address:
 *                     type: string
 *                     example: "123 Main Street, Sydney NSW 2000"
 *                   new_address:
 *                     type: string
 *                     example: "789 New Street, Sydney NSW 2001"
 *                   effective_date:
 *                     type: string
 *                     format: date
 *                     example: "2026-03-01"
 *                   change_reason:
 *                     type: string
 *                     example: "Moving closer to placement facility"
 *                   impact_acknowledged:
 *                     type: boolean
 *                     example: true
 *                   status:
 *                     type: string
 *                     enum: [pending, approved, rejected, implemented]
 *                     example: "pending"
 *                   reviewed_at:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                   reviewed_by:
 *                     type: string
 *                     nullable: true
 *                   review_comments:
 *                     type: string
 *                     nullable: true
 *               current_address:
 *                 type: string
 *                 description: Current address (can be at root or in change_request)
 *                 example: "123 Main Street, Sydney NSW 2000"
 *               new_address:
 *                 type: string
 *                 description: New address (can be at root or in change_request)
 *                 example: "789 New Street, Sydney NSW 2001"
 *               effective_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-03-01"
 *               change_reason:
 *                 type: string
 *                 example: "Moving closer to placement facility"
 *               impact_acknowledged:
 *                 type: boolean
 *                 example: true
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected, implemented]
 *                 example: "pending"
 *           examples:
 *             nestedStructure:
 *               summary: Nested structure (your requested format)
 *               value:
 *                 line1: "456 George Street"
 *                 line2: "Unit 12, Level 5"
 *                 suburb: "Haymarket"
 *                 city: "Sydney"
 *                 state: "NSW"
 *                 country: "Australia"
 *                 postal_code: "2000"
 *                 address_type: "current"
 *                 is_primary: true
 *                 change_request:
 *                   current_address: "123 Main Street, Sydney NSW 2000"
 *                   new_address: "789 New Street, Sydney NSW 2001"
 *                   effective_date: "2026-03-01"
 *                   change_reason: "Moving closer to placement facility"
 *                   impact_acknowledged: true
 *                   status: "pending"
 *                   reviewed_at: null
 *                   reviewed_by: null
 *                   review_comments: null
 *             simpleMode:
 *               summary: Simple mode (existing functionality)
 *               value:
 *                 current_address: "101 Sunrise Apartments, Pune"
 *                 new_address: "200 Tech Hub, Pune"
 *                 effective_date: "2026-04-15"
 *                 change_reason: "Closer to training center"
 *                 impact_acknowledged: true
 *             detailedMode:
 *               summary: Detailed mode (flat structure)
 *               value:
 *                 line1: "456 George Street"
 *                 line2: "Unit 12, Level 5"
 *                 suburb: "Haymarket"
 *                 city: "Sydney"
 *                 state: "NSW"
 *                 country: "Australia"
 *                 postal_code: "2000"
 *                 address_type: "current"
 *                 is_primary: true
 *                 effective_date: "2026-04-15"
 *                 change_reason: "Relocated to Sydney"
 *                 impact_acknowledged: true
 *     responses:
 *       201:
 *         description: Address change request added successfully
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
 *                   example: "Address change request added successfully"
 *                 data:
 *                   oneOf:
 *                     - type: object
 *                       description: Simple mode response
 *                       properties:
 *                         acr_id:
 *                           type: integer
 *                           example: 1
 *                         student_id:
 *                           type: integer
 *                           example: 123
 *                         current_address:
 *                           type: string
 *                         new_address:
 *                           type: string
 *                         status:
 *                           type: string
 *                     - type: object
 *                       description: Detailed mode response (with address update)
 *                       properties:
 *                         address_change_request:
 *                           type: object
 *                           properties:
 *                             acr_id:
 *                               type: integer
 *                               example: 1
 *                             new_address:
 *                               type: string
 *                               example: "456 George Street, Unit 12, Level 5, Haymarket, Sydney, NSW, Australia, 2000"
 *                         address_updated:
 *                           type: boolean
 *                           example: true
 *                         new_address_id:
 *                           type: integer
 *                           example: 45
 *       400:
 *         description: Bad request
 *       404:
 *         description: Student not found
 */
router.post('/:studentId/address-change-requests', StudentController.addAddressChangeRequest);

/**
 * @swagger
 * /api/students/{studentId}/job-status-updates:
 *   post:
 *     summary: Add job status update
 *     description: Add or update student's job/employment status
 *     tags:
 *       - Students
 *       - Job Status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: "interview_scheduled"
 *               employer_name:
 *                 type: string
 *                 example: "Innovate Labs"
 *               job_role:
 *                 type: string
 *                 example: "Backend Developer"
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-10"
 *               employment_type:
 *                 type: string
 *                 example: "part_time"
 *               offer_letter_path:
 *                 type: string
 *                 example: "/documents/offer_letter.pdf"
 *               actively_applying:
 *                 type: boolean
 *                 example: true
 *               expected_timeline:
 *                 type: string
 *                 example: "Joining in April"
 *               searching_comments:
 *                 type: string
 *                 example: "Interview scheduled with HR"
 *     responses:
 *       201:
 *         description: Job status update added successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Student not found
 */
router.post('/:studentId/job-status-updates', StudentController.addJobStatusUpdate);

/**
 * @swagger
 * /api/students/{studentId}/self-placements:
 *   post:
 *     summary: Add self placement
 *     description: |
 *       Student adds their own facility placement with supporting documents.
 *       This is specifically for self-arranged placements that need admin review.
 *       Supports multiple document uploads: supporting documents, offer letter, and registration proof.
 *     tags:
 *       - Students
 *       - Self Placement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *         example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - facility_name
 *             properties:
 *               facility_name:
 *                 type: string
 *                 description: Name of the facility
 *                 example: "Community Health Clinic"
 *               facility_type:
 *                 type: string
 *                 description: Type of facility (dropdown)
 *                 example: "Clinic"
 *               facility_address:
 *                 type: string
 *                 description: Complete facility address
 *                 example: "88 Health Avenue, Adelaide SA 5000"
 *               contact_person_name:
 *                 type: string
 *                 description: Primary contact person name
 *                 example: "Dr. Michael Wong"
 *               contact_email:
 *                 type: string
 *                 format: email
 *                 description: Contact person email
 *                 example: "michael.wong@clinic.com"
 *               contact_phone:
 *                 type: string
 *                 description: Contact person phone number
 *                 example: "+61882345678"
 *               supervisor_name:
 *                 type: string
 *                 description: Supervisor name at facility
 *                 example: "Practice Manager Jane Smith"
 *               supporting_documents_path:
 *                 type: string
 *                 description: Path to supporting documents
 *                 example: "/uploads/self-placement/supporting_docs_123.pdf"
 *               offer_letter_path:
 *                 type: string
 *                 description: Path to offer/acceptance letter
 *                 example: "/uploads/self-placement/offer_letter_123.pdf"
 *               registration_proof_path:
 *                 type: string
 *                 description: Path to facility registration proof
 *                 example: "/uploads/self-placement/registration_proof_123.pdf"
 *               student_comments:
 *                 type: string
 *                 description: Student comments about the placement
 *                 example: "I arranged this placement myself with the clinic. They have agreed to supervise my training."
 *               status:
 *                 type: string
 *                 description: Application status
 *                 enum: [pending, under_review, approved, rejected]
 *                 default: pending
 *                 example: "pending"
 *     responses:
 *       201:
 *         description: Self placement added successfully
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
 *                   example: "Self placement added successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     placement_id:
 *                       type: integer
 *                       example: 1
 *                     student_id:
 *                       type: integer
 *                       example: 123
 *                     facility_name:
 *                       type: string
 *                       example: "Community Health Clinic"
 *                     status:
 *                       type: string
 *                       example: "pending"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid data or status
 *       404:
 *         description: Student not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/:studentId/self-placements', StudentController.addSelfPlacement);

/**
 * @swagger
 * /api/students/{studentId}/address-change-requests/{acrId}:
 *   put:
 *     summary: Update address change request
 *     description: Update an existing address change request with all fields optional
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *         example: 10
 *       - in: path
 *         name: acrId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Address Change Request ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               current_address:
 *                 type: string
 *                 example: "123 Old Street, Sydney"
 *               new_address:
 *                 type: string
 *                 example: "456 New Avenue, Melbourne"
 *               effective_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-03-01"
 *               change_reason:
 *                 type: string
 *                 example: "Relocating for work"
 *               impact_acknowledged:
 *                 type: boolean
 *                 example: true
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected, implemented]
 *                 example: "approved"
 *               reviewed_at:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-02-15T10:30:00Z"
 *               reviewed_by:
 *                 type: string
 *                 example: "Admin User"
 *               review_comments:
 *                 type: string
 *                 example: "Approved - valid reason provided"
 *     responses:
 *       200:
 *         description: Address change request updated successfully
 *       404:
 *         description: Address change request not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/:studentId/address-change-requests/:acrId', StudentController.updateAddressChangeRequest);

/**
 * @swagger
 * /api/students/{studentId}/job-status-updates/{jsuId}:
 *   put:
 *     summary: Update job status update
 *     description: Update an existing job status update with all fields optional
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *         example: 10
 *       - in: path
 *         name: jsuId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Job Status Update ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "employed"
 *               last_updated_on:
 *                 type: string
 *                 format: date
 *                 example: "2026-02-01"
 *               employer_name:
 *                 type: string
 *                 example: "Tech Corp Australia"
 *               job_role:
 *                 type: string
 *                 example: "Software Developer"
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-03-01"
 *               employment_type:
 *                 type: string
 *                 example: "full-time"
 *               offer_letter_path:
 *                 type: string
 *                 example: "/documents/offer_letter.pdf"
 *               actively_applying:
 *                 type: boolean
 *                 example: false
 *               expected_timeline:
 *                 type: string
 *                 example: "Started employment"
 *               searching_comments:
 *                 type: string
 *                 example: "Successfully placed"
 *     responses:
 *       200:
 *         description: Job status update updated successfully
 *       404:
 *         description: Job status update not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/:studentId/job-status-updates/:jsuId', StudentController.updateJobStatusUpdate);

/**
 * @swagger
 * /api/students/{studentId}/self-placements/{placementId}:
 *   put:
 *     summary: Update self placement
 *     description: Update an existing self placement with all fields optional
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *         example: 10
 *       - in: path
 *         name: placementId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Self Placement ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               facility_name:
 *                 type: string
 *                 example: "City Hospital"
 *               facility_type:
 *                 type: string
 *                 example: "Hospital"
 *               facility_address:
 *                 type: string
 *                 example: "789 Health Street, Sydney"
 *               contact_person_name:
 *                 type: string
 *                 example: "Dr. Smith"
 *               contact_email:
 *                 type: string
 *                 example: "dr.smith@cityhospital.com"
 *               contact_phone:
 *                 type: string
 *                 example: "+61-2-9999-8888"
 *               supervisor_name:
 *                 type: string
 *                 example: "Nurse Manager Jane"
 *               supporting_documents_path:
 *                 type: string
 *                 example: "/documents/supporting_docs.pdf"
 *               offer_letter_path:
 *                 type: string
 *                 example: "/documents/offer_letter.pdf"
 *               registration_proof_path:
 *                 type: string
 *                 example: "/documents/registration.pdf"
 *               status:
 *                 type: string
 *                 enum: [pending, under_review, approved, rejected]
 *                 example: "approved"
 *               student_comments:
 *                 type: string
 *                 example: "Updated facility contact information"
 *               reviewed_at:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-02-15T14:30:00Z"
 *               reviewed_by:
 *                 type: string
 *                 example: "Admin User"
 *               review_comments:
 *                 type: string
 *                 example: "Approved - all documents verified"
 *     responses:
 *       200:
 *         description: Self placement updated successfully
 *       404:
 *         description: Self placement not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/:studentId/self-placements/:placementId', StudentController.updateSelfPlacement);

/**
 * @swagger
 * /api/students/{studentId}/send-credentials:
 *   post:
 *     summary: Send login credentials to eligible student
 *     description: |
 *       Check student's eligibility status and send login credentials via email if eligible.
 *       Resets password for existing user account and updates statuses.
 *       
 *       **Eligibility Requirements:**
 *       - Student must have overall_status = 'eligible' or 'override'
 *       - Student must have valid email in contact details
 *       - Student must have existing user account (created during student creation)
 *       
 *       **What happens:**
 *       1. Checks eligibility status
 *       2. Generates secure temporary password
 *       3. Resets password for existing user account
 *       4. Updates user status to 'active'
 *       5. Updates student status to 'placement_initiated'
 *       6. Sends beautifully formatted email with credentials
 *       
 *       **Status Updates:**
 *       - User table: status → 'active'
 *       - Students table: status → 'placement_initiated'
 *     tags:
 *       - Students
 *       - Eligibility & Credentials
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *         example: 123
 *     responses:
 *       200:
 *         description: Credentials sent successfully
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
 *                   example: "Password reset and credentials sent successfully. User status set to active, student status set to placement_initiated."
 *                 data:
 *                   type: object
 *                   properties:
 *                     student_id:
 *                       type: integer
 *                       example: 123
 *                     user_id:
 *                       type: integer
 *                       example: 456
 *                     login_id:
 *                       type: string
 *                       example: "student@example.com"
 *                     user_status:
 *                       type: string
 *                       example: "active"
 *                     student_status:
 *                       type: string
 *                       example: "placement_initiated"
 *                     email_sent:
 *                       type: boolean
 *                       example: true
 *                     password_reset:
 *                       type: boolean
 *                       example: true
 *                     eligibility_status:
 *                       type: string
 *                       example: "eligible"
 *       400:
 *         description: Student not eligible or user account not found
 *       404:
 *         description: Student not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/:studentId/send-credentials', EligibilityCredentialController.sendCredentialsToStudent);

/**
 * @swagger
 * /api/students/batch-send-credentials:
 *   post:
 *     summary: Batch send credentials to all eligible students
 *     description: |
 *       Process all eligible students and send login credentials to those who don't have accounts yet.
 *       This is useful for bulk processing after eligibility updates.
 *       
 *       **Use Cases:**
 *       - After batch eligibility approval
 *       - Periodic credential distribution
 *       - Initial system setup
 *       
 *       **Process:**
 *       - Finds all students with status 'eligible' or 'override'
 *       - Skips students who already have user accounts (configurable)
 *       - Creates accounts and sends credentials
 *       - Returns detailed summary
 *     tags:
 *       - Students
 *       - Eligibility & Credentials
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               limit:
 *                 type: integer
 *                 default: 100
 *                 description: Maximum number of students to process
 *                 example: 50
 *               skipExistingUsers:
 *                 type: boolean
 *                 default: true
 *                 description: Skip students who already have user accounts
 *                 example: true
 *     responses:
 *       200:
 *         description: Batch processing completed
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
 *                   example: "Batch processing completed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_processed:
 *                       type: integer
 *                       example: 25
 *                     credentials_sent:
 *                       type: integer
 *                       example: 20
 *                     already_have_accounts:
 *                       type: integer
 *                       example: 3
 *                     not_eligible:
 *                       type: integer
 *                       example: 1
 *                     errors:
 *                       type: integer
 *                       example: 1
 *                     details:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           student_id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           success:
 *                             type: boolean
 *                           message:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/batch-send-credentials', EligibilityCredentialController.batchSendCredentials);

/**
 * @swagger
 * /api/students/{studentId}/notify-eligibility:
 *   post:
 *     summary: Send eligibility status notification
 *     description: |
 *       Send an email notification to student about their current eligibility status.
 *       Does NOT create user account - only sends status notification.
 *       
 *       **Status Types:**
 *       - eligible: Congratulations message
 *       - not_eligible: Requirements not met message
 *       - pending: Under review message
 *       - override: Override applied message
 *       
 *       **Use Cases:**
 *       - Notify students of status changes
 *       - Inform about pending requirements
 *       - Communicate eligibility decisions
 *     tags:
 *       - Students
 *       - Eligibility & Credentials
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *         example: 123
 *     responses:
 *       200:
 *         description: Notification sent successfully
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
 *                   example: "Eligibility status notification sent"
 *       400:
 *         description: Student or email not found
 *       404:
 *         description: Student not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/:studentId/notify-eligibility', EligibilityCredentialController.notifyEligibilityStatus);

// Old activate/deactivate routes removed
// Use generic activation API instead: PATCH /api/students/{id}/activate?activate={true|false}

export default router;
