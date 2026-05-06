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

  static async confirm(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const placementslotId = BaseController.parseId(req, 'id');
      const result = await PlacementAssignmentService.confirm(placementslotId);
      ApiResponseUtility.success(res, result.data, result.message);
    }, 'Confirm placement assignments');
  }

  static async confirmByFacility(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const assignmentId = BaseController.parseId(req, 'id');
      const assignment = await PlacementAssignmentService.confirmByFacility(assignmentId);
      ApiResponseUtility.success(res, assignment, 'Placement assignment confirmed by facility');
    }, 'Confirm placement by facility');
  }

  static async rejectByFacility(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const assignmentId = BaseController.parseId(req, 'id');
      const { reason } = req.body;
      const assignment = await PlacementAssignmentService.rejectByFacility(assignmentId, reason);
      ApiResponseUtility.success(res, assignment, 'Placement assignment rejected by facility');
    }, 'Reject placement by facility');
  }

  static async updateFacilityStatus(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const assignmentId = BaseController.parseId(req, 'id');
      const { facility_confirmation_status } = req.body;
      
      if (!facility_confirmation_status) {
        throw new Error('facility_confirmation_status is required');
      }
      
      const assignment = await PlacementAssignmentService.updateFacilityStatus(
        assignmentId, 
        facility_confirmation_status
      );
      ApiResponseUtility.success(res, assignment, 'Facility confirmation status updated successfully');
    }, 'Update facility confirmation status');
  }

  static async updateAssignmentStatus(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const assignmentId = BaseController.parseId(req, 'id');
      const { status } = req.body;
      
      if (!status) {
        throw new Error('status is required');
      }
      
      const assignment = await PlacementAssignmentService.updateStatus(assignmentId, status);
      ApiResponseUtility.success(res, assignment, 'Assignment status updated successfully');
    }, 'Update assignment status');
  }

  static async updateStatusByStudentAndSlot(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const { student_id, placementslot_id } = req.body;
      const { status } = req.body;
      
      if (!student_id || !placementslot_id || !status) {
        throw new Error('student_id, placementslot_id, and status are required');
      }
      
      const assignment = await PlacementAssignmentService.updateStatusByStudentAndSlot(
        student_id,
        placementslot_id,
        status
      );
      ApiResponseUtility.success(res, assignment, 'Assignment status updated successfully');
    }, 'Update assignment status by student and slot');
  }

  static async updateFacilityStatusByStudentAndSlot(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const { student_id, placementslot_id, facility_confirmation_status } = req.body;
      
      if (!student_id || !placementslot_id || !facility_confirmation_status) {
        throw new Error('student_id, placementslot_id, and facility_confirmation_status are required');
      }
      
      const assignment = await PlacementAssignmentService.updateFacilityStatusByStudentAndSlot(
        student_id,
        placementslot_id,
        facility_confirmation_status
      );
      ApiResponseUtility.success(res, assignment, 'Facility confirmation status updated successfully');
    }, 'Update facility status by student and slot');
  }
}
