import { getRepository, SelectQueryBuilder, In } from 'typeorm';
import { PlacementSlot } from '../entities/placement-slot/placement-slot.entity';
import ApiUtility from '../utilities/api.utility';

export default class PlacementSlotRepository {
  private static getBaseQuery(includeDeleted: boolean = false): SelectQueryBuilder<PlacementSlot> {
    const query = getRepository(PlacementSlot).createQueryBuilder('placementSlot');

    // By default, exclude deleted slots
    if (!includeDeleted) {
      query.where('placementSlot.is_deleted = :isDeleted', { isDeleted: false });
    }

    return query;
  }

  static async findById(id: number): Promise<PlacementSlot | undefined> {
    return await getRepository(PlacementSlot).findOne({
      where: { placementslot_id: id, is_deleted: false }
    });
  }

  static async findByIdWithRelations(id: number): Promise<PlacementSlot | undefined> {
    return await getRepository(PlacementSlot).findOne({
      where: { placementslot_id: id, is_deleted: false },
      relations: ['facility', 'creator']
    });
  }

  static buildFilteredQuery(params: IPlacementSlotFilters): SelectQueryBuilder<PlacementSlot> {
    // Check if we need to include deleted slots based on status filter
    const includeDeleted = params.status === 'inactive' || params.status === 'all';
    let query = this.getBaseQuery(includeDeleted);

    // Status filter (maps to is_deleted flag)
    if (params.status) {
      if (params.status === 'active') {
        query = query.andWhere('placementSlot.is_deleted = :isDeleted', { isDeleted: false });
      } else if (params.status === 'inactive') {
        query = query.andWhere('placementSlot.is_deleted = :isDeleted', { isDeleted: true });
      }
      // 'all' - no filter, show both active and inactive
    }

    // Facility ID filter
    if (params.facility_id) {
      query = query.andWhere('placementSlot.facility_id = :facilityId', {
        facilityId: params.facility_id
      });
    }

    // Slot type filter
    if (params.placementslot_type) {
      query = query.andWhere('LOWER(placementSlot.placementslot_type) = LOWER(:slotType)', {
        slotType: params.placementslot_type
      });
    }

    // Course applicable filter
    if (params.course_applicable) {
      query = query.andWhere('LOWER(placementSlot.course_applicable) = LOWER(:courseApplicable)', {
        courseApplicable: params.course_applicable
      });
    }

    // Urgent requirement filter
    if (params.urgent_requirement !== undefined) {
      query = query.andWhere('placementSlot.urgent_requirement = :urgentRequirement', {
        urgentRequirement: params.urgent_requirement
      });
    }

    // Priority category filter
    if (params.priority_category) {
      query = query.andWhere('LOWER(placementSlot.priority_category) = LOWER(:priorityCategory)', {
        priorityCategory: params.priority_category
      });
    }

    // Shift type filter
    if (params.shift_type) {
      query = query.andWhere('LOWER(placementSlot.shift_type) = LOWER(:shiftType)', {
        shiftType: params.shift_type
      });
    }

    // Working days filter
    if (params.working_days) {
      query = query.andWhere('LOWER(placementSlot.working_days) = LOWER(:workingDays)', {
        workingDays: params.working_days
      });
    }

    // Gender preference filter
    if (params.gender_preference) {
      query = query.andWhere('LOWER(placementSlot.gender_preference) = LOWER(:genderPreference)', {
        genderPreference: params.gender_preference
      });
    }

    // Placement fee status filter
    if (params.placement_fee_status !== undefined) {
      query = query.andWhere('placementSlot.placement_fee_status = :placementFeeStatus', {
        placementFeeStatus: params.placement_fee_status
      });
    }

    // Work hour limit filter
    if (params.work_hour_limit !== undefined) {
      query = query.andWhere('placementSlot.work_hour_limit = :workHourLimit', {
        workHourLimit: params.work_hour_limit
      });
    }

    // Placement start date range filter
    if (params.placement_start_date_from) {
      query = query.andWhere('placementSlot.placement_start_date >= :startDateFrom', {
        startDateFrom: params.placement_start_date_from
      });
    }

    if (params.placement_start_date_to) {
      query = query.andWhere('placementSlot.placement_start_date <= :startDateTo', {
        startDateTo: params.placement_start_date_to
      });
    }

    // Placement end date range filter
    if (params.placement_end_date_from) {
      query = query.andWhere('placementSlot.placement_end_date >= :endDateFrom', {
        endDateFrom: params.placement_end_date_from
      });
    }

    if (params.placement_end_date_to) {
      query = query.andWhere('placementSlot.placement_end_date <= :endDateTo', {
        endDateTo: params.placement_end_date_to
      });
    }

    // Created by filter
    if (params.created_by) {
      query = query.andWhere('placementSlot.created_by = :createdBy', {
        createdBy: params.created_by
      });
    }

    // Created date range filter
    if (params.created_from) {
      query = query.andWhere('placementSlot.created_at >= :createdFrom', {
        createdFrom: params.created_from
      });
    }

    if (params.created_to) {
      query = query.andWhere('placementSlot.created_at <= :createdTo', {
        createdTo: params.created_to
      });
    }

    // Keyword search (across multiple fields)
    if (params.keyword) {
      query = query.andWhere(
        `(LOWER(placementSlot.placementslot_type) LIKE LOWER(:keyword) OR
          LOWER(placementSlot.course_applicable) LIKE LOWER(:keyword) OR
          LOWER(placementSlot.shift_type) LIKE LOWER(:keyword) OR
          LOWER(placementSlot.priority_category) LIKE LOWER(:keyword) OR
          LOWER(placementSlot.restrictions) LIKE LOWER(:keyword))`,
        { keyword: `%${params.keyword}%` }
      );
    }

    return query;
  }

