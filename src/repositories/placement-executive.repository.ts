import { getRepository } from 'typeorm';
import { PlacementExecutive } from '../entities/placement-executive/placement-executive.entity';

export interface IPlacementExecutiveQueryParams {
  keyword?: string;
  employment_type?: string;
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  page?: number;
}

const findById = async (id: number): Promise<PlacementExecutive | undefined> => {
  return await getRepository(PlacementExecutive).findOne({
    where: { executive_id: id, isDeleted: false }
  });
};

const findByEmail = async (email: string): Promise<PlacementExecutive | undefined> => {
  return await getRepository(PlacementExecutive).findOne({
    where: { email, isDeleted: false }
  });
};

const findWithFilters = async (params: IPlacementExecutiveQueryParams) => {
  const { keyword, employment_type, sort_by = 'createdAt', sort_order = 'DESC', limit = 20, page = 1 } = params;

  const query = getRepository(PlacementExecutive)
    .createQueryBuilder('pe')
    .where('pe.isDeleted = :isDeleted', { isDeleted: false });

  // Keyword search
  if (keyword) {
    query.andWhere(
      '(pe.full_name LIKE :keyword OR pe.email LIKE :keyword OR pe.mobile_number LIKE :keyword)',
      { keyword: `%${keyword}%` }
    );
  }

  // Employment type filter
  if (employment_type) {
    query.andWhere('pe.employment_type = :employment_type', { employment_type });
  }

  // Sorting
  const validSortFields = ['executive_id', 'full_name', 'joining_date', 'employment_type', 'createdAt'];
  const sortField = validSortFields.includes(sort_by) ? sort_by : 'createdAt';
  const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  query.orderBy(`pe.${sortField}`, sortDirection);

  // Pagination
  const skip = (page - 1) * limit;
  query.skip(skip).take(limit);

  const [executives, total] = await query.getManyAndCount();

  return { executives, total };
};

const softDelete = async (id: number): Promise<void> => {
  await getRepository(PlacementExecutive).update(
    { executive_id: id },
    { isDeleted: true, updatedAt: new Date() }
  );
};

const permanentlyDelete = async (id: number): Promise<void> => {
  await getRepository(PlacementExecutive).delete({ executive_id: id });
};

export default {
  findById,
  findByEmail,
  findWithFilters,
  softDelete,
  permanentlyDelete
};
