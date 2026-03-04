import { Request, Response } from 'express';
import BaseController from '../base.controller';
import PlacementExecutiveService from '../../services/placement-executive/placement-executive.service';
import ApiResponseUtility from '../../utilities/api-response.utility';
import { IPlacementExecutiveQueryParams } from '../../repositories/placement-executive.repository';

export default class PlacementExecutiveController extends BaseController {
  static async create(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const photographFile = req.file;
      
      // Parse login object from JSON string if received as multipart/form-data
      let bodyData = req.body;
      if (bodyData.login && typeof bodyData.login === 'string') {
        try {
          bodyData.login = JSON.parse(bodyData.login);
        } catch (error) {
          throw new Error('Invalid login JSON format');
        }
      }
      
      // Parse array fields from JSON strings if received as multipart/form-data
      if (bodyData.employment_type && typeof bodyData.employment_type === 'string') {
        try {
          bodyData.employment_type = JSON.parse(bodyData.employment_type);
        } catch (error) {
          // If not valid JSON, split by comma
          bodyData.employment_type = bodyData.employment_type.split(',').map((s: string) => s.trim());
        }
      }
      if (bodyData.facility_types_handled && typeof bodyData.facility_types_handled === 'string') {
        try {
          bodyData.facility_types_handled = JSON.parse(bodyData.facility_types_handled);
        } catch (error) {
          bodyData.facility_types_handled = bodyData.facility_types_handled.split(',').map((s: string) => s.trim());
        }
      }
      
      const executive = await PlacementExecutiveService.create(bodyData, photographFile);
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
