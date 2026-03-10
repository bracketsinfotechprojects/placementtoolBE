import { getRepository } from 'typeorm';
import { CourseAssignment } from '../../entities/course-assignment/course-assignment.entity';
import AssignmentService, { IQueryFilters, IAssignmentData } from './assignment.service';

/**
 * Course Assignment Service - Follows Single Responsibility Principle
 * Handles only course assignment business logic
 * Extends base AssignmentService to follow DRY principle
 */
export default class CourseAssignmentService extends AssignmentService {

  /**
   * Get students for a specific course
   * Follows Open/Closed Principle - can be extended without modification
   */
  static async getStudentsForCourse(courseId: number, filters: IQueryFilters = {}) {
    const courseAssignmentRepository = getRepository(CourseAssignment);
    const { status = 'Active' } = filters;
    
    const queryBuilder = courseAssignmentRepository.createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.course', 'course')
      .leftJoinAndSelect('assignment.student', 'student')
      .leftJoinAndSelect('student.contact_details', 'contact')
      .where('assignment.course_id = :courseId', { courseId })
      .andWhere('assignment.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('student.first_name', 'ASC')
      .addOrderBy('student.last_name', 'ASC');
    
    this.applyCommonFilters(queryBuilder, { status });
    
    const assignments = await queryBuilder.getMany();
    
    if (assignments.length === 0) {
      return null;
    }
    
    const courseDetails = assignments[0].course;
    const students = assignments.map(assignment => 
      this.formatAssignmentData(assignment, true)
    );
    
    return this.createSuccessResponse({
      course_id: courseId,
      total_students: students.length,
      course: {
        course_id: courseDetails.course_id,
        course_name: courseDetails.course_name,
        course_category: courseDetails.course_category,
        course_date: courseDetails.course_date,
        training_location: courseDetails.training_location,
        address: courseDetails.address,
        city: courseDetails.city
      },
      students: students
    });
  }

  /**
   * Get students for trainer (with optional course filtering)
   * Follows Single Responsibility Principle
   */
  static async getStudentsForTrainer(trainerId: string | number, filters: IQueryFilters = {}) {
    const courseAssignmentRepository = getRepository(CourseAssignment);
    const { status = 'Active', course_id } = filters;
    
    const queryBuilder = courseAssignmentRepository.createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.course', 'course')
      .leftJoinAndSelect('assignment.student', 'student')
      .leftJoinAndSelect('student.contact_details', 'contact')
      .where('assignment.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('course.course_date', 'ASC')
      .addOrderBy('student.first_name', 'ASC');
    
    // Apply trainer filter only if not 'all'
    if (trainerId && trainerId !== 'all') {
      queryBuilder.andWhere('assignment.trainer_id = :trainerId', { 
        trainerId: parseInt(trainerId.toString()) 
      });
    }
    
    this.applyCommonFilters(queryBuilder, { status });
    
    if (course_id) {
      queryBuilder.andWhere('assignment.course_id = :courseId', { courseId: course_id });
    }
    
    const assignments = await queryBuilder.getMany();
    
    if (assignments.length === 0) {
      return null;
    }
    
    // Group by course using centralized method
    const courseGroups = this.groupAssignmentsByKey(
      assignments,
      (assignment) => assignment.course_id,
      (assignment) => ({
        course: {
          course_id: assignment.course.course_id,
          course_name: assignment.course.course_name,
          course_category: assignment.course.course_category,
          course_date: assignment.course.course_date,
          training_location: assignment.course.training_location,
          address: assignment.course.address,
          city: assignment.course.city
        },
        students: []
      })
    );
    
    // Add students to each course group
    assignments.forEach(assignment => {
      const courseId = assignment.course_id.toString();
      courseGroups[courseId].students.push(this.formatAssignmentData(assignment, true));
    });
    
    const uniqueCourses = new Set(assignments.map(a => a.course_id));
    
    return this.createSuccessResponse({
      trainer_id: trainerId && trainerId !== 'all' ? parseInt(trainerId.toString()) : null,
      total_students: assignments.length,
      courses_count: uniqueCourses.size,
      data: Object.values(courseGroups)
    });
  }
}