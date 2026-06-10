import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import BaseController from '../base.controller';
import ApiResponseUtility from '../../utilities/api-response.utility';
import DashboardService from '../../services/dashboard/dashboard.service';
import { User } from '../../entities/user/user.entity';

const ADMIN_ROLE_ID = 1;
const FACILITY_ROLE_ID = 2;
const SUPERVISOR_ROLE_ID = 3;
const PLACEMENT_EXECUTIVE_ROLE_ID = 4;
const TRAINER_ROLE_ID = 5;
const STUDENT_ROLE_ID = 6;

export default class DashboardController extends BaseController {
  static async getAdminStats(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const { roleID } = (req as any).user;
      if (roleID !== ADMIN_ROLE_ID && roleID !== PLACEMENT_EXECUTIVE_ROLE_ID) {
        return ApiResponseUtility.unauthorized(res, 'Access restricted to admin and placement executive roles');
      }
      const stats = await DashboardService.getAdminStats();
      ApiResponseUtility.success(res, stats, 'Dashboard stats retrieved successfully');
    }, 'Get admin dashboard stats');
  }

  static async getStudentStats(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const reqUser = (req as any).user;
      if (reqUser.roleID !== STUDENT_ROLE_ID) {
        return ApiResponseUtility.unauthorized(res, 'Access restricted to student role');
      }
      const user = await getRepository(User).findOne({ where: { id: reqUser.id, isDeleted: false } });
      if (!user?.studentID) {
        return ApiResponseUtility.success(res, {
          totalFacilitiesAssigned: 0,
          placementBooked: 0,
          downloads: { workshopCertificates: [], placementCertificates: [] },
        }, 'Student stats retrieved');
      }
      const stats = await DashboardService.getStudentStats(user.studentID);
      ApiResponseUtility.success(res, stats, 'Student dashboard stats retrieved successfully');
    }, 'Get student dashboard stats');
  }

  static async getFacilityStats(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const reqUser = (req as any).user;
      if (reqUser.roleID !== FACILITY_ROLE_ID) {
        return ApiResponseUtility.unauthorized(res, 'Access restricted to facility role');
      }
      if (!reqUser.facilityID) {
        return ApiResponseUtility.badRequest(res, 'Facility ID not found in token');
      }
      const stats = await DashboardService.getFacilityStats(reqUser.facilityID);
      ApiResponseUtility.success(res, stats, 'Facility dashboard stats retrieved successfully');
    }, 'Get facility dashboard stats');
  }

  static async getTrainerStats(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const reqUser = (req as any).user;
      if (reqUser.roleID !== TRAINER_ROLE_ID) {
        return ApiResponseUtility.unauthorized(res, 'Access restricted to trainer role');
      }
      // trainerID may not be in the JWT — fall back to DB lookup
      let trainerID = reqUser.trainerID;
      if (!trainerID) {
        const user = await getRepository(User).findOne({ where: { id: reqUser.id, isDeleted: false } });
        trainerID = user?.trainerID;
      }
      if (!trainerID) {
        return ApiResponseUtility.success(res, { courseSlotsAvailable: 0, studentsCompleted: 0 }, 'Trainer stats retrieved');
      }
      const stats = await DashboardService.getTrainerStats(trainerID);
      ApiResponseUtility.success(res, stats, 'Trainer dashboard stats retrieved successfully');
    }, 'Get trainer dashboard stats');
  }

  static async getSupervisorStats(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const reqUser = (req as any).user;
      if (reqUser.roleID !== SUPERVISOR_ROLE_ID) {
        return ApiResponseUtility.unauthorized(res, 'Access restricted to supervisor role');
      }
      // facilityID may not be in JWT — fall back to DB lookup via supervisorID
      let facilityID = reqUser.facilityID;
      if (!facilityID) {
        const user = await getRepository(User).findOne({ where: { id: reqUser.id, isDeleted: false } });
        if (user?.supervisorID) {
          const { getManager } = await import('typeorm');
          const [row] = await getManager().query(
            `SELECT facility_id FROM FacilitySupervisor WHERE supervisor_id = ? AND isDeleted = 0 LIMIT 1`,
            [user.supervisorID]
          );
          facilityID = row?.facility_id;
        }
      }
      if (!facilityID) {
        return ApiResponseUtility.success(res, { slotsAvailable: 0, activeInterns: 0 }, 'Supervisor stats retrieved');
      }
      const stats = await DashboardService.getSupervisorStats(facilityID);
      ApiResponseUtility.success(res, stats, 'Supervisor dashboard stats retrieved successfully');
    }, 'Get supervisor dashboard stats');
  }
}
