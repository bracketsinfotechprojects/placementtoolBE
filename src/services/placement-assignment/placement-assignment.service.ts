import { getRepository, getConnection } from 'typeorm';
import { PlacementAssignment } from '../../entities/placement-assignment/placement-assignment.entity';
import { PlacementSlot } from '../../entities/placement-slot/placement-slot.entity';
import { Student } from '../../entities/student/student.entity';
import PlacementAssignmentRepository, { IPlacementAssignmentQueryParams } from '../../repositories/placement-assignment.repository';
import PlacementSlotRepository from '../../repositories/placement-slot.repository';
import { StringError } from '../../errors/string.error';

const create = async (params: ICreatePlacementAssignment) => {
  // Use transaction to ensure atomicity
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Validate placement slot exists and is not deleted (with lock)
    const slot = await queryRunner.manager.findOne(PlacementSlot, {
      where: { placementslot_id: params.placementslot_id, is_deleted: false },
      lock: { mode: 'pessimistic_write' }
    });

    if (!slot) {
      throw new StringError('Placement slot does not exist');
    }

    // Check if placement end date has passed
    if (slot.placement_end_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(slot.placement_end_date);
      endDate.setHours(0, 0, 0, 0);

      if (endDate < today) {
        throw new StringError('Cannot assign student - placement end date has already passed');
      }
    }

    // Check remaining seats
    if (slot.remaining_seats !== null && slot.remaining_seats !== undefined) {
      if (slot.remaining_seats <= 0) {
        throw new StringError('Cannot assign student - no remaining seats available');
      }
    }

    // Validate student exists
    const student = await queryRunner.manager.findOne(Student, {
      where: { student_id: params.student_id }
    });
    if (!student) {
      throw new StringError('Student does not exist');
    }

    // Check if student is already assigned to this slot (any status except Cancelled/Dropped)
    const existingAssignment = await queryRunner.manager.findOne(PlacementAssignment, {
      where: { 
        placementslot_id: params.placementslot_id,
        student_id: params.student_id
      }
    });

    if (existingAssignment && !['Cancelled'].includes(existingAssignment.status)) {
      throw new StringError('Student is already assigned to this placement slot');
    }

    // Create assignment
    const assignment = new PlacementAssignment();
    assignment.placementslot_id = params.placementslot_id;
    assignment.student_id = params.student_id;
    assignment.status = params.status || 'Allocated';
    assignment.start_date = params.start_date ? new Date(params.start_date) : null;
    assignment.end_date = params.end_date ? new Date(params.end_date) : null;
    assignment.notes = params.notes;

    const savedAssignment = await queryRunner.manager.save(assignment);

    // Decrement remaining seats
    if (slot.remaining_seats !== null && slot.remaining_seats !== undefined) {
      await queryRunner.manager.update(
        PlacementSlot,
        { placementslot_id: params.placementslot_id },
        { remaining_seats: slot.remaining_seats - 1 }
      );
    }

    await queryRunner.commitTransaction();

    // Return with relations
    return await PlacementAssignmentRepository.findByIdWithRelations(savedAssignment.assignment_id);

  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

const getById = async (id: number) => {
  return await PlacementAssignmentRepository.findById(id);
};

const detail = async (id: number) => {
  const assignment = await PlacementAssignmentRepository.findByIdWithRelations(id);
  if (!assignment) {
    throw new StringError('Placement assignment does not exist');
  }
  return assignment;
};

const list = async (params: IPlacementAssignmentQueryParams) => {
  return await PlacementAssignmentRepository.findWithFilters(params);
};

const update = async (params: IUpdatePlacementAssignment) => {
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const assignment = await queryRunner.manager.findOne(PlacementAssignment, {
      where: { assignment_id: params.id }
    });

    if (!assignment) {
      throw new StringError('Placement assignment does not exist');
    }

    const oldStatus = assignment.status;
    const newStatus = params.status;

    const updateData: Partial<PlacementAssignment> = {
      status: params.status,
      start_date: params.start_date ? new Date(params.start_date) : null,
      end_date: params.end_date ? new Date(params.end_date) : null,
      notes: params.notes
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof Partial<PlacementAssignment>] === undefined) {
        delete (updateData as any)[key];
      }
    });

    await queryRunner.manager.update(PlacementAssignment, { assignment_id: params.id }, updateData);

    // Update remaining seats if status changed
    if (newStatus && oldStatus !== newStatus) {
      const slot = await queryRunner.manager.findOne(PlacementSlot, {
        where: { placementslot_id: assignment.placementslot_id }
      });

      if (slot && slot.remaining_seats !== null && slot.remaining_seats !== undefined) {
        // If changing from active status (Allocated/Started) to inactive (Completed/Cancelled), increment seats
        if (['Allocated', 'Started'].includes(oldStatus) && ['Completed', 'Cancelled'].includes(newStatus)) {
          await queryRunner.manager.update(
            PlacementSlot,
            { placementslot_id: assignment.placementslot_id },
            { remaining_seats: slot.remaining_seats + 1 }
          );
        }
        // If changing from inactive status to active status, decrement seats
        else if (['Completed', 'Cancelled'].includes(oldStatus) && ['Allocated', 'Started'].includes(newStatus)) {
          if (slot.remaining_seats <= 0) {
            throw new StringError('Cannot reactivate assignment - no remaining seats available');
          }
          await queryRunner.manager.update(
            PlacementSlot,
            { placementslot_id: assignment.placementslot_id },
            { remaining_seats: slot.remaining_seats - 1 }
          );
        }
      }
    }

    await queryRunner.commitTransaction();

    return await detail(params.id);

  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

