import { getRepository, getConnection } from 'typeorm';
import { PlacementSlot } from '../../entities/placement-slot/placement-slot.entity';
import { Facility } from '../../entities/facility/facility.entity';
import { User } from '../../entities/user/user.entity';
import PlacementSlotRepository, { IPlacementSlotQueryParams } from '../../repositories/placement-slot.repository';
import { StringError } from '../../errors/string.error';

const create = async (params: ICreatePlacementSlot, createdByUserId: number) => {
  // Validate user exists
  const user = await getRepository(User).findOne({
    where: { id: createdByUserId, isDeleted: false }
  });

  if (!user) {
    throw new StringError('User does not exist');
  }

  // Use transaction to ensure all-or-nothing behavior
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const placementSlot = new PlacementSlot();

    // Core slot details
    placementSlot.facility_id = params.facility_id;
    placementSlot.placementslot_type = params.placementslot_type || [];
    placementSlot.course_applicable = params.course_applicable || [];
    placementSlot.total_slots_offered = params.total_slots_offered;
    placementSlot.placement_start_date = params.placement_start_date ? new Date(params.placement_start_date) : null;
    placementSlot.placement_end_date = params.placement_end_date ? new Date(params.placement_end_date) : null;
    placementSlot.total_hours_required = params.total_hours_required;
    placementSlot.expected_duration = params.expected_duration || [];
    placementSlot.shift_type = params.shift_type || [];
    placementSlot.shift_timings = params.shift_timings;
    placementSlot.working_days = params.working_days || [];

    // Requirements
    placementSlot.mandatory_courses = params.mandatory_courses || [];
    placementSlot.documents_required = params.documents_required || [];
    placementSlot.allowed_visa_types = params.allowed_visa_types;
    placementSlot.work_hour_limit = params.work_hour_limit || false;
    placementSlot.work_hour_limit_details = params.work_hour_limit_details;
    placementSlot.gender_preference = params.gender_preference || [];

    // Rules & Expectations
    placementSlot.dress_code = params.dress_code;
    placementSlot.attendance_rules = params.attendance_rules;
    placementSlot.leave_policy = params.leave_policy;
    placementSlot.behaviour_expectations = params.behaviour_expectations;

    // Commercials
    placementSlot.placement_fee = params.placement_fee;
    placementSlot.placement_fee_status = params.placement_fee_status || false;
    placementSlot.invoice_required = params.invoice_required || false;
    placementSlot.special_commercial_terms = params.special_commercial_terms;

    // Constraints
    placementSlot.urgent_requirement = params.urgent_requirement || false;
    placementSlot.priority_category = params.priority_category || [];
    placementSlot.restrictions = params.restrictions;
    placementSlot.not_comfortable_with = params.not_comfortable_with;

    // Audit
    placementSlot.created_by = createdByUserId;
    placementSlot.is_deleted = false;

    const savedSlot = await queryRunner.manager.save(placementSlot);

    await queryRunner.commitTransaction();

    // Return with relations
    return await PlacementSlotRepository.findByIdWithRelations(savedSlot.placementslot_id);

  } catch (error) {
    try {
      await queryRunner.rollbackTransaction();
    } catch (rollbackError) {
      console.error('⚠️ Rollback error (transaction may not have started):', rollbackError);
    }
    console.error('❌ Transaction failed, rolling back all changes:', error);
    throw error;
  } finally {
    try {
      await queryRunner.release();
    } catch (releaseError) {
      console.error('⚠️ Release error:', releaseError);
    }
  }
};

const getById = async (id: number) => {
  return await PlacementSlotRepository.findById(id);
};

const detail = async (id: number) => {
  const slot = await PlacementSlotRepository.findByIdWithRelations(id);
  if (!slot) {
    throw new StringError('Placement slot does not exist');
  }
  return slot;
};

const list = async (params: IPlacementSlotQueryParams) => {
  return await PlacementSlotRepository.findWithFilters(params);
};

