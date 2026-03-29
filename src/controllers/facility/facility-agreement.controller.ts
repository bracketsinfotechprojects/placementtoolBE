import { Request, Response } from 'express';
import BaseController from '../base.controller';
import FacilityAgreementService from '../../services/facility/facility-agreement.service';
import ApiResponseUtility from '../../utilities/api-response.utility';
import FileService from '../../services/file/file.service';
import { EntityType, DocumentType } from '../../entities/file/file.entity';

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
      
      // Helper function to check if value is provided and not empty
      const hasValue = (value: any) => {
        return value !== undefined && value !== null && value !== '';
      };
      
      // Build update data object - only include fields with actual values
      const updateData: any = { id };
      
      if (hasValue(bodyData.sent_students)) updateData.sent_students = bodyData.sent_students;
      if (hasValue(bodyData.with_mou)) updateData.with_mou = bodyData.with_mou;
      if (hasValue(bodyData.no_mou_but_taken)) updateData.no_mou_but_taken = bodyData.no_mou_but_taken;
      if (hasValue(bodyData.mou_exists_no_spot)) updateData.mou_exists_no_spot = bodyData.mou_exists_no_spot;
      if (hasValue(bodyData.total_students)) updateData.total_students = bodyData.total_students;
      if (hasValue(bodyData.last_placement)) updateData.last_placement = bodyData.last_placement;
      if (hasValue(bodyData.has_mou)) updateData.has_mou = bodyData.has_mou;
      if (hasValue(bodyData.signed_on)) updateData.signed_on = bodyData.signed_on;
      if (hasValue(bodyData.expiry_date)) updateData.expiry_date = bodyData.expiry_date;
      if (bodyData.company_name !== undefined && bodyData.company_name !== null && bodyData.company_name !== '') {
        updateData.company_name = bodyData.company_name;
      }
      if (hasValue(bodyData.payment_required)) updateData.payment_required = bodyData.payment_required;
      if (hasValue(bodyData.amount_per_spot)) updateData.amount_per_spot = bodyData.amount_per_spot;
      if (hasValue(bodyData.payment_notes)) updateData.payment_notes = bodyData.payment_notes;
      
      try {
        // Deactivate old files if new ones are being uploaded
        if (files?.mou_document?.[0]) {
          await FileService.deactivateEntityFiles(EntityType.AGREEMENT, id, DocumentType.MOU_DOCUMENT);
        }
        if (files?.insurance_doc?.[0]) {
          await FileService.deactivateEntityFiles(EntityType.AGREEMENT, id, DocumentType.INSURANCE_DOCUMENT);
        }
        
        // Prepare files object
        const agreementFiles = files ? {
          mou_document: files.mou_document?.[0],
          insurance_doc: files.insurance_doc?.[0]
        } : undefined;
        
        const agreement = await FacilityAgreementService.update(updateData, agreementFiles);
        ApiResponseUtility.success(res, agreement, 'Agreement updated successfully');
        
      } catch (error: any) {
        console.error('❌ Error in agreement update:', error.message);
        throw error;
      }
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
