import { Request, Response } from 'express';
import BaseController from '../base.controller';
import FacilityOrganizationService from '../../services/facility/facility-organization.service';
import ApiResponseUtility from '../../utilities/api-response.utility';

export default class FacilityOrganizationController extends BaseController {
  static async create(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const facilityId = BaseController.parseId(req, 'facilityId');
      const orgStructure = await FacilityOrganizationService.create({
        facility_id: facilityId,
        ...req.body
      });
      ApiResponseUtility.createdSuccess(res, orgStructure, 'Organization structure created successfully');
    });
  }

  static async getByFacilityId(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const facilityId = BaseController.parseId(req, 'facilityId');
      const orgStructures = await FacilityOrganizationService.getByFacilityId(facilityId);
      ApiResponseUtility.success(res, orgStructures);
    });
  }

  static async getById(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const orgStructure = await FacilityOrganizationService.getById(id);
      ApiResponseUtility.success(res, orgStructure);
    });
  }

  static async update(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const orgStructure = await FacilityOrganizationService.update({ id, ...req.body });
      ApiResponseUtility.success(res, orgStructure, 'Organization structure updated successfully');
    });
  }

  static async delete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      await FacilityOrganizationService.remove(id);
      ApiResponseUtility.success(res, null, 'Organization structure deleted successfully');
    });
  }
}
