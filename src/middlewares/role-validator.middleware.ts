import { Request, Response, NextFunction } from 'express';
import RoleService from '../services/role/role.service';
import ApiResponseUtility from '../utilities/api-response.utility';

/**
 * Role Validator Middleware
 * Dynamically validates userRole against database roles
 * No hardcoded role names!
 */
export const validateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userRole, roleID } = req.body;

    // If neither provided, skip validation (will use default)
    if (!userRole && !roleID) {
      return next();
    }

    // If roleID provided, validate it exists
    if (roleID) {
      try {
        await RoleService.getRoleNameById(roleID);
        return next();
      } catch (error) {
        return ApiResponseUtility.badRequest(res, `Invalid roleID: ${roleID}. Role does not exist.`);
      }
    }

    // If userRole provided, validate it exists
    if (userRole) {
      const roleExists = await RoleService.roleExists(userRole);
      if (!roleExists) {
        // Get all valid roles for error message
        const allRoles = await RoleService.getAllRoles();
        const validRoles = allRoles.map(r => r.role_name).join(', ');
        return ApiResponseUtility.badRequest(
          res, 
          `Invalid userRole: "${userRole}". Valid roles are: ${validRoles}`
        );
      }
    }

    next();
  } catch (error) {
    console.error('❌ Role validation error:', error);
    ApiResponseUtility.serverError(res, 'Error validating role');
  }
};
