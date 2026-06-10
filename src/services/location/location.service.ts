import LocationRepository from '../../repositories/location.repository';
import { StringError } from '../../errors/string.error';

/**
 * Location Service
 * Business logic for location-based queries
 * Optimized with extracted validation methods
 */
export default class LocationService {
  // Private validation methods to reduce code duplication
  private static validateCoordinates(latitude: number, longitude: number): void {
    if (latitude < -90 || latitude > 90) {
      throw new StringError('Invalid latitude. Must be between -90 and 90');
    }
    if (longitude < -180 || longitude > 180) {
      throw new StringError('Invalid longitude. Must be between -180 and 180');
    }
  }

  private static validateRadius(radius_km: number): void {
    if (radius_km <= 0 || radius_km > 40000) {
      throw new StringError('Invalid radius. Must be between 0 and 40000 km');
    }
  }

  private static validateLimit(limit: number): void {
    if (limit <= 0 || limit > 1000) {
      throw new StringError('Invalid limit. Must be between 1 and 1000');
    }
  }

  private static validateMinStudents(min_students: number): void {
    if (min_students < 0) {
      throw new StringError('Invalid min_students. Must be 0 or greater');
    }
  }

  /**
   * Get facilities within radius of coordinates
   */
  static async getFacilitiesNearby(params: {
    latitude: number;
    longitude: number;
    radius_km?: number;
    limit?: number;
  }) {
    const { latitude, longitude, radius_km = 10, limit = 50 } = params;

    // Validate all inputs
    this.validateCoordinates(latitude, longitude);
    this.validateRadius(radius_km);
    this.validateLimit(limit);

    const facilities = await LocationRepository.findFacilitiesNearby(
      latitude,
      longitude,
      radius_km,
      limit
    );

    return {
      search_center: { latitude, longitude },
      radius_km,
      total_found: facilities.length,
      facilities
    };
  }

  /**
   * Get students within radius of coordinates
   */
  static async getStudentsNearby(params: {
    latitude: number;
    longitude: number;
    radius_km?: number;
    limit?: number;
  }) {
    const { latitude, longitude, radius_km = 10, limit = 50 } = params;

    // Validate all inputs
    this.validateCoordinates(latitude, longitude);
    this.validateRadius(radius_km);
    this.validateLimit(limit);

    const students = await LocationRepository.findStudentsNearby(
      latitude,
      longitude,
      radius_km,
      limit
    );

    return {
      search_center: { latitude, longitude },
      radius_km,
      total_found: students.length,
      students
    };
  }

  /**
   * Get students near a facility
   */
  static async getStudentsNearFacility(facilityId: number, radiusKm: number = 10, limit: number = 50) {
    this.validateRadius(radiusKm);
    this.validateLimit(limit);

    const students = await LocationRepository.findStudentsNearFacility(
      facilityId,
      radiusKm,
      limit
    );

    if (students.length === 0) {
      return {
        facility_id: facilityId,
        radius_km: radiusKm,
        total_found: 0,
        students: [] as any[],
        message: 'No students found within the specified radius or facility location not set'
      };
    }

    return {
      facility_id: facilityId,
      facility_name: students[0]?.facility_name,
      radius_km: radiusKm,
      total_found: students.length,
      students
    };
  }

  /**
   * Get facilities near a student
   */
  static async getFacilitiesNearStudent(studentId: number, radiusKm: number = 10, limit: number = 50, assignedFacilityIds?: number[]) {
    this.validateRadius(radiusKm);
    this.validateLimit(limit);

    const facilities = await LocationRepository.findFacilitiesNearStudent(
      studentId,
      radiusKm,
      limit,
      assignedFacilityIds
    );

    if (facilities.length === 0) {
      return {
        student_id: studentId,
        radius_km: radiusKm,
        total_found: 0,
        facilities: [] as any[],
        message: 'No facilities found within the specified radius or student location not set'
      };
    }

    return {
      student_id: studentId,
      student_name: facilities[0]?.student_name,
      radius_km: radiusKm,
      total_found: facilities.length,
      facilities
    };
  }

  /**
   * Get all facilities with nearby student counts
   */
  static async getFacilitiesWithStudentCount(params: {
    radius_km?: number;
    min_students?: number;
  }) {
    const { radius_km = 10, min_students = 0 } = params;

    this.validateRadius(radius_km);
    this.validateMinStudents(min_students);

    const facilities = await LocationRepository.getFacilitiesWithStudentCount(
      radius_km,
      min_students
    );

    return {
      radius_km,
      min_students,
      total_facilities: facilities.length,
      facilities
    };
  }
}
