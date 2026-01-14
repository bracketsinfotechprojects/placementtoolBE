import { Request, Response } from 'express';
import BaseController from '../base.controller';
import FacilityAttributeService from '../../services/facility/facility-attribute.service';
import ApiResponseUtility from '../../utilities/api-response.utility';

export default class FacilityAttributeController extends BaseController {
  static async create(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const facilityId = BaseController.parseId(req, 'facilityId');
      const attribute = await FacilityAttributeService.create({
        facility_id: facilityId,
        ...req.body
      });
      ApiResponseUtility.createdSuccess(res, attribute, 'Attribute created successfully');
    });
  }

  static async getByFacilityId(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const facilityId = BaseController.parseId(req, 'facilityId');
      const attributes = await FacilityAttributeService.getByFacilityId(facilityId);
      ApiResponseUtility.success(res, attributes);
    });
  }

  static async update(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const attribute = await FacilityAttributeService.update({ id, ...req.body });
      ApiResponseUtility.success(res, attribute, 'Attribute updated successfully');
    });
  }

  static async delete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      await FacilityAttributeService.remove(id);
      ApiResponseUtility.success(res, null, 'Attribute deleted successfully');
    });
  }
}
