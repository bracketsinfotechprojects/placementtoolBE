import { Request, Response } from 'express';
import BaseController from '../base.controller';
import TrainerService from '../../services/trainer/trainer.service';
import ApiResponseUtility from '../../utilities/api-response.utility';
import { ITrainerQueryParams } from '../../repositories/trainer.repository';

export default class TrainerController extends BaseController {
  static async create(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const photographFile = req.file;
      
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
      const arrayFields = ['trainer_type', 'course_auth', 'state_covered', 'cities_covered', 'available_days', 'time_slots'];
      for (const field of arrayFields) {
        if (bodyData[field] && typeof bodyData[field] === 'string') {
          try {
            bodyData[field] = JSON.parse(bodyData[field]);
          } catch (error) {
            // If not valid JSON, split by comma
            bodyData[field] = bodyData[field].split(',').map((s: string) => s.trim());
          }
        }
      }
      
      // Convert boolean string fields to actual booleans ('yes'/'no' or 'true'/'false')
      if (bodyData.suprise_visit === 'yes' || bodyData.suprise_visit === 'true') bodyData.suprise_visit = true;
      if (bodyData.suprise_visit === 'no' || bodyData.suprise_visit === 'false') bodyData.suprise_visit = false;
      
      const trainer = await TrainerService.create(bodyData, photographFile);
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
