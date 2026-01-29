import { getRepository } from 'typeorm';
import { FacilitySupervisor } from '../entities/facility-supervisor/facility-supervisor.entity';

export interface IFacilitySupervisorQueryParams {
  keyword?: string;
  facility_id?: number;
  portal_access_enabled?: boolean;
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  page?: number;
}

const findById = async (id: number): Promise<FacilitySupervisor | undefined> => {
  return await getRepository(FacilitySupervisor).findOne({
    where: { supervisor_id: id, isDeleted: false }
  });
};

const findByEmail = async (email: string): Promise<FacilitySupervisor | undefined> => {
  return await getRepository(FacilitySupervisor).findOne({
    where: { email, isDeleted: false }
  });
};

const findWithFilters = async (params: IFacilitySupervisorQueryParams) => {
  const { keyword, facility_id, portal_access_enabled, sort_by = 'createdAt', sort_order = 'DESC', limit = 20, page = 1 } = params;

  const query = getRepository(FacilitySupervisor)
    .createQueryBuilder('fs')
    .where('fs.isDeleted = :isDeleted', { isDeleted: false });

  // Keyword search
  if (keyword) {
    query.andWhere(
      '(fs.full_name LIKE :keyword OR fs.email LIKE :keyword OR fs.mobile_number LIKE :keyword OR fs.designation LIKE :keyword)',
      { keyword: `%${keyword}%` }
    );
  }

  // Facility filter
  if (facility_id) {
    query.andWhere('fs.facility_id = :facility_id', { facility_id });
  }

  // Portal access filter
  if (portal_access_enabled !== undefined) {
    query.andWhere('fs.portal_access_enabled = :portal_access_enabled', { portal_access_enabled });
  }

  // Sorting
  const validSortFields = ['supervisor_id', 'full_name', 'designation', 'facility_id', 'createdAt'];
  const sortField = validSortFields.includes(sort_by) ? sort_by : 'createdAt';
  const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  query.orderBy(`fs.${sortField}`, sortDirection);

  // Pagination
  const skip = (page - 1) * limit;
  query.skip(skip).take(limit);

  const [supervisors, total] = await query.getManyAndCount();

  return { supervisors, total };
};

const softDelete = async (id: number): Promise<void> => {
  await getRepository(FacilitySupervisor).update(
    { supervisor_id: id },
    { isDeleted: true, updatedAt: new Date() }
  );
};

const permanentlyDelete = async (id: number): Promise<void> => {
  await getRepository(FacilitySupervisor).delete({ supervisor_id: id });
};

export default {
  findById,
  findByEmail,
  findWithFilters,
  softDelete,
  permanentlyDelete
};