  static applySorting(
    query: SelectQueryBuilder<PlacementSlot>,
    sortBy: string = 'placementslot_id',
    sortOrder: string = 'DESC'
  ): SelectQueryBuilder<PlacementSlot> {
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Validate that the sortBy column exists in the entity
    const validColumns = [
      'placementslot_id', 'facility_id', 'created_by', 'created_at', 'is_deleted',
      'placementslot_type', 'course_applicable', 'total_slots_offered',
      'placement_start_date', 'placement_end_date', 'total_hours_required',
      'expected_duration', 'shift_type', 'shift_timings', 'working_days',
      'mandatory_courses', 'documents_required', 'allowed_visa_types',
      'work_hour_limit', 'work_hour_limit_details', 'gender_preference',
      'dress_code', 'attendance_rules', 'leave_policy', 'behaviour_expectations',
      'placement_fee', 'placement_fee_status', 'invoice_required',
      'special_commercial_terms', 'urgent_requirement', 'priority_category',
      'restrictions', 'not_comfortable_with'
    ];

    if (!validColumns.includes(sortBy)) {
      // Default to placementslot_id if invalid column provided
      return query.orderBy('placementSlot.placementslot_id', order);
    }

    return query.orderBy(`placementSlot.${sortBy}`, order);
  }

  static applyPagination(
    query: SelectQueryBuilder<PlacementSlot>,
    limit: number = 20,
    page: number = 1
  ): SelectQueryBuilder<PlacementSlot> {
    const offset = ApiUtility.getOffset(limit, page);
    return query.limit(limit).offset(offset);
  }

  static async findWithFilters(params: IPlacementSlotQueryParams): Promise<{
    slots: PlacementSlot[];
    total: number;
  }> {
    let query = this.buildFilteredQuery(params);

    // Load relations
    query = query.leftJoinAndSelect('placementSlot.facility', 'facility')
                 .leftJoinAndSelect('placementSlot.creator', 'creator');

    const total = await query.getCount();

    query = this.applySorting(query, params.sort_by, params.sort_order);
    query = this.applyPagination(query, params.limit, params.page);

    const slots = await query.getMany();

    return { slots, total };
  }

  static async softDelete(id: number): Promise<void> {
    await getRepository(PlacementSlot).update(
      { placementslot_id: id, is_deleted: false },
      { is_deleted: true }
    );
  }

  static async permanentlyDelete(id: number): Promise<void> {
    await getRepository(PlacementSlot).delete({ placementslot_id: id });
  }
}

export interface IPlacementSlotFilters {
  // Status filter
  status?: 'active' | 'inactive' | 'all';

  // ID filters
  facility_id?: number;
  created_by?: number;

  // Core slot details filters
  placementslot_type?: string;
  course_applicable?: string;
  shift_type?: string;
  working_days?: string;
  gender_preference?: string;

  // Boolean filters
  urgent_requirement?: boolean;
  placement_fee_status?: boolean;
  work_hour_limit?: boolean;

  // Priority and category
  priority_category?: string;

  // Date range filters
  placement_start_date_from?: string;
  placement_start_date_to?: string;
  placement_end_date_from?: string;
  placement_end_date_to?: string;
  created_from?: string;
  created_to?: string;

  // Text search
  keyword?: string;
}

export interface IPlacementSlotQueryParams extends IPlacementSlotFilters {
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  page?: number;
}
