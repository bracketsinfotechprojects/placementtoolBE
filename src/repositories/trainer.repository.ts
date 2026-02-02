import { getRepository } from 'typeorm';
import { Trainer } from '../entities/trainer/trainer.entity';

export interface ITrainerQueryParams {
  keyword?: string;
  trainer_type?: string;
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  page?: number;
}

const findById = async (id: number): Promise<Trainer | undefined> => {
  return await getRepository(Trainer).findOne({
    where: { trainer_id: id, isDeleted: false }
  });
};

const findByEmail = async (email: string): Promise<Trainer | undefined> => {
  return await getRepository(Trainer).findOne({
    where: { email, isDeleted: false }
  });
};

const findWithFilters = async (params: ITrainerQueryParams) => {
  const { keyword, trainer_type, sort_by = 'createdAt', sort_order = 'DESC', limit = 20, page = 1 } = params;

  const query = getRepository(Trainer)
    .createQueryBuilder('t')
    .where('t.isDeleted = :isDeleted', { isDeleted: false });

  // Keyword search
  if (keyword) {
    query.andWhere(
      '(t.first_name LIKE :keyword OR t.last_name LIKE :keyword OR t.email LIKE :keyword OR t.mobile_number LIKE :keyword)',
      { keyword: `%${keyword}%` }
    );
  }

  // Trainer type filter
  if (trainer_type) {
    query.andWhere('t.trainer_type = :trainer_type', { trainer_type });
  }

  // Sorting
  const validSortFields = ['trainer_id', 'first_name', 'last_name', 'email', 'createdAt'];
  const sortField = validSortFields.includes(sort_by) ? sort_by : 'createdAt';
  const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  query.orderBy(`t.${sortField}`, sortDirection);

  // Pagination
  const skip = (page - 1) * limit;
  query.skip(skip).take(limit);

  const [trainers, total] = await query.getManyAndCount();

  return { trainers, total };
};

const softDelete = async (id: number): Promise<void> => {
  await getRepository(Trainer).update(
    { trainer_id: id },
    { isDeleted: true, updatedAt: new Date() }
  );
};

const permanentlyDelete = async (id: number): Promise<void> => {
  await getRepository(Trainer).delete({ trainer_id: id });
};

export default {
  findById,
  findByEmail,
  findWithFilters,
  softDelete,
  permanentlyDelete
};
