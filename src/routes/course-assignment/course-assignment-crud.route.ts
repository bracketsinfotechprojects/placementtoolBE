import express from 'express';
import { getRepository } from 'typeorm';
import { CourseAssignment } from '../../entities/course-assignment/course-assignment.entity';

const router = express.Router();

// Create
router.post('/', async (req: any, res: any) => {
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
      error: { message: error.message || 'Failed to create course assignment' }
    });
  }
});

// Read
router.get('/', async (req: any, res: any) => {
  try {
    const courseAssignmentRepository = getRepository(CourseAssignment);
    const { course_id, trainer_id, student_id, status } = req.query;
    const queryBuilder = courseAssignmentRepository.createQueryBuilder('assignment')
      .where('assignment.isDeleted = :isDeleted', { isDeleted: false });
    if (course_id) queryBuilder.andWhere('assignment.course_id = :courseId', { courseId: course_id });
    if (trainer_id) queryBuilder.andWhere('assignment.trainer_id = :trainerId', { trainerId: trainer_id });
    if (student_id) queryBuilder.andWhere('assignment.student_id = :studentId', { studentId: student_id });
    if (status) queryBuilder.andWhere('assignment.status = :status', { status });
    const assignments = await queryBuilder.getMany();
    return res.status(200).json({ success: true, count: assignments.length, data: assignments });
  } catch (error: any) {
    console.error('Error fetching course assignments:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to fetch course assignments' }
    });
  }
});

router.get('/:id', async (req: any, res: any) => {
  try {
    const courseAssignmentRepository = getRepository(CourseAssignment);
    const assignment = await courseAssignmentRepository.findOne({
      where: { assignment_id: parseInt(req.params.id), isDeleted: false }
    });
    if (!assignment) {
      return res.status(404).json({ success: false, error: { message: 'Course assignment not found' } });
    }
    return res.status(200).json({ success: true, data: assignment });
  } catch (error: any) {
    console.error('Error fetching course assignment:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to fetch course assignment' }
    });
  }
});

// Update
router.put('/:id', async (req: any, res: any) => {
  try {
    const courseAssignmentRepository = getRepository(CourseAssignment);
    const assignment = await courseAssignmentRepository.findOne({
      where: { assignment_id: parseInt(req.params.id), isDeleted: false }
    });
    if (!assignment) {
      return res.status(404).json({ success: false, error: { message: 'Course assignment not found' } });
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
      error: { message: error.message || 'Failed to update course assignment' }
    });
  }
});

// Delete
router.delete('/:id', async (req: any, res: any) => {
  try {
    const courseAssignmentRepository = getRepository(CourseAssignment);
    const assignment = await courseAssignmentRepository.findOne({
      where: { assignment_id: parseInt(req.params.id), isDeleted: false }
    });
    if (!assignment) {
      return res.status(404).json({ success: false, error: { message: 'Course assignment not found' } });
    }
    assignment.isDeleted = true;
    await courseAssignmentRepository.save(assignment);
    return res.status(200).json({ success: true, message: 'Course assignment deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting course assignment:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to delete course assignment' }
    });
  }
});

export default router;
