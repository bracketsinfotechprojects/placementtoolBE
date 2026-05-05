import express from 'express';
import { getRepository } from 'typeorm';
import { CourseSlots } from '../../entities/course-slots/course-slots.entity';

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
 *         