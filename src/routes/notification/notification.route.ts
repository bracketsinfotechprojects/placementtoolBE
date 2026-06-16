import express from 'express';
import NotificationController from '../../controllers/notification/notification.controller';

const router = express.Router();

router.get('/',                  NotificationController.list);
router.get('/unread-count',      NotificationController.unreadCount);
router.put('/read-all',          NotificationController.markAllRead);
router.put('/:id/read',          NotificationController.markRead);

export default router;
