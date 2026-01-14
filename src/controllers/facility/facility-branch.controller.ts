import { Request, Response } from 'express';
import BaseController from '../base.controller';
import FacilityBranchService from '../../services/facility/facility-branch.service';
import ApiResponseUtility from '../../utilities/api-response.utility';

export default class FacilityBranchController extends BaseController {
  static async create(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const facilityId = BaseController.parseId(req, 'facilityId');
      const branch = await FacilityBranchService.create({
        facility_id: facilityId,
        ...req.body
      });
      ApiResponseUtility.createdSuccess(res, branch, 'Branch created successfully');
    });
  }

  static async getByFacilityId(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const facilityId = BaseController.parseId(req, 'facilityId');
      const branches = await FacilityBranchService.getByFacilityId(facilityId);
      ApiResponseUtility.success(res, branches);
    });
  }

  static async getById(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const branch = await FacilityBranchService.getById(id);
      ApiResponseUtility.success(res, branch);
    });
  }

  static async update(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const branch = await FacilityBranchService.update({ id, ...req.body });
      ApiResponseUtility.success(res, branch, 'Branch updated successfully');
    });
  }

  static async delete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      await FacilityBranchService.remove(id);
      ApiResponseUtility.success(res, null, 'Branch deleted successfully');
    });
  }
}
