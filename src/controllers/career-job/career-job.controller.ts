import { Response } from 'express';
import BaseController from '../base.controller';
import CareerJobService from '../../services/career-job/career-job.service';
import ApiResponseUtility from '../../utilities/api-response.utility';
import IRequest from '../../interfaces/IRequest';

export default class CareerJobController extends BaseController {

  static async create(req: IRequest, res: Response) {
    await BaseController.executeAction(res, async () => {
      const job = await CareerJobService.create(req.body, req.user.id);
      ApiResponseUtility.createdSuccess(res, job, 'Career job created successfully');
    }, 'Create career job');
  }

  static async update(req: IRequest, res: Response) {
    await BaseController.executeAction(res, async () => {
      const jobId = BaseController.parseId(req, 'jobId');
      const job = await CareerJobService.update(jobId, req.body);
      ApiResponseUtility.success(res, job, 'Career job updated successfully');
    }, 'Update career job');
  }

  static async list(req: IRequest, res: Response) {
    await BaseController.executeAction(res, async () => {
      const isActive = req.query.is_active !== undefined
        ? req.query.is_active === 'true'
        : undefined;

      const params = {
        is_active: isActive,
        sort_by: (req.query.sort_by as string) || 'job_id',
        sort_order: (req.query.sort_order as string) || 'DESC',
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1
      };

      const result = await CareerJobService.list(params);
      const limit = params.limit;
      const page = params.page;
      const totalPages = Math.ceil(result.total / limit);
      const pagination = {
        totalPages,
        previousPage: page > 1 ? page - 1 : null,
        currentPage: page,
        nextPage: page < totalPages ? page + 1 : null,
        totalItems: result.total
      };
      ApiResponseUtility.success(res, result.jobs, 'Career jobs retrieved successfully', pagination);
    }, 'List career jobs');
  }

  static async getById(req: IRequest, res: Response) {
    await BaseController.executeAction(res, async () => {
      const jobId = BaseController.parseId(req, 'jobId');
      const job = await CareerJobService.getById(jobId);
      ApiResponseUtility.success(res, job);
    }, 'Get career job by ID');
  }

  static async assignStudents(req: IRequest, res: Response) {
    await BaseController.executeAction(res, async () => {
      const jobId = BaseController.parseId(req, 'jobId');
      const { studentIds } = req.body;
      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        throw new Error('studentIds must be a non-empty array');
      }
      const result = await CareerJobService.assignStudents(jobId, studentIds, req.user.id);
      ApiResponseUtility.success(res, result, 'Students assigned successfully');
    }, 'Assign students to career job');
  }

  static async submitInterest(req: IRequest, res: Response) {
    await BaseController.executeAction(res, async () => {
      const jobId = BaseController.parseId(req, 'jobId');
      const { studentId } = req.body;
      if (!studentId) throw new Error('studentId is required');
      const result = await CareerJobService.submitInterest(jobId, Number(studentId));
      ApiResponseUtility.success(res, result, result.message);
    }, 'Submit interest for career job');
  }

  static async getInterestedStudents(req: IRequest, res: Response) {
    await BaseController.executeAction(res, async () => {
      const jobId = BaseController.parseId(req, 'jobId');
      const students = await CareerJobService.getInterestedStudents(jobId);
      ApiResponseUtility.success(res, students, 'Interested students retrieved successfully');
    }, 'Get interested students');
  }

  static async getStudentAssignedJobs(req: IRequest, res: Response) {
    await BaseController.executeAction(res, async () => {
      const studentId = BaseController.parseId(req, 'studentId');
      const jobs = await CareerJobService.getStudentAssignedJobs(studentId);
      ApiResponseUtility.success(res, jobs, 'Assigned jobs retrieved successfully');
    }, 'Get student assigned jobs');
  }

  static async toggleActive(req: IRequest, res: Response) {
    await BaseController.executeAction(res, async () => {
      const jobId = BaseController.parseId(req, 'jobId');
      const { is_active } = req.body;
      if (is_active === undefined) throw new Error('is_active is required');
      const job = await CareerJobService.toggleActive(jobId, Boolean(is_active));
      ApiResponseUtility.success(res, job, `Job ${is_active ? 'activated' : 'deactivated'} successfully`);
    }, 'Toggle career job active status');
  }
}
