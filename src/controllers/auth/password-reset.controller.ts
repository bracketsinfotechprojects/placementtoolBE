import { Request, Response } from 'express';

// Services
import PasswordResetService from '../../services/auth/password-reset.service';

// Utilities
import ApiResponseUtility from '../../utilities/api-response.utility';

// Errors
import { StringError } from '../../errors/string.error';

export default class PasswordResetController {
  /**
   * Request password reset - Generate and send OTP
   * POST /api/auth/forgot-password
   */
  static async requestPasswordReset(req: Request, res: Response) {
    try {
      const { loginID } = req.body;

      // Validate input
      if (!loginID) {
        ApiResponseUtility.badRequest(res, 'Login ID is required');
        return;
      }

      // Request password reset
      const result = await PasswordResetService.requestPasswordReset(loginID);

      // Return success response
      ApiResponseUtility.success(res, result, result.message);
    } catch (error) {
      if (error instanceof StringError) {
        ApiResponseUtility.badRequest(res, error.message);
      } else {
        ApiResponseUtility.serverError(res, error.message);
      }
    }
  }

  /**
   * Verify OTP
   * POST /api/auth/verify-otp
   */
  static async verifyOTP(req: Request, res: Response) {
    try {
      const { loginID, otp } = req.body;

      // Validate input
      if (!loginID || !otp) {
        ApiResponseUtility.badRequest(res, 'Login ID and OTP are required');
        return;
      }

      // Verify OTP
      const result = await PasswordResetService.verifyOTP(loginID, otp);

      // Return success response
      ApiResponseUtility.success(res, result, result.message);
    } catch (error) {
      if (error instanceof StringError) {
        ApiResponseUtility.badRequest(res, error.message);
      } else {
        ApiResponseUtility.serverError(res, error.message);
      }
    }
  }

  /**
   * Reset password with OTP
   * POST /api/auth/reset-password
   */
  static async resetPassword(req: Request, res: Response) {
    try {
      const { loginID, otp, newPassword } = req.body;

      // Validate input
      if (!loginID || !otp || !newPassword) {
        ApiResponseUtility.badRequest(res, 'Login ID, OTP, and new password are required');
        return;
      }

      // Reset password
      const result = await PasswordResetService.resetPassword(loginID, otp, newPassword);

      // Return success response
      ApiResponseUtility.success(res, result, result.message);
    } catch (error) {
      if (error instanceof StringError) {
        ApiResponseUtility.badRequest(res, error.message);
      } else {
        ApiResponseUtility.serverError(res, error.message);
      }
    }
  }
}