const update = async (params: IUpdatePlacementSlot) => {
  const slot = await PlacementSlotRepository.findById(params.id);
  if (!slot) {
    throw new StringError('Placement slot does not exist');
  }

  const updateData: Partial<PlacementSlot> = {
    facility_id: params.facility_id,
    placementslot_type: params.placementslot_type,
    course_applicable: params.course_applicable,
    total_slots_offered: params.total_slots_offered,
    placement_start_date: params.placement_start_date ? new Date(params.placement_start_date) : null,
    placement_end_date: params.placement_end_date ? new Date(params.placement_end_date) : null,
    total_hours_required: params.total_hours_required,
    expected_duration: params.expected_duration,
    shift_type: params.shift_type,
    shift_timings: params.shift_timings,
    working_days: params.working_days,
    mandatory_courses: params.mandatory_courses,
    documents_required: params.documents_required,
    allowed_visa_types: params.allowed_visa_types,
    work_hour_limit: params.work_hour_limit,
    work_hour_limit_details: params.work_hour_limit_details,
    gender_preference: params.gender_preference,
    dress_code: params.dress_code,
    attendance_rules: params.attendance_rules,
    leave_policy: params.leave_policy,
    behaviour_expectations: params.behaviour_expectations,
    placement_fee: params.placement_fee,
    placement_fee_status: params.placement_fee_status,
    invoice_required: params.invoice_required,
    special_commercial_terms: params.special_commercial_terms,
    urgent_requirement: params.urgent_requirement,
    priority_category: params.priority_category,
    restrictions: params.restrictions,
    not_comfortable_with: params.not_comfortable_with
  };

  // Remove undefined fields
  Object.keys(updateData).forEach(key => {
    if (updateData[key as keyof Partial<PlacementSlot>] === undefined) {
      delete (updateData as any)[key];
    }
  });

  await getRepository(PlacementSlot).update({ placementslot_id: params.id }, updateData);
  return await detail(params.id);
};

const remove = async (id: number) => {
  const slot = await PlacementSlotRepository.findById(id);
  if (!slot) {
    throw new StringError('Placement slot does not exist');
  }
  await PlacementSlotRepository.softDelete(id);
  return { message: 'Placement slot deleted successfully' };
};

const permanentlyDelete = async (id: number) => {
  const slot = await PlacementSlotRepository.findById(id);
  if (!slot) {
    throw new StringError('Placement slot does not exist');
  }
  await PlacementSlotRepository.permanentlyDelete(id);
  return { message: 'Placement slot permanently deleted' };
};

export interface ICreatePlacementSlot {
  facility_id: string;
  placementslot_type?: string[];
  course_applicable?: string[];
  total_slots_offered?: number;
  placement_start_date?: string | Date;
  placement_end_date?: string | Date;
  total_hours_required?: number;
  expected_duration?: string[];
  shift_type?: string[];
  shift_timings?: string;
  working_days?: string[];
  mandatory_courses?: string[];
  documents_required?: string[];
  allowed_visa_types?: string;
  work_hour_limit?: boolean;
  work_hour_limit_details?: string;
  gender_preference?: string[];
  dress_code?: string;
  attendance_rules?: string;
  leave_policy?: string;
  behaviour_expectations?: string;
  placement_fee?: string;
  placement_fee_status?: boolean;
  invoice_required?: boolean;
  special_commercial_terms?: string;
  urgent_requirement?: boolean;
  priority_category?: string[];
  restrictions?: string;
  not_comfortable_with?: string;
}

export interface IUpdatePlacementSlot {
  id: number;
  facility_id?: string;
  placementslot_type?: string[];
  course_applicable?: string[];
  total_slots_offered?: number;
  placement_start_date?: string | Date;
  placement_end_date?: string | Date;
  total_hours_required?: number;
  expected_duration?: string[];
  shift_type?: string[];
  shift_timings?: string;
  working_days?: string[];
  mandatory_courses?: string[];
  documents_required?: string[];
  allowed_visa_types?: string;
  work_hour_limit?: boolean;
  work_hour_limit_details?: string;
  gender_preference?: string[];
  dress_code?: string;
  attendance_rules?: string;
  leave_policy?: string;
  behaviour_expectations?: string;
  placement_fee?: string;
  placement_fee_status?: boolean;
  invoice_required?: boolean;
  special_commercial_terms?: string;
  urgent_requirement?: boolean;
  priority_category?: string[];
  restrictions?: string;
  not_comfortable_with?: string;
}

export default {
  create,
  getById,
  detail,
  list,
  update,
  remove,
  permanentlyDelete
};
