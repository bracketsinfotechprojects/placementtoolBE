import { Request, Response } from 'express';
import ApiResponseUtility from '../utilities/api-response.utility';
import { StringError } from '../errors/string.error';

/**
 * Base Controller
 * Provides common functionality and error handling for all controllers
 * Follows DRY principle by centralizing repetitive controller logic
 */
export default abstract class BaseController {
  /**
   * Standardized error handler for all controllers
   * Automatically determines appropriate HTTP status and response
   */
  protected static handleError(res: Response, error: any, context?: string): void {
    const errorMessage = context 
      ? `${context}: ${error.message}` 
      : error.message;

    console.error(`❌ ${errorMessage}`, error.stack);

    if (error instanceof StringError) {
      ApiResponseUtility.badRequest(res, error.message);
    } else if (error.name === 'ValidationError') {
      ApiResponseUtility.badRequest(res, error.message);
    } else if (error.message.includes('not found') || error.message.includes('does not exist')) {
      ApiResponseUtility.notFound(res, error.message);
    } else if (error.message.includes('unauthorized') || error.message.includes('permission')) {
      ApiResponseUtility.unauthorized(res, error.message);
    } else {
      ApiResponseUtility.serverError(res, error.message);
    }
  }

  /**
   * Execute controller action with standardized error handling
   * Wraps controller methods to provide consistent try-catch behavior
   */
  protected static async executeAction(
    res: Response,
    action: () => Promise<void>,
    context?: string
  ): Promise<void> {
    try {
      await action();
    } catch (error) {
      this.handleError(res, error, context);
    }
  }

  /**
   * Validate and parse integer ID from request params
   */
  protected static parseId(req: Request, paramName: string = 'id'): number {
    const id = parseInt(req.params[paramName], 10);
    if (isNaN(id)) {
      throw new StringError(`Invalid ${paramName}`);
    }
    return id;
  }

  /**
   * Validate required fields in request body
   */
  protected static validateRequiredFields(body: any, fields: string[]): void {
    const missingFields = fields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      throw new StringError(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  /**
   * Parse pagination parameters from query
   */
  protected static parsePaginationParams(query: any): { limit: number; page: number } {
    return {
      limit: query.limit ? parseInt(query.limit as string, 10) : 20,
      page: query.page ? parseInt(query.page as string, 10) : 1
    };
  }
}
