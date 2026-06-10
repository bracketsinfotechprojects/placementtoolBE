import { Request, Response } from 'express';
import BaseController from '../base.controller';
import ApiResponseUtility from '../../utilities/api-response.utility';
import DashboardService from '../../services/dashboard/dashboard.service';

const ADMIN_ROLE_ID = 1;
const PLACEMENT_EXECUTIVE_ROLE_ID = 4;

export default class DashboardController extends BaseController {
  static async getAdminStats(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const reqUser = (req as any).user;
      const roleID = reqUser?.roleID;

      if (roleID !== ADMIN_ROLE_ID && roleID !== PLACEMENT_EXECUTIVE_ROLE_ID) {
        return ApiResponseUtility.unauthorized(res, 'Access restricted to admin and placement executive roles');
      }

      const stats = await DashboardService.getAdminStats();
      ApiResponseUtility.success(res, stats, 'Dashboard stats retrieved successfully');
    }, 'Get admin dashboard stats');
  }
}
