import express from 'express';
import { getRepository } from 'typeorm';
import { CourseSlots } from '../../entities/course-slots/course-slots.entity';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: ShortCourse
 *     description: Short Course endpoints
 */

/**
 * @swagger
 * /api/short-course:
 *   get:
 *     summary: Get all short courses
 *     description: Fetches a list of all available short courses with their details
 *     tags:
 *       - ShortCourse
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
 *         name: mode
 *         schema:
 *           type: string
 *           enum: ['Onsite', 'Online', 'Hybrid']
 *         description: Filter by course mode
 *     responses:
 *       200:
 *         description: List of all short courses
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
      const { course_category, seat_status, city, mode } = req.query;
      
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
      
      if (mode) {
        queryBuilder.andWhere('FIND_IN_SET(:mode, courseSlot.mode) > 0', { mode });
      }
      
      const courses = await queryBuilder.getMany();
      
      return res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
      });
    } catch (error: any) {
      console.error('Error fetching short courses:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to fetch short courses'
        }
      });
    }
  }
);

export default router;
