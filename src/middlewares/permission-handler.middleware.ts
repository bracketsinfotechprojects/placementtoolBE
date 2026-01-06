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
