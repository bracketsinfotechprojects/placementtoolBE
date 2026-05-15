import express from 'express';
import httpStatusCodes from 'http-status-codes';

// Interfaces
import IRequest from '../interfaces/IRequest';

// Utilities
import ApiResponse from '../utilities/api-response.utility';

export const isAdmin = () => {
  return async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    // Check if user has admin role (roleID 1 is typically admin)
    if (!req.user || req.user.roleID !== 1) {
      return ApiResponse.error(res, httpStatusCodes.UNAUTHORIZED);
    }
    next();
  };
};

/**
 * Role-based Authorization Middleware
 * Restricts access to specific role IDs
 * Usage: authorizeRoles(2, 3) - allows only Facility (2) and Supervisor (3)
 */
export const authorizeRoles = (...allowedRoles: number[]) => {
  return async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    // Check if user is authenticated (req.user should be set by jwtAuth or authenticate middleware)
    if (!req.user) {
      return ApiResponse.error(res, httpStatusCodes.UNAUTHORIZED, 'Authentication required');
    }

    // Check if user's roleID is in the allowed roles list
    if (!allowedRoles.includes(req.user.roleID)) {
      return ApiResponse.error(
        res, 
        httpStatusCodes.FORBIDDEN, 
        `Access denied. Required roles: ${allowedRoles.join(', ')}`
      );
    }

    next();
  };
};
