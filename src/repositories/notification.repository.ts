import { getRepository } from 'typeorm';
import { Notification } from '../entities/notification/notification.entity';

const findByUser = async (
  userId: number,
  limit: number,
  offset: number,
): Promise<[Notification[], number]> => {
  return getRepository(Notification)
    .createQueryBuilder('n')
    .where('n.user_id = :userId', { userId })
    .orderBy('n.created_at', 'DESC')
    .skip(offset)
    .take(limit)
    .getManyAndCount();
};

const findUnreadCount = async (userId: number): Promise<number> => {
  return getRepository(Notification).count({
    where: { user_id: userId, is_read: false },
  });
};

const markOneRead = async (id: number, userId: number) => {
  return getRepository(Notification).update(
    { id, user_id: userId },
    { is_read: true },
  );
};

const markAllRead = async (userId: number) => {
  return getRepository(Notification).update(
    { user_id: userId, is_read: false },
    { is_read: true },
  );
};

const create = async (data: Partial<Notification>): Promise<Notification> => {
  const repo = getRepository(Notification);
  return repo.save(repo.create(data));
};

export default {
  findByUser,
  findUnreadCount,
  markOneRead,
  markAllRead,
  create,
};
