import { Request, Response } from 'express';
import passwordResetCleanupJob from '../../jobs/password-reset-cleanup.job';
import ApiResponseUtility from '../../utilities/api-response.utility';

export default class CleanupController {
  /**
   * Get cleanup job status
   * GET /api/admin/cleanup/status
   */
  static async getStatus(req: Request, res: Response) {
    try {
      const status = passwordResetCleanupJob.getStatus();
      ApiResponseUtility.success(res, status, 'Cleanup job status retrieved');
    } catch (error) {
      ApiResponseUtility.serverError(res, error.message);
    }
  }

  /**
   * Manually trigger cleanup job
   * POST /api/admin/cleanup/run
   */
  static async runCleanup(req: Request, res: Response) {
    try {
      const deletedCount = await passwordResetCleanupJob.runNow();
      
      ApiResponseUtility.success(
        res,
        { deletedCount },
        `Cleanup completed. ${deletedCount} expired OTP(s) deleted`
      );
    } catch (error) {
      ApiResponseUtility.serverError(res, error.message);
    }
  }
}
