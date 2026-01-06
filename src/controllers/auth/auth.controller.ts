import { Request, Response } from 'express';

// Services
import AuthService from '../../services/auth/auth.service';

// Utilities
import ApiResponseUtility from '../../utilities/api-response.utility';

// Errors
import { StringError } from '../../errors/string.error';

export default class AuthController {
    /**
     * User login endpoint
     * POST /api/auth/login
     */
    static async login(req: Request, res: Response) {
        try {
            const { loginID, password } = req.body;

            // Validate input
            if (!loginID || !password) {
                ApiResponseUtility.badRequest(res, 'Email and password are required');
                return;
            }

            // Perform login
            const result = await AuthService.login(loginID, password);

            // Return success response
            ApiResponseUtility.success(res, result, 'Login successful');
        } catch (error) {
            if (error instanceof StringError) {
                ApiResponseUtility.unauthorized(res, error.message);
            } else {
                ApiResponseUtility.serverError(res, error.message);
            }
        }
    }

    /**
     * Verify JWT token endpoint
     * POST /api/auth/verify
     */
    static async verifyToken(req: Request, res: Response) {
        try {
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                ApiResponseUtility.badRequest(res, 'Token is required');
                return;
            }

            // Verify token
            const decoded = await AuthService.verifyToken(token);

            // Return success response
            ApiResponseUtility.success(res, decoded, 'Token is valid');
        } catch (error) {
            if (error instanceof StringError) {
                ApiResponseUtility.unauthorized(res, error.message);
            } else {
                ApiResponseUtility.serverError(res, error.message);
            }
        }
    }

    /**
     * Refresh JWT token endpoint
     * POST /api/auth/refresh
     */
    static async refreshToken(req: Request, res: Response) {
        try {
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                ApiResponseUtility.badRequest(res, 'Token is required');
                return;
            }

            // Refresh token
            const newToken = await AuthService.refreshToken(token);

            // Return success response
            ApiResponseUtility.success(res, { token: newToken }, 'Token refreshed successfully');
        } catch (error) {
            if (error instanceof StringError) {
                ApiResponseUtility.unauthorized(res, error.message);
            } else {
                ApiResponseUtility.serverError(res, error.message);
            }
        }
    }

    /**
     * Logout endpoint
     * POST /api/auth/logout
     */
    static async logout(req: Request, res: Response) {
        try {
            // Perform logout
            const result = await AuthService.logout();

            // Return success response
            ApiResponseUtility.success(res, result, 'Logged out successfully');
        } catch (error) {
            ApiResponseUtility.serverError(res, error.message);
        }
    }
}
