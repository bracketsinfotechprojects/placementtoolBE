import { getRepository } from 'typeorm';
import { PlacementAssignment } from '../../entities/placement-assignment/placement-assignment.entity';
import { PlacementSlot } from '../../entities/placement-slot/placement-slot.entity';
import { Student } from '../../entities/student/student.entity';
import PlacementAssignmentRepository, { IPlacementAssignmentQueryParams } from '../../repositories/placement-assignment.repository';
import PlacementSlotRepository from '../../repositories/placement-slot.repository';
import { StringError } from '../../errors/string.error';

const create = async (params: ICreatePlacementAssignment) => {
  // Validate placement slot exists and is not deleted
  const slot = await PlacementSlotRepository.findById(params.placementslot_id);
  if (!slot) {
    throw new StringError('Placement slot does not exist');
  }

  if (slot.is_deleted) {
    throw new StringError('Placement slot has been deleted');
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

  // Check if slot is full (total_slots_offered)
  if (slot.total_slots_offered && slot.total_slots_offered > 0) {
    const activeAssignmentCount = await PlacementAssignmentRepository.countActiveAssignmentsBySlotId(params.placementslot_id);
    if (activeAssignmentCount >= slot.total_slots_offered) {
      throw new StringError(`Cannot assign student - placement slot is full (${slot.total_slots_offered} slots already assigned)`);
    }
  }

  // Validate student exists
  const student = await getRepository(Student).findOne({
    where: { student_id: params.student_id }
  });
  if (!student) {
    throw new StringError('Student does not exist');
  }

  // Check if student is already assigned to this slot
  const alreadyAssigned = await PlacementAssignmentRepository.checkStudentAlreadyAssigned(
    params.placementslot_id,
    params.student_id
  );
  if (alreadyAssigned) {
    throw new StringError('Student is already assigned to this placement slot');
  }

  // Create assignment
  const assignment = new PlacementAssignment();
  assignment.placementslot_id = params.placementslot_id;
  assignment.student_id = params.student_id;
  assignment.status = params.status || 'Assigned';
  assignment.start_date = params.start_date ? new Date(params.start_date) : null;
  assignment.end_date = params.end_date ? new Date(params.end_date) : null;
  assignment.notes = params.notes;

  const savedAssignment = await getRepository(PlacementAssignment).save(assignment);

  // Return with relations
  return await PlacementAssignmentRepository.findByIdWithRelations(savedAssignment.assignment_id);
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
  const assignment = await PlacementAssignmentRepository.findById(params.id);
  if (!assignment) {
    throw new StringError('Placement assignment does not exist');
  }

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

  await getRepository(PlacementAssignment).update({ assignment_id: params.id }, updateData);
  return await detail(params.id);
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

export interface ICreatePlacementAssignment {
  placementslot_id: number;
  student_id: number;
  status?: 'Assigned' | 'Active' | 'Completed' | 'Cancelled' | 'Dropped';
  start_date?: string | Date;
  end_date?: string | Date;
  notes?: string;
}

export interface IUpdatePlacementAssignment {
  id: number;
  status?: 'Assigned' | 'Active' | 'Completed' | 'Cancelled' | 'Dropped';
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
  getByStudentId
};
