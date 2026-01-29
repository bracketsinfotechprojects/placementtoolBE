import { Request, Response } from 'express';
import BaseController from '../base.controller';
import PlacementExecutiveService from '../../services/placement-executive/placement-executive.service';
import ApiResponseUtility from '../../utilities/api-response.utility';
import { IPlacementExecutiveQueryParams } from '../../repositories/placement-executive.repository';

export default class PlacementExecutiveController extends BaseController {
  static async create(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const executive = await PlacementExecutiveService.create(req.body);
      ApiResponseUtility.createdSuccess(res, executive, 'Placement Executive created successfully');
    }, 'Create placement executive');
  }

  static async getById(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const executive = await PlacementExecutiveService.getById(id);
      ApiResponseUtility.success(res, executive);
    }, 'Get placement executive by ID');
  }

  static async update(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const executive = await PlacementExecutiveService.update({ id, ...req.body });
      ApiResponseUtility.success(res, executive, 'Placement Executive updated successfully');
    }, 'Update placement executive');
  }

  static async list(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const params: IPlacementExecutiveQueryParams = {
        keyword: req.query.keyword as string,
        employment_type: req.query.employment_type as string,
        sort_by: req.query.sort_by as string,
        sort_order: req.query.sort_order as string,
        ...BaseController.parsePaginationParams(req.query)
      };

      const result = await PlacementExecutiveService.list(params);
      ApiResponseUtility.success(res, result.response, 'Placement Executives retrieved successfully', result.pagination);
    }, 'List placement executives');
  }

  static async delete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      await PlacementExecutiveService.remove(id);
      ApiResponseUtility.success(res, null, 'Placement Executive deleted successfully');
    }, 'Delete placement executive');
  }

  static async permanentlyDelete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      await PlacementExecutiveService.permanentlyDelete(id);
      ApiResponseUtility.success(res, null, 'Placement Executive permanently deleted');
    }, 'Permanently delete placement executive');
  }
}
