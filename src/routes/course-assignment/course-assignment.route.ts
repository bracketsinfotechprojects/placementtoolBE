import express from 'express';
import { getRepository } from 'typeorm';
import { CourseAssignment } from '../../entities/course-assignment/course-assignment.entity';

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
      
      return res.status(201).json({
        success: true,
        message: 'Course assignment created successfully',
        data: savedAssignment
      });
    } catch (error: any) {
      console.error('Error creating course assignment:', error);
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
 *     summary: Get all course assignments with full details
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
 *         description: List of course assignments with related course, trainer and student details
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
 *                     allOf:
 *                       - $ref: '#/components/schemas/CourseAssignment'
 *                       - type: object
 *                         properties:
 *                           course:
 *                             type: object
 *                             description: Full course details
 *                           trainer:
 *                             type: object
 *                             description: Full trainer details
 *                           student:
 *                             type: object
 *                             description: Full student details
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
        .leftJoinAndSelect('assignment.course', 'course')
        .leftJoinAndSelect('assignment.trainer', 'trainer')
        .leftJoinAndSelect('assignment.student', 'student')
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

export default router;