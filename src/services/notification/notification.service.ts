import NotificationRepository from '../../repositories/notification.repository';
import { Notification } from '../../entities/notification/notification.entity';

const getNotifications = async (userId: number, page: number, limit: number) => {
  const offset = (page - 1) * limit;
  const [items, total] = await NotificationRepository.findByUser(userId, limit, offset);
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      hasMore: offset + items.length < total,
    },
  };
};

const getUnreadCount = async (userId: number): Promise<number> => {
  return NotificationRepository.findUnreadCount(userId);
};

const markOneRead = async (notificationId: number, userId: number) => {
  await NotificationRepository.markOneRead(notificationId, userId);
};

const markAllRead = async (userId: number) => {
  await NotificationRepository.markAllRead(userId);
};

// Utility to create a single notification (called from other services/events)
const createNotification = async (params: {
  userId: number;
  title: string;
  message: string;
  type?: Notification['type'];
  actionUrl?: string;
}): Promise<Notification> => {
  return NotificationRepository.create({
    user_id: params.userId,
    title: params.title,
    message: params.message,
    type: params.type || 'info',
    action_url: params.actionUrl || null,
    is_read: false,
  });
};

export default {
  getNotifications,
  getUnreadCount,
  markOneRead,
  markAllRead,
  createNotification,
};
