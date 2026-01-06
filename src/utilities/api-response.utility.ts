import { Response } from 'express';
import httpStatusCodes from 'http-status-codes';

// Interfaces
import { ICookie, IPagination, IOverrideRequest } from '../interfaces/common.interface';

// Errors
import { StringError } from '../errors/string.error';

export default class ApiResponse {
  static result = (
    res: Response,
    data: object,
    status: number = 200,
    cookie: ICookie = null,
    pagination: IPagination = null,
  ) => {
    res.status(status);
    if (cookie) {
      res.cookie(cookie.key, cookie.value);
    }

    let responseData: any = { data, success: true };

    if (pagination) {
      responseData = { ...responseData, pagination };
    }

    res.json(responseData);
  };

  static error = (
    res: Response,
    status: number = 400,
    error: string = httpStatusCodes.getStatusText(status),
    override: IOverrideRequest = null,
  ) => {
    res.status(status).json({
      override,
      error: {
        message: error,
      },
      success: false,
    });
  };

  static setCookie = (res: Response, key: string, value: string) => {
    res.cookie(key, value);
  };

  static exception(res: any, error: any) {
    if (error instanceof StringError) {
      return ApiResponse.error(res, httpStatusCodes.BAD_REQUEST, error.message);
    }
    return ApiResponse.error(res, httpStatusCodes.BAD_REQUEST, 'Something went wrong');
  }

  // Convenience methods for common response types
  static success(
    res: Response,
    data: object = null,
    message: string = 'Success',
    pagination: IPagination = null
  ) {
    let responseData: any = { data, success: true, message };

    if (pagination) {
      responseData = { ...responseData, pagination };
    }

    res.status(httpStatusCodes.OK).json(responseData);
  }

  static createdSuccess(
    res: Response,
    data: object = null,
    message: string = 'Resource created successfully'
  ) {
    res.status(httpStatusCodes.CREATED).json({
      data,
      success: true,
      message
    });
  }

  static badRequest(
    res: Response,
    message: string = 'Bad request',
    override: IOverrideRequest = null
  ) {
    return ApiResponse.error(res, httpStatusCodes.BAD_REQUEST, message, override);
  }

  static notFound(
    res: Response,
    message: string = 'Resource not found',
    override: IOverrideRequest = null
  ) {
    return ApiResponse.error(res, httpStatusCodes.NOT_FOUND, message, override);
  }

  static serverError(
    res: Response,
    message: string = 'Internal server error',
    override: IOverrideRequest = null
  ) {
    return ApiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, message, override);
  }

  static unauthorized(
    res: Response,
    message: string = 'Unauthorized access',
    override: IOverrideRequest = null
  ) {
    return ApiResponse.error(res, httpStatusCodes.UNAUTHORIZED, message, override);
  }
}
