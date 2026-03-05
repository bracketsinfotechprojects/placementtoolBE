import { Request, Response } from 'express';
import BaseController from '../base.controller';
import PlacementAssignmentService from '../../services/placement-assignment/placement-assignment.service';
import ApiResponseUtility from '../../utilities/api-response.utility';
import { IPlacementAssignmentQueryParams } from '../../repositories/placement-assignment.repository';

export default class PlacementAssignmentController extends BaseController {
  static async create(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const assignment = await PlacementAssignmentService.create(req.body);
      ApiResponseUtility.createdSuccess(res, assignment, 'Student assigned to placement slot successfully');
    }, 'Create placement assignment');
  }

  static async getById(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const assignment = await PlacementAssignmentService.detail(id);
      ApiResponseUtility.success(res, assignment);
    }, 'Get placement assignment by ID');
  }

  static async list(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const params: IPlacementAssignmentQueryParams = {
        placementslot_id: req.query.placementslot_id ? parseInt(req.query.placementslot_id as string, 10) : undefined,
        student_id: req.query.student_id ? parseInt(req.query.student_id as string, 10) : undefined,
        status: req.query.status as any,
        start_date_from: req.query.start_date_from as string,
        start_date_to: req.query.start_date_to as string,
        sort_by: (req.query.sort_by as string) || 'assignment_id',
        sort_order: (req.query.sort_order as string) || 'DESC',
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1
      };

      const result = await PlacementAssignmentService.list(params);
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
      ApiResponseUtility.success(res, result.assignments, 'Placement assignments retrieved successfully', pagination);
    }, 'List placement assignments');
  }

  static async update(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const assignment = await PlacementAssignmentService.update({ id, ...req.body });
      ApiResponseUtility.success(res, assignment, 'Placement assignment updated successfully');
    }, 'Update placement assignment');
  }

  static async delete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const result = await PlacementAssignmentService.remove(id);
      ApiResponseUtility.success(res, result);
    }, 'Delete placement assignment');
  }

  static async getBySlotId(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const slotId = BaseController.parseId(req, 'slotId');
      const assignments = await PlacementAssignmentService.getBySlotId(slotId);
      ApiResponseUtility.success(res, assignments, 'Assignments for placement slot retrieved successfully');
    }, 'Get assignments by slot ID');
  }

  static async getByStudentId(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const studentId = BaseController.parseId(req, 'studentId');
      const assignments = await PlacementAssignmentService.getByStudentId(studentId);
      ApiResponseUtility.success(res, assignments, 'Assignments for student retrieved successfully');
    }, 'Get assignments by student ID');
  }
}
