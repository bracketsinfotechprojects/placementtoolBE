import express from 'express';
import { getRepository } from 'typeorm';
import { CourseSlots } from '../../entities/course-slots/course-slots.entity';
import { CourseAssignment } from '../../entities/course-assignment/course-assignment.entity';
import { EligibilityStatus } from '../../entities/student/eligibility-status.entity';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: CourseSlots
 *     description: Course Slots management endpoints
 */

/**
 * @swagger
 * /api/course-slots:
 *   post:
 *     summary: Create a new course slot
 *     tags:
 *       - CourseSlots
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseSlotsInput'
 *           example:
 *             course_name: "Manual Handling Training"
 *             course_category: ["Manual Handling"]
 *             course_type: ["Accredited"]
 *             course_scope: ["Aged Care", "Disability"]
 *             course_date: "2026-03-15"
 *             day_of_week: "Monday"
 *             reporting_time: "09:00:00"
 *             expected_end_time: "13:00:00"
 *             total_duration: "4 hours"
 *             mode: ["Onsite"]
 *             training_location: "ABC Training Center"
 *             address: "123 Training Street, Sydney NSW 2000"
 *             city: "Sydney"
 *             google_maps_link: "https://maps.google.com/?q=123+Training+Street+Sydney"
 *             total_seats: 20
 *             seats_remaining: 15
 *             seat_status: "Available"
 *             last_booking_date: "2026-03-10"
 *             certificate_type: ["Digital"]
 *             certificate_validity: "12 months"
 *             issuing_authority: ["Institute"]
 *             certificate_issue_timeline: "Same Day"
 *             target_audience: ["External", "Internal"]
 *             documents_required: ["ID Proof", "Payment Receipt"]
 *             pre_course_requirement: ["Online Module"]
 *             dress_code: "Comfortable clothing, closed-toe shoes"
 *             items_to_bring: ["Notebook & Pen", "Water Bottle"]
 *             mobile_phone_policy: "Silent"
 *             trainer_id: 1
 *             created_by: "admin"
 *     responses:
 *       201:
 *         description: Course slot created successfully
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
 *                   example: "Course slot created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/CourseSlots'
 *       400:
 *         description: Bad request - Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  '/',
  async (req: any, res: any) => {
    try {
      const courseSlotsRepository = getRepository(CourseSlots);
      
      const courseSlot = courseSlotsRepository.create(req.body);
      const savedCourseSlot = await courseSlotsRepository.save(courseSlot);
      
      return res.status(201).json({
        success: true,
        message: 'Course slot created successfully',
        data: savedCourseSlot
      });
    } catch (error: any) {
      console.error('Error creating course slot:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to create course slot'
        }
      });
    }
  }
);

/**
 * @swagger
 * /api/course-slots:
 *   get:
 *     summary: Get all course slots
 *     tags:
 *       - CourseSlots
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: course_category
 *         schema:
 *           type: string
 *           enum: ['Manual Handling', 'First Aid']
 *         description: Filter by course category
 *       - in: query
 *         name: seat_status
 *         schema:
 *           type: string
 *           enum: ['Available', 'Filling Fast', 'Full']
 *         description: Filter by seat status
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: trainer_id
 *         schema:
 *           type: integer
 *         description: Filter by trainer ID
 *     responses:
 *       200:
 *         description: List of course slots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CourseSlots'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  '/',
  async (req: any, res: any) => {
    try {
      const courseSlotsRepository = getRepository(CourseSlots);
      const courseAssignmentRepository = getRepository(CourseAssignment);
      const eligibilityStatusRepository = getRepository(EligibilityStatus);
      const { course_category, seat_status, city, trainer_id } = req.query;
      
      const queryBuilder = courseSlotsRepository.createQueryBuilder('courseSlot')
        .where('courseSlot.isDeleted = :isDeleted', { isDeleted: false });
      
      if (course_category) {
        queryBuilder.andWhere('FIND_IN_SET(:category, courseSlot.course_category) > 0', { category: course_category });
      }
      
      if (seat_status) {
        queryBuilder.andWhere('courseSlot.seat_status = :seatStatus', { seatStatus: seat_status });
      }
      
      if (city) {
        queryBuilder.andWhere('courseSlot.city = :city', { city });
      }
      
      if (trainer_id) {
        queryBuilder.andWhere('courseSlot.trainer_id = :trainerId', { trainerId: trainer_id });
      }
      
      const courseSlots = await queryBuilder.getMany();
      
      // Transform response to include eligibility_status with boolean to 0/1 conversion
      const enhancedCourseSlots = await Promise.all(
        courseSlots.map(async (slot) => {
          // Fetch all assignments for this course
          const assignments = await courseAssignmentRepository.find({
            where: { course_id: slot.course_id, isDeleted: false }
          });
          
          // Fetch eligibility status for all enrolled students
          const eligibilityStatuses = await Promise.all(
            assignments.map(async (assignment) => {
              const eligibility = await eligibilityStatusRepository.findOne({
                where: { student_id: assignment.student_id }
              });
              return eligibility;
            })
          );
          
          // Map eligibility statuses to response format (boolean to 0/1)
          const eligibilityStatusArray = eligibilityStatuses
            .filter(es => es !== null && es !== undefined)
            .map(es => {
              if (!es) return null;
              return {
                status_id: es.status_id,
                student_id: es.student_id,
                classes_completed: es.classes_completed ? 1 : 0,
                fees_paid: es.fees_paid ? 1 : 0,
                assignments_submitted: es.assignments_submitted ? 1 : 0,
                documents_submitted: es.documents_submitted ? 1 : 0,
                trainer_consent: es.trainer_consent ? 1 : 0,
                override_requested: es.override_requested ? 1 : 0,
                manual_override: es.manual_override ? 1 : 0,
                manual_handling: es.manual_handling ? 1 : 0,
                requested_by: es.requested_by || null,
                reason: es.reason || null,
                comments: es.comments || null,
                overall_status: es.overall_status
              };
            })
            .filter(es => es !== null);
          
          return {
            ...slot,
            eligibility_status: eligibilityStatusArray
          };
        })
      );
      
      return res.status(200).json({
        success: true,
        count: enhancedCourseSlots.length,
        data: enhancedCourseSlots
      });
    } catch (error: any) {
      console.error('Error fetching course slots:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to fetch course slots'
        }
      });
    }
  }
);

/**
 * @swagger
 * /api/course-slots/by-trainer/{trainerId}:
 *   get:
 *     summary: Get all course slots by trainer ID with trainer details
 *     description: Fetches all courses created/assigned to a specific trainer. Works for both admin and trainer logins. Returns courses regardless of student assignments.
 *     tags:
 *       - CourseSlots
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Trainer ID to fetch courses for
 *     responses:
 *       200:
 *         description: List of course slots with trainer details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/CourseSlots'
 *                       - type: object
 *                         properties:
 *                           trainer:
 *                             type: object
 *                             description: Full trainer details
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  '/by-trainer/:trainerId',
  async (req: any, res: any) => {
    try {
      const courseSlotsRepository = getRepository(CourseSlots);
      const { trainerId } = req.params;
      
      const queryBuilder = courseSlotsRepository.createQueryBuilder('courseSlot')
        .leftJoinAndSelect('courseSlot.trainer', 'trainer')
        .where('courseSlot.isDeleted = :isDeleted', { isDeleted: false })
        .andWhere('courseSlot.trainer_id = :trainerId', { trainerId: parseInt(trainerId) });
      
      const courseSlots = await queryBuilder.getMany();
      
      return res.status(200).json({
        success: true,
        count: courseSlots.length,
        data: courseSlots
      });
    } catch (error: any) {
      console.error('Error fetching course slots by trainer:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to fetch course slots by trainer'
        }
      });
    }
  }
);

/**
 * @swagger
 * /api/course-slots/{id}:
 *   get:
 *     summary: Get a course slot by ID
 *     tags:
 *       - CourseSlots
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course slot ID
 *     responses:
 *       200:
 *         description: Course slot details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CourseSlots'
 *       404:
 *         description: Course slot not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:id',
  async (req: any, res: any) => {
    try {
      const courseSlotsRepository = getRepository(CourseSlots);
      const { id } = req.params;
      
      const courseSlot = await courseSlotsRepository.findOne({
        where: { course_id: parseInt(id), isDeleted: false }
      });
      
      if (!courseSlot) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Course slot not found'
          }
        });
      }
      
      return res.status(200).json({
        success: true,
        data: courseSlot
      });
    } catch (error: any) {
      console.error('Error fetching course slot:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to fetch course slot'
        }
      });
    }
  }
);

/**
 * @swagger
 * /api/course-slots/{id}:
 *   put:
 *     summary: Update a course slot
 *     tags:
 *       - CourseSlots
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course slot ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseSlotsInput'
 *     responses:
 *       200:
 *         description: Course slot updated successfully
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
 *                   example: "Course slot updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/CourseSlots'
 *       404:
 *         description: Course slot not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put(
  '/:id',
  async (req: any, res: any) => {
    try {
      const courseSlotsRepository = getRepository(CourseSlots);
      const { id } = req.params;
      
      const courseSlot = await courseSlotsRepository.findOne({
        where: { course_id: parseInt(id), isDeleted: false }
      });
      
      if (!courseSlot) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Course slot not found'
          }
        });
      }
      
      courseSlotsRepository.merge(courseSlot, req.body);
      const updatedCourseSlot = await courseSlotsRepository.save(courseSlot);
      
      return res.status(200).json({
        success: true,
        message: 'Course slot updated successfully',
        data: updatedCourseSlot
      });
    } catch (error: any) {
      console.error('Error updating course slot:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to update course slot'
        }
      });
    }
  }
);

/**
 * @swagger
 * /api/course-slots/{id}:
 *   delete:
 *     summary: Delete a course slot (soft delete)
 *     tags:
 *       - CourseSlots
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course slot ID
 *     responses:
 *       200:
 *         description: Course slot deleted successfully
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
 *                   example: "Course slot deleted successfully"
 *       404:
 *         description: Course slot not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:id',
  async (req: any, res: any) => {
    try {
      const courseSlotsRepository = getRepository(CourseSlots);
      const { id } = req.params;
      
      const courseSlot = await courseSlotsRepository.findOne({
        where: { course_id: parseInt(id), isDeleted: false }
      });
      
      if (!courseSlot) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Course slot not found'
          }
        });
      }
      
      courseSlot.isDeleted = true;
      await courseSlotsRepository.save(courseSlot);
      
      return res.status(200).json({
        success: true,
        message: 'Course slot deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting course slot:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to delete course slot'
        }
      });
    }
  }
);

export default router;