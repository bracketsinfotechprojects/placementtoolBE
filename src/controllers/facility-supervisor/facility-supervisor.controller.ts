import { Request, Response } from 'express';
import BaseController from '../base.controller';
import FacilitySupervisorService from '../../services/facility-supervisor/facility-supervisor.service';
import ApiResponseUtility from '../../utilities/api-response.utility';
import { IFacilitySupervisorQueryParams } from '../../repositories/facility-supervisor.repository';

export default class FacilitySupervisorController extends BaseController {
  static async create(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const supervisor = await FacilitySupervisorService.create(req.body);
      ApiResponseUtility.createdSuccess(res, supervisor, 'Facility Supervisor created successfully');
    }, 'Create facility supervisor');
  }

  static async getById(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const supervisor = await FacilitySupervisorService.getById(id);
      ApiResponseUtility.success(res, supervisor);
    }, 'Get facility supervisor by ID');
  }

  static async update(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const supervisor = await FacilitySupervisorService.update({ id, ...req.body });
      ApiResponseUtility.success(res, supervisor, 'Facility Supervisor updated successfully');
    }, 'Update facility supervisor');
  }

  static async list(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const params: IFacilitySupervisorQueryParams = {
        keyword: req.query.keyword as string,
        facility_id: req.query.facility_id ? parseInt(req.query.facility_id as string) : undefined,
        portal_access_enabled: req.query.portal_access_enabled === 'true' ? true : req.query.portal_access_enabled === 'false' ? false : undefined,
        sort_by: req.query.sort_by as string,
        sort_order: req.query.sort_order as string,
        ...BaseController.parsePaginationParams(req.query)
      };

      const result = await FacilitySupervisorService.list(params);
      ApiResponseUtility.success(res, result.response, 'Facility Supervisors retrieved successfully', result.pagination);
    }, 'List facility supervisors');
  }

  static async delete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      await FacilitySupervisorService.remove(id);
      ApiResponseUtility.success(res, null, 'Facility Supervisor deleted successfully');
    }, 'Delete facility supervisor');
  }

  static async permanentlyDelete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      await FacilitySupervisorService.permanentlyDelete(id);
      ApiResponseUtility.success(res, null, 'Facility Supervisor permanently deleted');
    }, 'Permanently delete facility supervisor');
  }
}
