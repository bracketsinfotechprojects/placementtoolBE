import express from 'express';
import { getRepository } from 'typeorm';
import { CourseAssignment } from '../../entities/course-assignment/course-assignment.entity';
import { CourseSlots } from '../../entities/course-slots/course-slots.entity';
import { User } from '../../entities/user/user.entity';
import CourseAssignmentService from '../../services/assignment/course-assignment.service';
import AssignmentService from '../../services/assignment/assignment.service';
import NotificationService from '../../services/notification/notification.service';
import courseAttendanceRouter from './course-attendance.route';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: CourseAssignments
 *     description: Course Assignment management endpoints
 */

/**
 * @swagger
 * /api/course-assignments:
 *   post:
 *     summary: Assign a student to a course with a trainer
 *     tags:
 *       - CourseAssignments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseAssignmentInput'
 *           example:
 *             course_id: 1
 *             trainer_id: 1
 *             student_id: 1
 *             enrollment_date: "2026-03-15"
 *             status: "Active"
 *     responses:
 *       201:
 *         description: Course assignment created successfully
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
 *                   example: "Course assignment created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/CourseAssignment'
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  '/',
  async (req: any, res: any) => {
    try {
      const courseAssignmentRepository = getRepository(CourseAssignment);
      
      const assignment = courseAssignmentRepository.create(req.body);
      const savedAssignment = await courseAssignmentRepository.save(assignment);

      // Notify admin and trainer when a student is booked into a workshop slot
      const courseSlot = await getRepository(CourseSlots).findOne({ where: { course_id: savedAssignment.course_id } });
      const courseName = courseSlot?.course_name || 'Workshop';

      const adminUsers = await getRepository(User).find({ where: { roleID: 1, isDeleted: false } });
      for (const admin of adminUsers) {
        NotificationService.createNotification({
          userId: admin.id,
          title: 'Student Booked Workshop Slot',
          message: `A student has been enrolled in "${courseName}". Review the course assignments.`,
          type: 'info',
          actionUrl: '/mh-fa-slot-management',
        }).catch(() => {});
      }

      if (savedAssignment.trainer_id) {
        const trainerUser = await getRepository(User).findOne({ where: { trainerID: savedAssignment.trainer_id, roleID: 5, isDeleted: false } });
        if (trainerUser) {
          NotificationService.createNotification({
            userId: trainerUser.id,
            title: 'New Student Enrolled in Your Workshop',
            message: `A new student has been enrolled in your "${courseName}" session. Check the attendance list.`,
            type: 'info',
            actionUrl: '/mh-fa-slot-management',
          }).catch(() => {});
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Course assignment created successfully',
        data: savedAssignment
      });
    } catch (error: any) {
      console.error('Error creating course assignment:', error);
      
      // Handle duplicate entry error with user-friendly message
      if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('UQ_CourseAssignments_unique')) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'This trainer, course, and student combination has already been assigned. Each trainer can only be assigned to a student for a specific course once.'
          }
        });
      }
      
      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to create course assignment'
        }
      });
    }
  }
);

/**
 * @swagger
 * /api/course-assignments:
 *   get:
 *     summary: Get all course assignments
 *     tags:
 *       - CourseAssignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: course_id
 *         schema:
 *           type: integer
 *         description: Filter by course ID
 *       - in: query
 *         name: trainer_id
 *         schema:
 *           type: integer
 *         description: Filter by trainer ID
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: integer
 *         description: Filter by student ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ['Active', 'Completed', 'Dropped']
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of course assignments
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
 *                     $ref: '#/components/schemas/CourseAssignment'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  '/',
  async (req: any, res: any) => {
    try {
      const courseAssignmentRepository = getRepository(CourseAssignment);
      const { course_id, trainer_id, student_id, status } = req.query;
      
      const queryBuilder = courseAssignmentRepository.createQueryBuilder('assignment')
        .where('assignment.isDeleted = :isDeleted', { isDeleted: false });
      
      if (course_id) {
        queryBuilder.andWhere('assignment.course_id = :courseId', { courseId: course_id });
      }
      
      if (trainer_id) {
        queryBuilder.andWhere('assignment.trainer_id = :trainerId', { trainerId: trainer_id });
      }
      
      if (student_id) {
        queryBuilder.andWhere('assignment.student_id = :studentId', { studentId: student_id });
      }
      
      if (status) {
        queryBuilder.andWhere('assignment.status = :status', { status });
      }
      
      const assignments = await queryBuilder.getMany();
      
      return res.status(200).json({
        success: true,
        count: assignments.length,
        data: assignments
      });
    } catch (error: any) {
      console.error('Error fetching course assignments:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to fetch course assignments'
        }
      });
    }
  }
);

/**
 * @swagger
 * /api/course-assignments/{id}:
 *   get:
 *     summary: Get a course assignment by ID
 *     tags:
 *       - CourseAssignments
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
 *         description: Course assignment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CourseAssignment'
 *       404:
 *         description: Course assignment not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:id',
  async (req: any, res: any) => {
    try {
      const courseAssignmentRepository = getRepository(CourseAssignment);
      const { id } = req.params;
      
      const assignment = await courseAssignmentRepository.findOne({
        where: { assignment_id: parseInt(id), isDeleted: false }
      });
      
      if (!assignment) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Course assignment not found'
          }
        });
      }
      
      return res.status(200).json({
        success: true,
        data: assignment
      });
    } catch (error: any) {
      console.error('Error fetching course assignment:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to fetch course assignment'
        }
      });
    }
  }
);

/**
 * @swagger
 * /api/course-assignments/{id}:
 *   put:
 *     summary: Update a course assignment
 *     tags:
 *       - CourseAssignments
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
 *             $ref: '#/components/schemas/CourseAssignmentInput'
 *     responses:
 *       200:
 *         description: Course assignment updated successfully
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
 *                   example: "Course assignment updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/CourseAssignment'
 *       404:
 *         description: Course assignment not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put(
  '/:id',
  async (req: any, res: any) => {
    try {
      const courseAssignmentRepository = getRepository(CourseAssignment);
      const { id } = req.params;
      
      const assignment = await courseAssignmentRepository.findOne({
        where: { assignment_id: parseInt(id), isDeleted: false }
      });
      
      if (!assignment) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Course assignment not found'
          }
        });
      }
      
      courseAssignmentRepository.merge(assignment, req.body);
      const updatedAssignment = await courseAssignmentRepository.save(assignment);
      
      return res.status(200).json({
        success: true,
        message: 'Course assignment updated successfully',
        data: updatedAssignment
      });
    } catch (error: any) {
      console.error('Error updating course assignment:', error);
      
      // Handle duplicate entry error with user-friendly message
      if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('UQ_CourseAssignments_unique')) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'This trainer, course, and student combination has already been assigned. Each trainer can only be assigned to a student for a specific course once.'
          }
        });
      }
      
      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to update course assignment'
        }
      });
    }
  }
);

/**
 * @swagger
 * /api/course-assignments/{id}:
 *   delete:
 *     summary: Delete a course assignment (soft delete)
 *     tags:
 *       - CourseAssignments
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
 *         description: Course assignment deleted successfully
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
 *                   example: "Course assignment deleted successfully"
 *       404:
 *         description: Course assignment not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:id',
  async (req: any, res: any) => {
    try {
      const courseAssignmentRepository = getRepository(CourseAssignment);
      const { id } = req.params;
      
      const assignment = await courseAssignmentRepository.findOne({
        where: { assignment_id: parseInt(id), isDeleted: false }
      });
      
      if (!assignment) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Course assignment not found'
          }
        });
      }
      
      assignment.isDeleted = true;
      await courseAssignmentRepository.save(assignment);
      
      return res.status(200).json({
        success: true,
        message: 'Course assignment deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting course assignment:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to delete course assignment'
        }
      });
    }
  }
);

/**
 * @swagger
 * /api/course-assignments/trainer/{trainerId}/students:
 *   get:
 *     summary: Get all students assigned to courses (optionally filtered by trainer)
 *     tags:
 *       - CourseAssignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         required: false
 *         schema:
 *           type: integer
 *         description: Trainer ID (optional - use 'all' to get students from all trainers)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ['Active', 'Completed', 'Dropped']
 *         description: Filter by assignment status, defaults to Active
 *       - in: query
 *         name: course_id
 *         schema:
 *           type: integer
 *         description: Filter by specific course ID
 *     responses:
 *       200:
 *         description: List of courses with their enrolled students
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 trainer_id:
 *                   type: integer
 *                   nullable: true
 *                   example: 1
 *                 total_students:
 *                   type: integer
 *                   example: 15
 *                 courses_count:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       course:
 *                         type: object
 *                         properties:
 *                           course_id:
 *                             type: integer
 *                           course_name:
 *                             type: string
 *                           course_category:
 *                             type: array
 *                             items:
 *                               type: string
 *                           course_date:
 *                             type: string
 *                             format: date
 *                           training_location:
 *                             type: string
 *                           address:
 *                             type: string
 *                           city:
 *                             type: string
 *                       students:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             assignment_id:
 *                               type: integer
 *                             enrollment_date:
 *                               type: string
 *                               format: date
 *                             status:
 *                               type: string
 *                               enum: ['Active', 'Completed', 'Dropped']
 *                             attendance_status:
 *                               type: string
 *                               enum: ['present', 'absent', 'late', 'early_departure', 'half_day', 'leave']
 *                               nullable: true
 *                             student:
 *                               type: object
 *                               properties:
 *                                 student_id:
 *                                   type: integer
 *                                 first_name:
 *                                   type: string
 *                                 last_name:
 *                                   type: string
 *                                 email:
 *                                   type: string
 *                                   nullable: true
 *                                 phone:
 *                                   type: string
 *                                   nullable: true
 *                                 status:
 *                                   type: string
 *       404:
 *         description: No students found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "No students found"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  '/trainer/:trainerId/students',
  async (req: any, res: any) => {
    try {
      const { trainerId } = req.params;
      const { status, course_id } = req.query;
      
      const result = await CourseAssignmentService.getStudentsForTrainer(
        trainerId, 
        { status, course_id }
      );
      
      if (!result) {
        const message = trainerId && trainerId !== 'all' 
          ? 'No students found for this trainer' 
          : 'No students found';
        return res.status(404).json(
          AssignmentService.createErrorResponse(message)
        );
      }
      
      return res.status(200).json(result);
      
    } catch (error: any) {
      console.error('Error fetching course students:', error);
      return res.status(500).json(
        AssignmentService.createErrorResponse(
          error.message || 'Failed to fetch course students'
        )
      );
    }
  }
);

/**
 * @swagger
 * /api/course-assignments/courses/{courseId}/students:
 *   get:
 *     summary: Get all students enrolled in a specific course
 *     tags:
 *       - CourseAssignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ['Active', 'Completed', 'Dropped']
 *         description: Filter by assignment status, defaults to Active
 *     responses:
 *       200:
 *         description: Course details with enrolled students
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 course_id:
 *                   type: integer
 *                   example: 1
 *                 total_students:
 *                   type: integer
 *                   example: 15
 *                 course:
 *                   type: object
 *                   properties:
 *                     course_id:
 *                       type: integer
 *                     course_name:
 *                       type: string
 *                     course_category:
 *                       type: array
 *                       items:
 *                         type: string
 *                     course_date:
 *                       type: string
 *                       format: date
 *                     training_location:
 *                       type: string
 *                     address:
 *                       type: string
 *                     city:
 *                       type: string
 *                 students:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       assignment_id:
 *                         type: integer
 *                       enrollment_date:
 *                         type: string
 *                         format: date
 *                       status:
 *                         type: string
 *                         enum: ['Active', 'Completed', 'Dropped']
 *                       attendance_status:
 *                         type: string
 *                         enum: ['present', 'absent', 'late', 'early_departure', 'half_day', 'leave']
 *                         nullable: true
 *                       student:
 *                         type: object
 *                         properties:
 *                           student_id:
 *                             type: integer
 *                           first_name:
 *                             type: string
 *                           last_name:
 *                             type: string
 *                           email:
 *                             type: string
 *                             nullable: true
 *                           phone:
 *                             type: string
 *                             nullable: true
 *                           status:
 *                             type: string
 *       404:
 *         description: Course not found or no students enrolled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "No students found for this course"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  '/courses/:courseId/students',
  async (req: any, res: any) => {
    try {
      const { courseId } = req.params;
      const { status } = req.query;
      
      const result = await CourseAssignmentService.getStudentsForCourse(
        parseInt(courseId), 
        { status }
      );
      
      if (!result) {
        return res.status(404).json(
          AssignmentService.createErrorResponse('No students found for this course')
        );
      }
      
      return res.status(200).json(result);
      
    } catch (error: any) {
      console.error('Error fetching course students:', error);
      return res.status(500).json(
        AssignmentService.createErrorResponse(
          error.message || 'Failed to fetch course students'
        )
      );
    }
  }
);

// Include course attendance and certificate routes
router.use('', courseAttendanceRouter);

export default router;