const remove = async (id: number) => {
  const assignment = await PlacementAssignmentRepository.findById(id);
  if (!assignment) {
    throw new StringError('Placement assignment does not exist');
  }
  await PlacementAssignmentRepository.delete(id);
  return { message: 'Placement assignment deleted successfully' };
};

const getBySlotId = async (slotId: number) => {
  return await PlacementAssignmentRepository.findBySlotId(slotId);
};

const getByStudentId = async (studentId: number) => {
  return await PlacementAssignmentRepository.findByStudentId(studentId);
};

const confirm = async (placementslotId: number) => {
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Validate placement slot exists
    const slot = await queryRunner.manager.findOne(PlacementSlot, {
      where: { placementslot_id: placementslotId, is_deleted: false }
    });

    if (!slot) {
      throw new StringError('Placement slot does not exist');
    }

    // Get all assignments for this slot with status 'Assigned'
    const assignments = await queryRunner.manager.find(PlacementAssignment, {
      where: { placementslot_id: placementslotId, status: 'Assigned' }
    });

    if (assignments.length === 0) {
      throw new StringError('No assignments to confirm for this placement slot');
    }

    // Update all assignments to 'Started' status
    await queryRunner.manager.update(
      PlacementAssignment,
      { placementslot_id: placementslotId, status: 'Allocated' },
      { status: 'Started' }
    );

    await queryRunner.commitTransaction();

    // Fetch updated assignments
    const updatedAssignments = await PlacementAssignmentRepository.findBySlotId(placementslotId);

    return {
      message: `${assignments.length} placement assignment(s) confirmed successfully`,
      confirmed_count: assignments.length,
      data: updatedAssignments
    };

  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

const confirmByFacility = async (assignmentId: number) => {
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const assignment = await queryRunner.manager.findOne(PlacementAssignment, {
      where: { assignment_id: assignmentId }
    });

    if (!assignment) {
      throw new StringError('Placement assignment does not exist');
    }

    // Update facility confirmation status to 'Approved'
    await queryRunner.manager.update(
      PlacementAssignment,
      { assignment_id: assignmentId },
      { facility_confirmation_status: 'Approved' }
    );

    await queryRunner.commitTransaction();

    return await detail(assignmentId);

  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

const rejectByFacility = async (assignmentId: number, reason?: string) => {
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const assignment = await queryRunner.manager.findOne(PlacementAssignment, {
      where: { assignment_id: assignmentId }
    });

    if (!assignment) {
      throw new StringError('Placement assignment does not exist');
    }

    // Update facility confirmation status to 'Rejected' and add reason to notes
    const updatedNotes = reason ? `Rejected by facility: ${reason}` : 'Rejected by facility';
    
    await queryRunner.manager.update(
      PlacementAssignment,
      { assignment_id: assignmentId },
      { 
        facility_confirmation_status: 'Rejected',
        notes: updatedNotes
      }
    );

    await queryRunner.commitTransaction();

    return await detail(assignmentId);

  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

const updateFacilityStatus = async (assignmentId: number, facilityStatus: 'Approved' | 'Rejected') => {
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const assignment = await queryRunner.manager.findOne(PlacementAssignment, {
      where: { assignment_id: assignmentId }
    });

    if (!assignment) {
      throw new StringError('Placement assignment does not exist');
    }

    await queryRunner.manager.update(
      PlacementAssignment,
      { assignment_id: assignmentId },
      { facility_confirmation_status: facilityStatus }
    );

    await queryRunner.commitTransaction();

    return await detail(assignmentId);

  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

const updateStatus = async (assignmentId: number, newStatus: 'Allocated' | 'Started' | 'Completed' | 'Cancelled') => {
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const assignment = await queryRunner.manager.findOne(PlacementAssignment, {
      where: { assignment_id: assignmentId }
    });

    if (!assignment) {
      throw new StringError('Placement assignment does not exist');
    }

    const oldStatus = assignment.status;

    // Update status
    await queryRunner.manager.update(
      PlacementAssignment,
      { assignment_id: assignmentId },
      { status: newStatus }
    );

    // Update remaining seats if status changed
    if (oldStatus !== newStatus) {
      const slot = await queryRunner.manager.findOne(PlacementSlot, {
        where: { placementslot_id: assignment.placementslot_id }
      });

      if (slot && slot.remaining_seats !== null && slot.remaining_seats !== undefined) {
        // If changing from active status (Allocated/Started) to inactive (Completed/Cancelled), increment seats
        if (['Allocated', 'Started'].includes(oldStatus) && ['Completed', 'Cancelled'].includes(newStatus)) {
          await queryRunner.manager.update(
            PlacementSlot,
            { placementslot_id: assignment.placementslot_id },
            { remaining_seats: slot.remaining_seats + 1 }
          );
        }
        // If changing from inactive status to active status, decrement seats
        else if (['Completed', 'Cancelled'].includes(oldStatus) && ['Allocated', 'Started'].includes(newStatus)) {
          if (slot.remaining_seats <= 0) {
            throw new StringError('Cannot reactivate assignment - no remaining seats available');
          }
          await queryRunner.manager.update(
            PlacementSlot,
            { placementslot_id: assignment.placementslot_id },
            { remaining_seats: slot.remaining_seats - 1 }
          );
        }
      }
    }

    await queryRunner.commitTransaction();

    return await detail(assignmentId);

  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

const updateStatusByStudentAndSlot = async (studentId: number, placementslotId: number, newStatus: 'Allocated' | 'Started' | 'Completed' | 'Cancelled') => {
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const assignment = await queryRunner.manager.findOne(PlacementAssignment, {
      where: { student_id: studentId, placementslot_id: placementslotId }
    });

    if (!assignment) {
      throw new StringError('Placement assignment not found for this student and placement slot');
    }

    const oldStatus = assignment.status;

    // Update status
    await queryRunner.manager.update(
      PlacementAssignment,
      { student_id: studentId, placementslot_id: placementslotId },
      { status: newStatus }
    );

    // Update remaining seats if status changed
    if (oldStatus !== newStatus) {
      const slot = await queryRunner.manager.findOne(PlacementSlot, {
        where: { placementslot_id: placementslotId }
      });

      if (slot && slot.remaining_seats !== null && slot.remaining_seats !== undefined) {
        // If changing from active status (Allocated/Started) to inactive (Completed/Cancelled), increment seats
        if (['Allocated', 'Started'].includes(oldStatus) && ['Completed', 'Cancelled'].includes(newStatus)) {
          await queryRunner.manager.update(
            PlacementSlot,
            { placementslot_id: placementslotId },
            { remaining_seats: slot.remaining_seats + 1 }
          );
        }
        // If changing from inactive status to active status, decrement seats
        else if (['Completed', 'Cancelled'].includes(oldStatus) && ['Allocated', 'Started'].includes(newStatus)) {
          if (slot.remaining_seats <= 0) {
            throw new StringError('Cannot reactivate assignment - no remaining seats available');
          }
          await queryRunner.manager.update(
            PlacementSlot,
            { placementslot_id: placementslotId },
            { remaining_seats: slot.remaining_seats - 1 }
          );
        }
      }
    }

    await queryRunner.commitTransaction();

    return await PlacementAssignmentRepository.findByIdWithRelations(assignment.assignment_id);

  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

const updateFacilityStatusByStudentAndSlot = async (studentId: number, placementslotId: number, facilityStatus: 'Approved' | 'Rejected') => {
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const assignment = await queryRunner.manager.findOne(PlacementAssignment, {
      where: { student_id: studentId, placementslot_id: placementslotId }
    });

    if (!assignment) {
      throw new StringError('Placement assignment not found for this student and placement slot');
    }

    await queryRunner.manager.update(
      PlacementAssignment,
      { student_id: studentId, placementslot_id: placementslotId },
      { facility_confirmation_status: facilityStatus }
    );

    await queryRunner.commitTransaction();

    return await PlacementAssignmentRepository.findByIdWithRelations(assignment.assignment_id);

  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

export interface ICreatePlacementAssignment {
  placementslot_id: number;
  student_id: number;
  status?: 'Allocated' | 'Started' | 'Completed' | 'Cancelled';
  start_date?: string | Date;
  end_date?: string | Date;
  notes?: string;
}

export interface IUpdatePlacementAssignment {
  id: number;
  status?: 'Allocated' | 'Started' | 'Completed' | 'Cancelled';
  start_date?: string | Date;
  end_date?: string | Date;
  notes?: string;
}

export default {
  create,
  getById,
  detail,
  list,
  update,
  remove,
  getBySlotId,
  getByStudentId,
  confirm,
  confirmByFacility,
  rejectByFacility,
  updateFacilityStatus,
  updateStatus,
  updateStatusByStudentAndSlot,
  updateFacilityStatusByStudentAndSlot
};
