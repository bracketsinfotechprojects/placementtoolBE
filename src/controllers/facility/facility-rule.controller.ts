import { Request, Response } from 'express';
import BaseController from '../base.controller';
import FacilityRuleService from '../../services/facility/facility-rule.service';
import ApiResponseUtility from '../../utilities/api-response.utility';

export default class FacilityRuleController extends BaseController {
  static async create(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const facilityId = BaseController.parseId(req, 'facilityId');
      const rule = await FacilityRuleService.create({
        facility_id: facilityId,
        ...req.body
      });
      ApiResponseUtility.createdSuccess(res, rule, 'Rule created successfully');
    });
  }

  static async getByFacilityId(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const facilityId = BaseController.parseId(req, 'facilityId');
      const rules = await FacilityRuleService.getByFacilityId(facilityId);
      ApiResponseUtility.success(res, rules);
    });
  }

  static async getById(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const rule = await FacilityRuleService.getById(id);
      ApiResponseUtility.success(res, rule);
    });
  }

  static async update(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const rule = await FacilityRuleService.update({ id, ...req.body });
      ApiResponseUtility.success(res, rule, 'Rule updated successfully');
    });
  }

  static async delete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      await FacilityRuleService.remove(id);
      ApiResponseUtility.success(res, null, 'Rule deleted successfully');
    });
  }
}
