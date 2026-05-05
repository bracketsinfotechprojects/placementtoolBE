import express from 'express';
import CourseAssignmentService from '../../services/assignment/course-assignment.service';
import AssignmentService from '../../services/assignment/assignment.service';

const router = express.Router();

// Get students for trainer
router.get('/trainer/:trainerId/students', async (req: any, res: any) => {
  try {
    const { trainerId } = req.params;
    const { status, course_id } = req.query;
    const result = await CourseAssignmentService.getStudentsForTrainer(trainerId, { status, course_id });
    if (!result) {
      const message = trainerId && trainerId !== 'all' ? 'No students found for this trainer' : 'No students found';
      return res.status(404).json(AssignmentService.createErrorResponse(message));
    }
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error fetching course students:', error);
    return res.status(500).json(
      AssignmentService.createErrorResponse(error.message || 'Failed to fetch course students')
    );
  }
});

// Get students for course
router.get('/courses/:courseId/students', async (req: any, res: any) => {
  try {
    const { courseId } = req.params;
    const { status } = req.query;
    const result = await CourseAssignmentService.getStudentsForCourse(parseInt(courseId), { status });
    if (!result) {
      return res.status(404).json(
        AssignmentService.createErrorResponse('No students found for this course')
      );
    }
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error fetching course students:', error);
    return res.status(500).json(
      AssignmentService.createErrorResponse(error.message || 'Failed to fetch course students')
    );
  }
});

export default router;
