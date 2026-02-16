import { Request, Response } from 'express';
import BaseController from '../base.controller';
import FacilityAgreementService from '../../services/facility/facility-agreement.service';
import ApiResponseUtility from '../../utilities/api-response.utility';

export default class FacilityAgreementController extends BaseController {
  static async create(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const facilityId = BaseController.parseId(req, 'facilityId');
      
      // Get uploaded files
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      
      // Parse body data - handle JSON strings for array fields
      let bodyData = { ...req.body };
      
      // Parse company_name if it's a JSON string
      if (bodyData.company_name && typeof bodyData.company_name === 'string') {
        try {
          bodyData.company_name = JSON.parse(bodyData.company_name);
        } catch (error) {
          // If not valid JSON, split by comma
          bodyData.company_name = bodyData.company_name.split(',').map((s: string) => s.trim());
        }
      }
      
      // Prepare files object
      const agreementFiles = files ? {
        mou_document: files.mou_document?.[0],
        insurance_doc: files.insurance_doc?.[0]
      } : undefined;
      
      const agreement = await FacilityAgreementService.create({
        facility_id: facilityId,
        ...bodyData
      }, agreementFiles);
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
      
      // Get uploaded files
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      
      // Parse body data - handle JSON strings for array fields
      let bodyData = { ...req.body };
      
      // Parse company_name if it's a JSON string
      if (bodyData.company_name && typeof bodyData.company_name === 'string') {
        try {
          bodyData.company_name = JSON.parse(bodyData.company_name);
        } catch (error) {
          // If not valid JSON, split by comma
          bodyData.company_name = bodyData.company_name.split(',').map((s: string) => s.trim());
        }
      }
      
      // Prepare files object
      const agreementFiles = files ? {
        mou_document: files.mou_document?.[0],
        insurance_doc: files.insurance_doc?.[0]
      } : undefined;
      
      const agreement = await FacilityAgreementService.update({ id, ...bodyData }, agreementFiles);
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
