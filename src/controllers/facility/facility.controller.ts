import { Request, Response } from 'express';
import BaseController from '../base.controller';
import FacilityService from '../../services/facility/facility.service';
import ApiResponseUtility from '../../utilities/api-response.utility';
import { IFacilityQueryParams } from '../../repositories/facility.repository';
import FileService from '../../services/file/file.service';
import { EntityType, DocumentType } from '../../entities/file/file.entity';

export default class FacilityController extends BaseController {
  static async create(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      // Get uploaded files if any - when using upload.any(), req.files is an array
      const filesArray = req.files as Express.Multer.File[] | undefined;
      
      // Parse body data - handle JSON strings for nested objects
      let bodyData = { ...req.body };
      
      // Parse JSON string fields
      const jsonFields = ['attributes', 'organization_structures', 'branches', 'agreements', 'documents_required', 'rules', 'states_covered', 'categories', 'login'];
      for (const field of jsonFields) {
        if (bodyData[field] && typeof bodyData[field] === 'string') {
          try {
            bodyData[field] = JSON.parse(bodyData[field]);
          } catch (error) {
            // Keep original value if not valid JSON
          }
        }
      }
      
      // Prepare agreement files mapping
      const agreementFiles: Map<number, { mou_document?: Express.Multer.File; insurance_doc?: Express.Multer.File }> = new Map();
      
      if (filesArray && Array.isArray(filesArray)) {
        // Process files (format: mou_document_0, mou_document_1, etc.)
        for (const file of filesArray) {
          if (file.fieldname.startsWith('mou_document_')) {
            const index = parseInt(file.fieldname.replace('mou_document_', ''), 10);
            if (!agreementFiles.has(index)) {
              agreementFiles.set(index, {});
            }
            agreementFiles.get(index)!.mou_document = file;
          }
          if (file.fieldname.startsWith('insurance_doc_')) {
            const index = parseInt(file.fieldname.replace('insurance_doc_', ''), 10);
            if (!agreementFiles.has(index)) {
              agreementFiles.set(index, {});
            }
            agreementFiles.get(index)!.insurance_doc = file;
          }
        }
      }
      
      console.log('📁 Files received:', filesArray?.map(f => f.fieldname) || []);
      console.log('📁 Agreement files map:', Array.from(agreementFiles.entries()));
      
      const facility = await FacilityService.create(bodyData, agreementFiles);
      ApiResponseUtility.createdSuccess(res, facility, 'Facility created successfully');
    }, 'Create facility');
  }

  static async getById(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const facility = await FacilityService.detail(id);
      ApiResponseUtility.success(res, facility);
    }, 'Get facility by ID');
  }

  static async update(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      
      // Extract files from multer upload
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      
      // Parse body data
      let bodyData = req.body;
      
      // Helper function to check if value is provided and not empty
      const hasValue = (value: any) => {
        return value !== undefined && value !== null && value !== '';
      };
      
      // Build update data object - only include fields with actual values
      const updateData: any = { id };
      
      if (hasValue(bodyData.organization_name)) updateData.organization_name = bodyData.organization_name;
      if (hasValue(bodyData.registered_business_name)) updateData.registered_business_name = bodyData.registered_business_name;
      if (hasValue(bodyData.website_url)) updateData.website_url = bodyData.website_url;
      if (hasValue(bodyData.abn_registration_number)) updateData.abn_registration_number = bodyData.abn_registration_number;
      if (hasValue(bodyData.source_of_data)) updateData.source_of_data = bodyData.source_of_data;
      
      try {
        // Update basic facility data first
        if (Object.keys(updateData).length > 1) { // More than just 'id'
          await FacilityService.update(updateData);
        }
        
        // Handle agreement document uploads if files are provided
        if (files?.mou_document?.[0] || files?.insurance_doc?.[0]) {
          // Get the first agreement for this facility
          const FacilityAgreementService = (await import('../../services/facility/facility-agreement.service')).default;
          const agreements = await FacilityAgreementService.getByFacilityId(id);
          
          if (agreements && agreements.length > 0) {
            const firstAgreement = agreements[0];
            
            // Deactivate old files if new ones are being uploaded
            if (files?.mou_document?.[0]) {
              await FileService.deactivateEntityFiles(EntityType.AGREEMENT, firstAgreement.agreement_id, DocumentType.MOU_DOCUMENT);
            }
            if (files?.insurance_doc?.[0]) {
              await FileService.deactivateEntityFiles(EntityType.AGREEMENT, firstAgreement.agreement_id, DocumentType.INSURANCE_DOCUMENT);
            }
            
            // Prepare files object
            const agreementFiles = {
              mou_document: files?.mou_document?.[0],
              insurance_doc: files?.insurance_doc?.[0]
            };
            
            // Update the first agreement with new documents
            await FacilityAgreementService.update({ id: firstAgreement.agreement_id }, agreementFiles);
          } else {
            console.warn('⚠️ No agreements found for facility, skipping document upload');
          }
        }
        
        // Get the final facility with all updated data
        const facility = await FacilityService.detail(id);
        
        ApiResponseUtility.success(res, facility, 'Facility updated successfully');
        
      } catch (error: any) {
        console.error('❌ Error in facility update:', error.message);
        throw error;
      }
    }, 'Update facility');
  }

  static async updateComplete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const facility = await FacilityService.updateComplete({ id, ...req.body });
      ApiResponseUtility.success(res, facility, 'Facility updated successfully with all relations');
    }, 'Update complete facility');
  }

  static async list(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      // Parse array parameters (can be comma-separated strings or arrays)
      const parseArrayParam = (param: any): string[] | undefined => {
        if (!param) return undefined;
        if (Array.isArray(param)) return param;
        return param.split(',').map((s: string) => s.trim());
      };

      const params: IFacilityQueryParams = {
        // Text search filters
        keyword: req.query.keyword as string,
        organization_name: req.query.organization_name as string,
        email: req.query.email as string,
        phone: req.query.phone as string,
        website_url: req.query.website_url as string,
        
        // Status filter
        status: req.query.activation_status as 'active' | 'inactive' | 'all',
        
        // Array filters (support multiple values)
        source_of_data: parseArrayParam(req.query.source_of_data),
        states_covered: parseArrayParam(req.query.states_covered),
        categories: parseArrayParam(req.query.categories),
        
        // Legacy filters (for backward compatibility)
        state: parseArrayParam(req.query.state),
        category: parseArrayParam(req.query.category),
        
        // Boolean filters
        has_mou: req.query.has_mou as 'true' | 'false' | 'all',
        mou_expiring_soon: req.query.mou_expiring_soon as 'true' | 'false',
        
        // Date filters
        mou_start_date: req.query.mou_start_date as string,
        mou_end_date: req.query.mou_end_date as string,
        created_at: req.query.created_at as string,
        
        // Legacy date range filters (for backward compatibility)
        created_from: req.query.created_from as string,
        created_to: req.query.created_to as string,
        
        // Sorting and pagination
        sort_by: req.query.sort_by as string,
        sort_order: req.query.sort_order as string,
        ...BaseController.parsePaginationParams(req.query)
      };

      const result = await FacilityService.list(params);
      ApiResponseUtility.success(res, result.response, 'Facilities retrieved successfully', result.pagination);
    }, 'List facilities');
  }

  static async listSimplified(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const params: IFacilityQueryParams = {
        keyword: req.query.keyword as string,
        source_of_data: req.query.source_of_data as string,
        sort_by: req.query.sort_by as string,
        sort_order: req.query.sort_order as string,
        ...BaseController.parsePaginationParams(req.query)
      };

      const result = await FacilityService.listSimplified(params);
      ApiResponseUtility.success(res, result.response, 'Facilities retrieved successfully', result.pagination);
    }, 'List facilities simplified');
  }

  static async delete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      await FacilityService.remove(id);
      ApiResponseUtility.success(res, null, 'Facility deleted successfully');
    }, 'Delete facility');
  }

  static async permanentlyDelete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      await FacilityService.permanentlyDelete(id);
      ApiResponseUtility.success(res, null, 'Facility permanently deleted');
    }, 'Permanently delete facility');
  }
}
