import { getRepository, SelectQueryBuilder, In } from 'typeorm';
import { PlacementAssignment } from '../entities/placement-assignment/placement-assignment.entity';
import ApiUtility from '../utilities/api.utility';

export default class PlacementAssignmentRepository {
  private static getBaseQuery(): SelectQueryBuilder<PlacementAssignment> {
    return getRepository(PlacementAssignment).createQueryBuilder('assignment');
  }

  static async findById(id: number): Promise<PlacementAssignment | undefined> {
    return await getRepository(PlacementAssignment).findOne({
      where: { assignment_id: id }
    });
  }

  static async findByIdWithRelations(id: number): Promise<PlacementAssignment | undefined> {
    return await getRepository(PlacementAssignment).findOne({
      where: { assignment_id: id },
      relations: ['placementSlot', 'student']
    });
  }

  static async findBySlotId(slotId: number): Promise<PlacementAssignment[]> {
    return await getRepository(PlacementAssignment).find({
      where: { placementslot_id: slotId },
      relations: ['student']
    });
  }

  static async findByStudentId(studentId: number): Promise<PlacementAssignment[]> {
    return await getRepository(PlacementAssignment).find({
      where: { student_id: studentId },
      relations: ['placementSlot']
    });
  }

  static async countActiveAssignmentsBySlotId(slotId: number): Promise<number> {
    return await getRepository(PlacementAssignment).count({
      where: {
        placementslot_id: slotId,
        status: In(['Assigned', 'Active'])
      }
    });
  }

  static async checkStudentAlreadyAssigned(slotId: number, studentId: number): Promise<boolean> {
    const count = await getRepository(PlacementAssignment).count({
      where: {
        placementslot_id: slotId,
        student_id: studentId,
        status: In(['Assigned', 'Active'])
      }
    });
    return count > 0;
  }

  static buildFilteredQuery(params: IPlacementAssignmentFilters): SelectQueryBuilder<PlacementAssignment> {
    let query = this.getBaseQuery();

    // Filter by placement slot
    if (params.placementslot_id) {
      query = query.andWhere('assignment.placementslot_id = :slotId', {
        slotId: params.placementslot_id
      });
    }

    // Filter by student
    if (params.student_id) {
      query = query.andWhere('assignment.student_id = :studentId', {
        studentId: params.student_id
      });
    }

    // Filter by status
    if (params.status) {
      query = query.andWhere('assignment.status = :status', {
        status: params.status
      });
    }

    // Date range filters
    if (params.start_date_from) {
      query = query.andWhere('assignment.start_date >= :startFrom', {
        startFrom: params.start_date_from
      });
    }

    if (params.start_date_to) {
      query = query.andWhere('assignment.start_date <= :startTo', {
        startTo: params.start_date_to
      });
    }

    return query;
  }

  static applySorting(
    query: SelectQueryBuilder<PlacementAssignment>,
    sortBy: string = 'assignment_id',
    sortOrder: string = 'DESC'
  ): SelectQueryBuilder<PlacementAssignment> {
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    return query.orderBy(`assignment.${sortBy}`, order);
  }

  static applyPagination(
    query: SelectQueryBuilder<PlacementAssignment>,
    limit: number = 20,
    page: number = 1
  ): SelectQueryBuilder<PlacementAssignment> {
    const offset = ApiUtility.getOffset(limit, page);
    return query.limit(limit).offset(offset);
  }

  static async findWithFilters(params: IPlacementAssignmentQueryParams): Promise<{
    assignments: PlacementAssignment[];
    total: number;
  }> {
    let query = this.buildFilteredQuery(params);

    // Load relations
    query = query
      .leftJoinAndSelect('assignment.placementSlot', 'placementSlot')
      .leftJoinAndSelect('assignment.student', 'student');

    const total = await query.getCount();

    query = this.applySorting(query, params.sort_by, params.sort_order);
    query = this.applyPagination(query, params.limit, params.page);

    const assignments = await query.getMany();

    return { assignments, total };
  }

  static async delete(id: number): Promise<void> {
    await getRepository(PlacementAssignment).delete({ assignment_id: id });
  }
}

export interface IPlacementAssignmentFilters {
  placementslot_id?: number;
  student_id?: number;
  status?: 'Assigned' | 'Active' | 'Completed' | 'Cancelled' | 'Dropped';
  start_date_from?: string;
  start_date_to?: string;
}

export interface IPlacementAssignmentQueryParams extends IPlacementAssignmentFilters {
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  page?: number;
}
