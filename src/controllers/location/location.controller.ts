import { Request, Response } from 'express';
import LocationService from '../../services/location/location.service';
import ApiResponseUtility from '../../utilities/api-response.utility';
import BaseController from '../base.controller';

/**
 * Location Controller
 * Handles location-based queries for facilities and students
 * Optimized with extracted helper methods
 */
export default class LocationController extends BaseController {
  /**
   * Helper: Parse and sanitize location query parameters
   */
  private static parseLocationParams(req: Request): {
    radius_km: number;
    limit: number;
  } {
    const radius_km = req.query.radius_km 
      ? Math.max(0, Math.min(500, parseFloat(req.query.radius_km as string)))
      : 10;
    
    const limit = req.query.limit 
      ? Math.max(1, Math.min(1000, parseInt(req.query.limit as string, 10)))
      : 50;
    
    return { radius_km, limit };
  }

  /**
   * Helper: Parse and validate coordinates
   */
  private static parseCoordinates(req: Request): {
    latitude: number;
    longitude: number;
  } | null {
    const latitude = parseFloat(req.query.latitude as string);
    const longitude = parseFloat(req.query.longitude as string);

    if (isNaN(latitude) || isNaN(longitude)) {
      return null;
    }

    return { latitude, longitude };
  }

  /**
   * Get facilities within radius of coordinates
   * GET /api/location/facilities/nearby?latitude=X&longitude=Y&radius_km=Z&limit=N
   */
  static async getFacilitiesNearby(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const coords = LocationController.parseCoordinates(req);
      if (!coords) {
        return ApiResponseUtility.badRequest(res, 'Valid latitude and longitude are required');
      }

      const { radius_km, limit } = LocationController.parseLocationParams(req);

      const result = await LocationService.getFacilitiesNearby({
        ...coords,
        radius_km,
        limit
      });

      ApiResponseUtility.success(
        res,
        result,
        `Found ${result.total_found} facilities within ${radius_km}km`
      );
    }, 'Get facilities nearby');
  }

  /**
   * Get students within radius of coordinates
   * GET /api/location/students/nearby?latitude=X&longitude=Y&radius_km=Z&limit=N
   */
  static async getStudentsNearby(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const coords = LocationController.parseCoordinates(req);
      if (!coords) {
        return ApiResponseUtility.badRequest(res, 'Valid latitude and longitude are required');
      }

      const { radius_km, limit } = LocationController.parseLocationParams(req);

      const result = await LocationService.getStudentsNearby({
        ...coords,
        radius_km,
        limit
      });

      ApiResponseUtility.success(
        res,
        result,
        `Found ${result.total_found} students within ${radius_km}km`
      );
    }, 'Get students nearby');
  }

  /**
   * Get students near a specific facility
   * GET /api/location/facilities/:facilityId/nearby-students?radius_km=Z&limit=N
   */
  static async getStudentsNearFacility(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const facilityId = BaseController.parseId(req, 'facilityId');
      const { radius_km, limit } = LocationController.parseLocationParams(req);

      const result = await LocationService.getStudentsNearFacility(
        facilityId,
        radius_km,
        limit
      );

      ApiResponseUtility.success(
        res,
        result,
        result.message || `Found ${result.total_found} students within ${radius_km}km of facility`
      );
    }, 'Get students near facility');
  }

  /**
   * Get facilities near a specific student
   * GET /api/location/students/:studentId/nearby-facilities?radius_km=Z&limit=N
   */
  static async getFacilitiesNearStudent(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const studentId = BaseController.parseId(req, 'studentId');
      const { radius_km, limit } = LocationController.parseLocationParams(req);

      const result = await LocationService.getFacilitiesNearStudent(
        studentId,
        radius_km,
        limit
      );

      ApiResponseUtility.success(
        res,
        result,
        result.message || `Found ${result.total_found} facilities within ${radius_km}km of student`
      );
    }, 'Get facilities near student');
  }

  /**
   * Get all facilities with nearby student counts
   * GET /api/location/facilities-with-student-count?radius_km=Z&min_students=N
   */
  static async getFacilitiesWithStudentCount(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const radius_km = req.query.radius_km 
        ? Math.max(0, Math.min(40000, parseFloat(req.query.radius_km as string)))
        : 10;
      
      const min_students = req.query.min_students 
        ? Math.max(0, parseInt(req.query.min_students as string, 10))
        : 0;

      const result = await LocationService.getFacilitiesWithStudentCount({
        radius_km,
        min_students
      });

      ApiResponseUtility.success(
        res,
        result,
        `Found ${result.total_facilities} facilities with nearby students`
      );
    }, 'Get facilities with student count');
  }
}
