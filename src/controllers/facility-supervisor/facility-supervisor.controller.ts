import { Request, Response } from 'express';
import BaseController from '../base.controller';
import FacilitySupervisorService from '../../services/facility-supervisor/facility-supervisor.service';
import ApiResponseUtility from '../../utilities/api-response.utility';
import { IFacilitySupervisorQueryParams } from '../../repositories/facility-supervisor.repository';

export default class FacilitySupervisorController extends BaseController {
  static async create(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      // Extract file paths from multer upload
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
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
      if (bodyData.facility_types && typeof bodyData.facility_types === 'string') {
        try {
          bodyData.facility_types = JSON.parse(bodyData.facility_types);
        } catch (error) {
          bodyData.facility_types = bodyData.facility_types.split(',').map((s: string) => s.trim());
        }
      }
      
      // Convert boolean string fields to actual booleans ('yes'/'no' or 'true'/'false')
      if (bodyData.portal_access_enabled === 'yes' || bodyData.portal_access_enabled === 'true') bodyData.portal_access_enabled = true;
      if (bodyData.portal_access_enabled === 'no' || bodyData.portal_access_enabled === 'false') bodyData.portal_access_enabled = false;
      
      const supervisorData = {
        ...bodyData,
        photograph: files?.photograph?.[0]?.path,
        id_proof_document: files?.id_proof_document?.[0]?.path,
        police_check_document: files?.police_check_document?.[0]?.path,
        authorization_letter_document: files?.authorization_letter_document?.[0]?.path
      };
      
      const supervisor = await FacilitySupervisorService.create(supervisorData);
      ApiResponseUtility.createdSuccess(res, supervisor, 'Facility Supervisor created successfully');
    }, 'Create facility supervisor');
  }

  static async getById(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const supervisor = await FacilitySupervisorService.getById(id);
      ApiResponseUtility.success(res, supervisor);
    }, 'Get facility supervisor by ID');
  }

  static async update(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const supervisor = await FacilitySupervisorService.update({ id, ...req.body });
      ApiResponseUtility.success(res, supervisor, 'Facility Supervisor updated successfully');
    }, 'Update facility supervisor');
  }

  static async list(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const params: IFacilitySupervisorQueryParams = {
        keyword: req.query.keyword as string,
        facility_id: req.query.facility_id ? parseInt(req.query.facility_id as string) : undefined,
        portal_access_enabled: req.query.portal_access_enabled === 'true' ? true : req.query.portal_access_enabled === 'false' ? false : undefined,
        sort_by: req.query.sort_by as string,
        sort_order: req.query.sort_order as string,
        ...BaseController.parsePaginationParams(req.query)
      };

      const result = await FacilitySupervisorService.list(params);
      ApiResponseUtility.success(res, result.response, 'Facility Supervisors retrieved successfully', result.pagination);
    }, 'List facility supervisors');
  }

  static async delete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      await FacilitySupervisorService.remove(id);
      ApiResponseUtility.success(res, null, 'Facility Supervisor deleted successfully');
    }, 'Delete facility supervisor');
  }

  static async permanentlyDelete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      await FacilitySupervisorService.permanentlyDelete(id);
      ApiResponseUtility.success(res, null, 'Facility Supervisor permanently deleted');
    }, 'Permanently delete facility supervisor');
  }
}
