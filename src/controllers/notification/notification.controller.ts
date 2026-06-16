import { Response } from 'express';
import BaseController from '../base.controller';
import NotificationService from '../../services/notification/notification.service';
import ApiResponseUtility from '../../utilities/api-response.utility';
import IRequest from '../../interfaces/IRequest';

export default class NotificationController extends BaseController {

  // GET /api/notifications?page=1&limit=10
  static async list(req: IRequest, res: Response) {
    await BaseController.executeAction(res, async () => {
      const userId = req.user.id;
      const page  = req.query.page  ? parseInt(req.query.page  as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await NotificationService.getNotifications(userId, page, limit);
      ApiResponseUtility.success(res, result.items, 'Notifications retrieved', result.pagination as any);
    }, 'List notifications');
  }

  // GET /api/notifications/unread-count
  static async unreadCount(req: IRequest, res: Response) {
    await BaseController.executeAction(res, async () => {
      const count = await NotificationService.getUnreadCount(req.user.id);
      ApiResponseUtility.success(res, { count }, 'Unread count retrieved');
    }, 'Get unread count');
  }

  // PUT /api/notifications/:id/read
  static async markRead(req: IRequest, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      await NotificationService.markOneRead(id, req.user.id);
      ApiResponseUtility.success(res, null, 'Notification marked as read');
    }, 'Mark notification read');
  }

  // PUT /api/notifications/read-all
  static async markAllRead(req: IRequest, res: Response) {
    await BaseController.executeAction(res, async () => {
      await NotificationService.markAllRead(req.user.id);
      ApiResponseUtility.success(res, null, 'All notifications marked as read');
    }, 'Mark all notifications read');
  }
}
