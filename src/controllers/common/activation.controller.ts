import { Request, Response } from 'express';

// Base
import BaseController from '../base.controller';

// Services
import ActivationService from '../../services/common/activation.service';

// Utilities
import ApiResponseUtility from '../../utilities/api-response.utility';

// Errors
import { StringError } from '../../errors/string.error';

export default class ActivationController extends BaseController {
  /**
   * Generic activation/deactivation endpoint
   * PATCH /api/{tableName}/{id}/activate?activate={true|false}
   */
  static async toggleActivation(req: Request, res: Response) {
    await ActivationController.executeAction(res, async () => {
      const tableName = req.params.tableName;
      const id = ActivationController.parseId(req);
      const activateParam = req.query.activate as string;

      // Validate activate parameter
      if (!activateParam || (activateParam !== 'true' && activateParam !== 'false')) {
        throw new StringError('Query parameter "activate" is required and must be "true" or "false"');
      }

      const activate = activateParam === 'true';

      // Call service
      const result = await ActivationService.toggleActivation(tableName, id, activate);

      ApiResponseUtility.success(res, result, result.message);
    }, 'Failed to update activation status');
  }
}
