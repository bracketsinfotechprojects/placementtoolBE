import { Request, Response } from 'express';
import BaseController from '../base.controller';
import PlacementSlotService from '../../services/placement-slot/placement-slot.service';
import ApiResponseUtility from '../../utilities/api-response.utility';
import { IPlacementSlotQueryParams } from '../../repositories/placement-slot.repository';

export default class PlacementSlotController extends BaseController {
  static async create(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      // Get the authenticated user ID from the request
      const createdByUserId = (req as any).user?.id;

      if (!createdByUserId) {
        throw new Error('User authentication required');
      }

      const slot = await PlacementSlotService.create(req.body, createdByUserId);
      ApiResponseUtility.createdSuccess(res, slot, 'Placement slot created successfully');
    }, 'Create placement slot');
  }

  static async getById(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const slot = await PlacementSlotService.detail(id);
      ApiResponseUtility.success(res, slot);
    }, 'Get placement slot by ID');
  }

  static async update(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const slot = await PlacementSlotService.update({ id, ...req.body });
      ApiResponseUtility.success(res, slot, 'Placement slot updated successfully');
    }, 'Update placement slot');
  }

  static async list(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const params: IPlacementSlotQueryParams = {
        // Status filter
        status: req.query.status as 'active' | 'inactive' | 'all',

        // ID filters
        facility_id: req.query.facility_id ? parseInt(req.query.facility_id as string, 10) : undefined,
        created_by: req.query.created_by ? parseInt(req.query.created_by as string, 10) : undefined,

        // Core slot details filters
        placementslot_type: req.query.placementslot_type as string,
        course_applicable: req.query.course_applicable as string,
        shift_type: req.query.shift_type as string,
        working_days: req.query.working_days as string,
        gender_preference: req.query.gender_preference as string,

        // Boolean filters - handle string conversion
        urgent_requirement: req.query.urgent_requirement !== undefined
          ? req.query.urgent_requirement === 'true'
          : undefined,
        placement_fee_status: req.query.placement_fee_status !== undefined
          ? req.query.placement_fee_status === 'true'
          : undefined,
        work_hour_limit: req.query.work_hour_limit !== undefined
          ? req.query.work_hour_limit === 'true'
          : undefined,

        // Priority and category
        priority_category: req.query.priority_category as string,

        // Date range filters
        placement_start_date_from: req.query.placement_start_date_from as string,
        placement_start_date_to: req.query.placement_start_date_to as string,
        placement_end_date_from: req.query.placement_end_date_from as string,
        placement_end_date_to: req.query.placement_end_date_to as string,
        created_from: req.query.created_from as string,
        created_to: req.query.created_to as string,

        // Text search
        keyword: req.query.keyword as string,

        // Pagination and sorting
        sort_by: (req.query.sort_by as string) || 'placementslot_id',
        sort_order: (req.query.sort_order as string) || 'DESC',
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1
      };

      const result = await PlacementSlotService.list(params);
      const limit = params.limit || 20;
      const page = params.page || 1;
      const totalPages = Math.ceil(result.total / limit);
      const pagination = {
        totalPages,
        previousPage: page > 1 ? page - 1 : null,
        currentPage: page,
        nextPage: page < totalPages ? page + 1 : null,
        totalItems: result.total
      };
      ApiResponseUtility.success(res, result.slots, 'Placement slots retrieved successfully', pagination);
    }, 'List placement slots');
  }

  static async delete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const result = await PlacementSlotService.remove(id);
      ApiResponseUtility.success(res, result);
    }, 'Delete placement slot');
  }

  static async permanentlyDelete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const result = await PlacementSlotService.permanentlyDelete(id);
      ApiResponseUtility.success(res, result);
    }, 'Permanently delete placement slot');
  }
}
