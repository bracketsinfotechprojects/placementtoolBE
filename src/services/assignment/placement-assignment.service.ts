import { getRepository } from 'typeorm';
import { PlacementAssignment } from '../../entities/placement-assignment/placement-assignment.entity';
import AssignmentService, { IQueryFilters } from './assignment.service';

/**
 * Placement Assignment Service - Follows Single Responsibility Principle
 * Handles only placement assignment business logic
 * Extends base AssignmentService to follow DRY principle
 */
export default class PlacementAssignmentService extends AssignmentService {

  /**
   * Get students for a specific placement slot
   * Follows Open/Closed Principle - can be extended without modification
   */
  static async getStudentsForPlacementSlot(placementSlotId: number, filters: IQueryFilters = {}) {
    const placementAssignmentRepository = getRepository(PlacementAssignment);
    const { status = 'Assigned' } = filters;
    
    const queryBuilder = placementAssignmentRepository.createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.placementSlot', 'placementSlot')
      .leftJoinAndSelect('assignment.student', 'student')
      .leftJoinAndSelect('student.contact_details', 'contact')
      .where('assignment.placementslot_id = :placementSlotId', { placementSlotId })
      .orderBy('student.first_name', 'ASC')
      .addOrderBy('student.last_name', 'ASC');
    
    this.applyCommonFilters(queryBuilder, { status });
    
    const assignments = await queryBuilder.getMany();
    
    if (assignments.length === 0) {
      return null;
    }
    
    const placementSlotDetails = assignments[0].placementSlot;
    const students = assignments.map(assignment => 
      this.formatAssignmentData(assignment)
    );
    
    return this.createSuccessResponse({
      placementslot_id: placementSlotId,
      total_students: students.length,
      placement_slot: {
        placementslot_id: placementSlotDetails.placementslot_id,
        facility_id: placementSlotDetails.facility_id,
        placementslot_type: placementSlotDetails.placementslot_type,
        placement_start_date: placementSlotDetails.placement_start_date,
        placement_end_date: placementSlotDetails.placement_end_date,
        total_slots_offered: placementSlotDetails.total_slots_offered,
        shift_type: placementSlotDetails.shift_type,
        shift_timings: placementSlotDetails.shift_timings,
        working_days: placementSlotDetails.working_days,
        mandatory_courses: placementSlotDetails.mandatory_courses,
        documents_required: placementSlotDetails.documents_required
      },
      students: students
    });
  }

  /**
   * Get placement slots for a facility with their assigned students
   * Follows Single Responsibility Principle
   */
  static async getPlacementSlotsForFacility(facilityId: string, filters: IQueryFilters = {}) {
    const placementAssignmentRepository = getRepository(PlacementAssignment);
    const { status = 'Assigned' } = filters;
    
    const queryBuilder = placementAssignmentRepository.createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.placementSlot', 'placementSlot')
      .leftJoinAndSelect('assignment.student', 'student')
      .leftJoinAndSelect('student.contact_details', 'contact')
      .where('placementSlot.facility_id = :facilityId', { facilityId })
      .andWhere('placementSlot.is_deleted = :isDeleted', { isDeleted: false })
      .orderBy('placementSlot.placement_start_date', 'ASC')
      .addOrderBy('student.first_name', 'ASC');
    
    this.applyCommonFilters(queryBuilder, { status });
    
    const assignments = await queryBuilder.getMany();
    
    if (assignments.length === 0) {
      return null;
    }
    
    // Group by placement slot using centralized method
    const slotGroups = this.groupAssignmentsByKey(
      assignments,
      (assignment) => assignment.placementslot_id,
      (assignment) => ({
        placement_slot: {
          placementslot_id: assignment.placementSlot.placementslot_id,
          facility_id: assignment.placementSlot.facility_id,
          placementslot_type: assignment.placementSlot.placementslot_type,
          placement_start_date: assignment.placementSlot.placement_start_date,
          placement_end_date: assignment.placementSlot.placement_end_date,
          total_slots_offered: assignment.placementSlot.total_slots_offered,
          shift_type: assignment.placementSlot.shift_type,
          shift_timings: assignment.placementSlot.shift_timings,
          working_days: assignment.placementSlot.working_days,
          mandatory_courses: assignment.placementSlot.mandatory_courses,
          documents_required: assignment.placementSlot.documents_required
        },
        students: []
      })
    );
    
    // Add students to each slot group
    assignments.forEach(assignment => {
      const slotId = assignment.placementslot_id.toString();
      slotGroups[slotId].students.push(this.formatAssignmentData(assignment));
    });
    
    const uniqueSlots = new Set(assignments.map(a => a.placementslot_id));
    
    return this.createSuccessResponse({
      facility_id: facilityId,
      total_students: assignments.length,
      placement_slots_count: uniqueSlots.size,
      data: Object.values(slotGroups)
    });
  }

  /**
   * Get all internships for a student (multiple placements across different facilities)
   * Follows Single Responsibility Principle
   */
  static async getStudentInternships(studentId: number, params?: {
    status?: 'Assigned' | 'Active' | 'Completed' | 'Cancelled' | 'Dropped' | 'Allocated' | 'Started';
    limit?: number;
    page?: number;
    sort_by?: string;
    sort_order?: string;
  }) {
    const placementAssignmentRepository = getRepository(PlacementAssignment);
    
    let query = placementAssignmentRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.placementSlot', 'placementSlot')
      .leftJoinAndSelect('assignment.student', 'student')
      .leftJoinAndSelect('placementSlot.facility', 'facility')
      .where('assignment.student_id = :studentId', { studentId })
      .andWhere('placementSlot.is_deleted = :isDeleted', { isDeleted: false })
      .andWhere('student.isDeleted = :studentDeleted', { studentDeleted: false });

    // Filter by status if provided
    if (params?.status) {
      query = query.andWhere('assignment.status = :status', { status: params.status });
    }

    // Get total count before pagination
    const total = await query.getCount();

    // Apply sorting
    const sortBy = params?.sort_by || 'assignment.created_at';
    const sortOrder = params?.sort_order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query = query.orderBy(sortBy, sortOrder);

    // Apply pagination
    const limit = params?.limit || 20;
    const page = params?.page || 1;
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    const assignments = await query.getMany();

    const internships = assignments.map(assignment => ({
      assignment_id: assignment.assignment_id,
      student_id: assignment.student_id,
      student_name: `${assignment.student.first_name} ${assignment.student.last_name}`,
      student_type: assignment.student.student_type,
      facility_id: assignment.placementSlot.facility_id,
      facility_name: assignment.placementSlot.facility?.organization_name || 'N/A',
      placementslot_id: assignment.placementslot_id,
      assignment_status: assignment.status,
      facility_confirmation_status: assignment.facility_confirmation_status,
      slot_type: assignment.placementSlot.placementslot_type,
      course_applicable: assignment.placementSlot.course_applicable,
      slot_start_date: assignment.placementSlot.placement_start_date,
      slot_end_date: assignment.placementSlot.placement_end_date,
      actual_start_date: assignment.start_date,
      actual_end_date: assignment.end_date,
      total_hours_required: assignment.placementSlot.total_hours_required,
      shift_type: assignment.placementSlot.shift_type,
      shift_timings: assignment.placementSlot.shift_timings,
      working_days: assignment.placementSlot.working_days,
      notes: assignment.notes,
      created_at: assignment.created_at,
      updated_at: assignment.updated_at
    }));

    return { internships, total };
  }
}