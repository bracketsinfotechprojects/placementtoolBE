import { Request, Response, NextFunction } from 'express';

// Utilities
import JwtUtility from '../utilities/jwt.utility';
import ApiResponseUtility from '../utilities/api-response.utility';

// Interfaces
import IRequest from '../interfaces/IRequest';

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header
 * Attaches decoded token to request object
 */
export const jwtAuth = (req: IRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log('❌ No authorization header provided');
      return ApiResponseUtility.unauthorized(res, 'Authorization token is required');
    }

    // Extract token from "Bearer <token>" format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.log('❌ Invalid authorization header format');
      return ApiResponseUtility.unauthorized(res, 'Invalid authorization header format. Use: Bearer <token>');
    }

    const token = parts[1];

    // Verify token
    try {
      const decoded = JwtUtility.verifyAccessToken(token);
      
      // Attach decoded token to request object
      req.user = decoded;
      
      console.log('✅ Access token verified for user:', decoded.loginID);
      next();
    } catch (error: any) {
      console.log('❌ Token verification failed:', error.message);
      
      // Send specific error for expired tokens
      if (error.message === 'TOKEN_EXPIRED') {
        return ApiResponseUtility.unauthorized(res, 'Token expired. Please refresh your token.');
      }
      return ApiResponseUtility.unauthorized(res, 'Invalid or expired access token');
    }
  } catch (error) {
    console.error('❌ Authentication middleware error:', error.message);
    return ApiResponseUtility.serverError(res, 'Authentication error');
  }
};

/**
 * Optional JWT Authentication Middleware
 * Verifies JWT token if provided, but doesn't require it
 */
export const jwtAuthOptional = (req: IRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        try {
          const decoded = JwtUtility.verifyAccessToken(parts[1]);
          req.user = decoded;
          console.log('✅ Access token verified for user:', decoded.loginID);
        } catch (error: any) {
          console.log('⚠️ Token verification failed, continuing without auth:', error.message);
        }
      }
    }

    next();
  } catch (error) {
    console.error('❌ Optional auth middleware error:', error.message);
    next();
  }
};

/**
 * Admin Only Middleware
 * Requires JWT token and admin role (roleID = 1)
 */
export const adminOnly = (req: IRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      console.log('❌ No user in request');
      return ApiResponseUtility.unauthorized(res, 'Authorization token is required');
    }

    if (req.user.roleID !== 1) {
      console.log('❌ User is not admin. RoleID:', req.user.roleID);
      return ApiResponseUtility.unauthorized(res, 'Admin access required');
    }

    console.log('✅ Admin access granted for user:', req.user.loginID);
    next();
  } catch (error) {
    console.error('❌ Admin check middleware error:', error.message);
    return ApiResponseUtility.serverError(res, 'Authorization error');
  }
};

export default jwtAuth;
