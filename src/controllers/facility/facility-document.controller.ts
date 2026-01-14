import { Request, Response } from 'express';
import BaseController from '../base.controller';
import FacilityDocumentService from '../../services/facility/facility-document.service';
import ApiResponseUtility from '../../utilities/api-response.utility';

export default class FacilityDocumentController extends BaseController {
  static async create(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const facilityId = BaseController.parseId(req, 'facilityId');
      const document = await FacilityDocumentService.create({
        facility_id: facilityId,
        ...req.body
      });
      ApiResponseUtility.createdSuccess(res, document, 'Document requirement created successfully');
    });
  }

  static async getByFacilityId(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const facilityId = BaseController.parseId(req, 'facilityId');
      const documents = await FacilityDocumentService.getByFacilityId(facilityId);
      ApiResponseUtility.success(res, documents);
    });
  }

  static async getById(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const document = await FacilityDocumentService.getById(id);
      ApiResponseUtility.success(res, document);
    });
  }

  static async update(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const document = await FacilityDocumentService.update({ id, ...req.body });
      ApiResponseUtility.success(res, document, 'Document requirement updated successfully');
    });
  }

  static async delete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      await FacilityDocumentService.remove(id);
      ApiResponseUtility.success(res, null, 'Document requirement deleted successfully');
    });
  }
}
