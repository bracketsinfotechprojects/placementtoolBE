import { Request, Response } from 'express';
import BaseController from '../base.controller';
import FacilityAgreementService from '../../services/facility/facility-agreement.service';
import ApiResponseUtility from '../../utilities/api-response.utility';

export default class FacilityAgreementController extends BaseController {
  static async create(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const facilityId = BaseController.parseId(req, 'facilityId');
      const agreement = await FacilityAgreementService.create({
        facility_id: facilityId,
        ...req.body
      });
      ApiResponseUtility.createdSuccess(res, agreement, 'Agreement created successfully');
    });
  }

  static async getByFacilityId(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const facilityId = BaseController.parseId(req, 'facilityId');
      const agreements = await FacilityAgreementService.getByFacilityId(facilityId);
      ApiResponseUtility.success(res, agreements);
    });
  }

  static async getById(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const agreement = await FacilityAgreementService.getById(id);
      ApiResponseUtility.success(res, agreement);
    });
  }

  static async update(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const agreement = await FacilityAgreementService.update({ id, ...req.body });
      ApiResponseUtility.success(res, agreement, 'Agreement updated successfully');
    });
  }

  static async delete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      await FacilityAgreementService.remove(id);
      ApiResponseUtility.success(res, null, 'Agreement deleted successfully');
    });
  }
}
