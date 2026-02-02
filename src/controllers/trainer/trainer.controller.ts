import { Request, Response } from 'express';
import BaseController from '../base.controller';
import TrainerService from '../../services/trainer/trainer.service';
import ApiResponseUtility from '../../utilities/api-response.utility';
import { ITrainerQueryParams } from '../../repositories/trainer.repository';

export default class TrainerController extends BaseController {
  static async create(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const trainer = await TrainerService.create(req.body);
      ApiResponseUtility.createdSuccess(res, trainer, 'Trainer created successfully');
    }, 'Create trainer');
  }

  static async getById(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const trainer = await TrainerService.getById(id);
      ApiResponseUtility.success(res, trainer);
    }, 'Get trainer by ID');
  }

  static async update(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const trainer = await TrainerService.update({ id, ...req.body });
      ApiResponseUtility.success(res, trainer, 'Trainer updated successfully');
    }, 'Update trainer');
  }

  static async list(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const params: ITrainerQueryParams = {
        keyword: req.query.keyword as string,
        trainer_type: req.query.trainer_type as string,
        sort_by: req.query.sort_by as string,
        sort_order: req.query.sort_order as string,
        ...BaseController.parsePaginationParams(req.query)
      };

      const result = await TrainerService.list(params);
      ApiResponseUtility.success(res, result.response, 'Trainers retrieved successfully', result.pagination);
    }, 'List trainers');
  }

  static async delete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      await TrainerService.remove(id);
      ApiResponseUtility.success(res, null, 'Trainer deleted successfully');
    }, 'Delete trainer');
  }

  static async permanentlyDelete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      await TrainerService.permanentlyDelete(id);
      ApiResponseUtility.success(res, null, 'Trainer permanently deleted');
    }, 'Permanently delete trainer');
  }
}
