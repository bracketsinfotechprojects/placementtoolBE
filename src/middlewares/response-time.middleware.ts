import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to track and log API response time
 * Adds response time to response headers and optionally to response body
 */
export const responseTimeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Store original json method
  const originalJson = res.json.bind(res);

  // Override json method to add response time
  res.json = function (body: any) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Add response time to headers
    res.setHeader('X-Response-Time', `${responseTime}ms`);

    // If body is an object, add response_time_ms field
    if (body && typeof body === 'object' && !Array.isArray(body)) {
      body.response_time_ms = responseTime;
    }

    // Log response time
    console.log(`[${req.method}] ${req.originalUrl} - ${responseTime}ms`);

    return originalJson(body);
  };

  next();
};

export default responseTimeMiddleware;
