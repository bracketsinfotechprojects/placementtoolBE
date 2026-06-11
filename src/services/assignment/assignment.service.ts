import { getRepository } from 'typeorm';
import { CourseAssignment } from '../../entities/course-assignment/course-assignment.entity';
import { PlacementAssignment } from '../../entities/placement-assignment/placement-assignment.entity';

/**
 * Common interfaces for assignment services
 */
export interface IStudentData {
  student_id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  status: string;
}

export interface IAssignmentData {
  assignment_id: number;
  start_date?: Date | null;
  end_date?: Date | null;
  enrollment_date?: Date | null;
  status: string;
  notes?: string | null;
  attendance_status?: string | null;
  student: IStudentData;
}

export interface IQueryFilters {
  status?: string;
  course_id?: number;
  trainer_id?: number;
  facility_id?: string;
  placement_slot_id?: number;
}

/**
 * Base Assignment Service - Implements DRY principle by centralizing common operations
 * Follows Single Responsibility Principle by handling only assignment-related business logic
 */
export default class AssignmentService {

  /**
   * Extract primary contact details from student entity
   * Centralized to follow DRY principle
   */
  static extractStudentContactDetails(student: any): IStudentData {
    const primaryContact = student.contact_details?.[0];
    
    return {
      student_id: student.student_id,
      first_name: student.first_name,
      last_name: student.last_name,
      email: primaryContact?.email || null,
      phone: primaryContact?.primary_mobile || null,
      status: student.status
    };
  }

  /**
   * Build common query filters for assignments
   * Centralized to follow DRY principle
   */
  static applyCommonFilters(queryBuilder: any, filters: IQueryFilters): void {
    if (filters.status) {
      queryBuilder.andWhere('assignment.status = :status', { status: filters.status });
    }
  }

  /**
   * Format assignment data with student details
   * Centralized to follow DRY principle
   */
  static formatAssignmentData(assignment: any, includeEnrollmentDate: boolean = false): IAssignmentData {
    const studentData = this.extractStudentContactDetails(assignment.student);
    
    const assignmentData: IAssignmentData = {
      assignment_id: assignment.assignment_id,
      start_date: assignment.start_date,
      end_date: assignment.end_date,
      status: assignment.status,
      notes: assignment.notes,
      attendance_status: assignment.attendance_status,
      student: studentData
    };

    if (includeEnrollmentDate && assignment.enrollment_date) {
      assignmentData.enrollment_date = assignment.enrollment_date;
    }

    return assignmentData;
  }

  /**
   * Group assignments by a specific key
   * Centralized to follow DRY principle
   */
  static groupAssignmentsByKey<T>(
    assignments: any[], 
    keyExtractor: (assignment: any) => string | number,
    dataExtractor: (assignment: any) => T
  ): { [key: string]: T } {
    return assignments.reduce((acc: { [key: string]: T }, assignment) => {
      const key = keyExtractor(assignment).toString();
      if (!acc[key]) {
        acc[key] = dataExtractor(assignment);
      }
      return acc;
    }, {});
  }

  /**
   * Create standard error response
   * Centralized to follow DRY principle
   */
  static createErrorResponse(message: string) {
    return {
      success: false,
      error: { message }
    };
  }

  /**
   * Create standard success response
   * Centralized to follow DRY principle
   */
  static createSuccessResponse(data: any, additionalFields: any = {}) {
    return {
      success: true,
      ...additionalFields,
      ...data
    };
  }
}