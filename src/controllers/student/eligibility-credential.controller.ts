import { Request, Response } from 'express';
import EligibilityCredentialService from '../../services/student/eligibility-credential.service';
import ApiResponse from '../../utilities/api-response.utility';
import logger from '../../configs/logger.config';

/**
 * Controller for eligibility-based credential management
 */
class EligibilityCredentialController {

  /**
   * Send credentials to a specific eligible student
   * POST /api/students/:studentId/send-credentials
   */
  async sendCredentialsToStudent(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);
      const { skipPasswordReset } = req.body;

      if (isNaN(studentId)) {
        return ApiResponse.badRequest(res, 'Invalid student ID');
      }

      const result = await EligibilityCredentialService.checkAndSendCredentials(studentId, {
        skipPasswordReset: skipPasswordReset === true
      });

      if (result.success) {
        return ApiResponse.success(res, result.data, result.message);
      } else {
        return ApiResponse.badRequest(res, result.message);
      }

    } catch (error) {
      logger.error('❌ Error in sendCredentialsToStudent:', error);
      return ApiResponse.serverError(res, 'Failed to send credentials');
    }
  }

  /**
   * Batch process all eligible students
   * POST /api/students/batch-send-credentials
   */
  async batchSendCredentials(req: Request, res: Response): Promise<void> {
    try {
      const { limit, skipExistingUsers } = req.body;

      const options = {
        limit: limit ? parseInt(limit) : 100,
        skipExistingUsers: skipExistingUsers !== false // Default true
      };

      const results = await EligibilityCredentialService.batchProcessEligibleStudents(options);

      return ApiResponse.success(res, results, 'Batch processing completed');

    } catch (error) {
      logger.error('❌ Error in batchSendCredentials:', error);
      return ApiResponse.serverError(res, 'Failed to process batch credentials');
    }
  }

  /**
   * Send eligibility status notification to student
   * POST /api/students/:studentId/notify-eligibility
   */
  async notifyEligibilityStatus(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);

      if (isNaN(studentId)) {
        return ApiResponse.badRequest(res, 'Invalid student ID');
      }

      const result = await EligibilityCredentialService.notifyEligibilityStatus(studentId);

      if (result.success) {
        return ApiResponse.success(res, null, result.message);
      } else {
        return ApiResponse.badRequest(res, result.message);
      }

    } catch (error) {
      logger.error('❌ Error in notifyEligibilityStatus:', error);
      return ApiResponse.serverError(res, 'Failed to send notification');
    }
  }
}

export default new EligibilityCredentialController();
