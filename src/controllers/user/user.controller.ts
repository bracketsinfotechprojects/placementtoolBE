import { Request, Response } from 'express';
import { getRepository } from 'typeorm';

// Entities
import { User } from '../../entities/user/user.entity';

// Services
import UserService from '../../services/user/user.service';

// Interfaces
import { 
  ICreateUser, 
  IUpdateUser, 
  IUserQueryParams,
  ILoginUser
} from '../../interfaces/user.interface';

// Utilities
import ApiResponseUtility from '../../utilities/api-response.utility';

// Errors
import { StringError } from '../../errors/string.error';

export default class UserController {
  // Create a new user
  static async create(req: Request, res: Response) {
    try {
      const userData: ICreateUser = {
        loginID: req.body.loginID,
        password: req.body.password,
        userRole: req.body.userRole || 'user',
        status: req.body.status || 'active'
      };

      const user = await UserService.create(userData);
      ApiResponseUtility.createdSuccess(res, user, 'User created successfully');
    } catch (error) {
      if (error instanceof StringError) {
        ApiResponseUtility.badRequest(res, error.message);
      } else {
        ApiResponseUtility.serverError(res, error.message);
      }
    }
  }

  // User login
  static async login(req: Request, res: Response) {
    try {
      const loginData: ILoginUser = {
        loginID: req.body.loginID,
        password: req.body.password,
      };

      const user = await UserService.authenticate(loginData.loginID, loginData.password);
      ApiResponseUtility.success(res, user, 'Login successful');
    } catch (error) {
      if (error instanceof StringError) {
        ApiResponseUtility.unauthorized(res, error.message);
      } else {
        ApiResponseUtility.serverError(res, error.message);
      }
    }
  }

  // Get user by ID
  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        ApiResponseUtility.badRequest(res, 'Invalid user ID');
        return;
      }

      const user = await UserService.getById({ id });
      if (!user) {
        ApiResponseUtility.notFound(res, 'User not found');
        return;
      }

      ApiResponseUtility.success(res, user);
    } catch (error) {
      ApiResponseUtility.serverError(res, error.message);
    }
  }

  // Update user information
  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        ApiResponseUtility.badRequest(res, 'Invalid user ID');
        return;
      }

      const updateData: IUpdateUser = {
        id,
        loginID: req.body.loginID,
        password: req.body.password,
        userRole: req.body.userRole,
        status: req.body.status
      };

      const updatedUser = await UserService.update(updateData);
      ApiResponseUtility.success(res, updatedUser, 'User updated successfully');
    } catch (error) {
      if (error instanceof StringError) {
        ApiResponseUtility.badRequest(res, error.message);
      } else {
        ApiResponseUtility.serverError(res, error.message);
      }
    }
  }

  // List users with filtering and pagination
  static async list(req: Request, res: Response) {
    try {
      const queryParams: IUserQueryParams = {
        keyword: req.query.keyword as string,
        status: req.query.activation_status as string,
        userRole: req.query.userRole as string,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1
      };

      const result = await UserService.list(queryParams);
      ApiResponseUtility.success(res, result.response, 'Users retrieved successfully', result.pagination);
    } catch (error) {
      ApiResponseUtility.serverError(res, error.message);
    }
  }

  // Delete user (soft delete - mark as inactive)
  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        ApiResponseUtility.badRequest(res, 'Invalid user ID');
        return;
      }

      await UserService.remove({ id });
      ApiResponseUtility.success(res, null, 'User deleted successfully');
    } catch (error) {
      if (error instanceof StringError) {
        ApiResponseUtility.badRequest(res, error.message);
      } else {
        ApiResponseUtility.serverError(res, error.message);
      }
    }
  }

  // Permanently delete user
  static async permanentlyDelete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        ApiResponseUtility.badRequest(res, 'Invalid user ID');
        return;
      }

      await UserService.permanentlyDelete({ id });
      ApiResponseUtility.success(res, null, 'User permanently deleted');
    } catch (error) {
      if (error instanceof StringError) {
        ApiResponseUtility.badRequest(res, error.message);
      } else {
        ApiResponseUtility.serverError(res, error.message);
      }
    }
  }

  // Get user statistics
  static async getStatistics(req: Request, res: Response) {
    try {
      const statistics = await UserService.getStatistics();
      ApiResponseUtility.success(res, statistics);
    } catch (error) {
      ApiResponseUtility.serverError(res, error.message);
    }
  }

  // Change password
  static async changePassword(req: Request, res: Response) {
    try {
      const { current_password, new_password } = req.body;

      // Validate required fields
      if (!current_password || !new_password) {
        ApiResponseUtility.badRequest(res, 'Current password and new password are required');
        return;
      }

      // Get email from authenticated user (from JWT token)
      const user = (req as any).user;
      if (!user || !user.loginID) {
        ApiResponseUtility.unauthorized(res, 'User not authenticated');
        return;
      }

      const result = await UserService.changePassword(user.loginID, current_password, new_password);
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
