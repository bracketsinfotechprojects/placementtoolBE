import { getManager } from 'typeorm';

/**
 * Location Repository
 * Handles geospatial queries for facilities and students
 */
export default class LocationRepository {
  /**
   * Find facilities within radius of given coordinates
   * @param latitude - Center point latitude
   * @param longitude - Center point longitude
   * @param radiusKm - Search radius in kilometers
   * @param limit - Maximum number of results
   */
  static async findFacilitiesNearby(
    latitude: number,
    longitude: number,
    radiusKm: number,
    limit: number = 50
  ): Promise<any[]> {
    const manager = getManager();
    
    // MySQL spatial query using ST_Distance_Sphere
    // Returns distance in meters, so we multiply radiusKm by 1000
    const query = `
      SELECT 
        f.facility_id,
        f.organization_name,
        f.registered_business_name,
        f.website_url,
        f.states_covered,
        f.categories,
        ST_X(f.location) as longitude,
        ST_Y(f.location) as latitude,
        ROUND(ST_Distance_Sphere(f.location, POINT(?, ?)) / 1000, 2) as distance_km
      FROM facility f
      WHERE f.isDeleted = 0
        AND f.location IS NOT NULL
        AND ST_X(f.location) != 0 
        AND ST_Y(f.location) != 0
        AND ST_Distance_Sphere(f.location, POINT(?, ?)) <= ?
      ORDER BY distance_km ASC
      LIMIT ?
    `;

    const results = await manager.query(query, [
      longitude,
      latitude,
      longitude,
      latitude,
      radiusKm * 1000, // Convert km to meters
      limit
    ]);

    return results;
  }

  /**
   * Find students within radius of given coordinates
   * @param latitude - Center point latitude
   * @param longitude - Center point longitude
   * @param radiusKm - Search radius in kilometers
   * @param limit - Maximum number of results
   */
  static async findStudentsNearby(
    latitude: number,
    longitude: number,
    radiusKm: number,
    limit: number = 50
  ): Promise<any[]> {
    const manager = getManager();
    
    const query = `
      SELECT 
        s.student_id,
        s.first_name,
        s.last_name,
        s.student_type,
        s.status,
        ST_X(s.location) as longitude,
        ST_Y(s.location) as latitude,
        ROUND(ST_Distance_Sphere(s.location, POINT(?, ?)) / 1000, 2) as distance_km
      FROM students s
      WHERE s.isDeleted = 0
        AND s.location IS NOT NULL
        AND ST_X(s.location) != 0 
        AND ST_Y(s.location) != 0
        AND ST_Distance_Sphere(s.location, POINT(?, ?)) <= ?
      ORDER BY distance_km ASC
      LIMIT ?
    `;

    const results = await manager.query(query, [
      longitude,
      latitude,
      longitude,
      latitude,
      radiusKm * 1000,
      limit
    ]);

    return results;
  }

  /**
   * Find students near a specific facility
   * @param facilityId - Facility ID
   * @param radiusKm - Search radius in kilometers
   * @param limit - Maximum number of results
   */
  static async findStudentsNearFacility(
    facilityId: number,
    radiusKm: number,
    limit: number = 50
  ): Promise<any[]> {
    const manager = getManager();
    
    // Optimized: Use INNER JOIN instead of CROSS JOIN for better query plan
    const query = `
      SELECT 
        s.student_id,
        s.first_name,
        s.last_name,
        s.student_type,
        s.status,
        ST_X(s.location) as longitude,
        ST_Y(s.location) as latitude,
        ROUND(ST_Distance_Sphere(s.location, f.location) / 1000, 2) as distance_km,
        f.facility_id,
        f.organization_name as facility_name
      FROM facility f
      INNER JOIN students s ON (
        s.isDeleted = 0
        AND s.location IS NOT NULL
        AND ST_X(s.location) != 0 
        AND ST_Y(s.location) != 0
        AND ST_Distance_Sphere(s.location, f.location) <= ?
      )
      WHERE f.isDeleted = 0
        AND f.facility_id = ?
        AND f.location IS NOT NULL
        AND ST_X(f.location) != 0 
        AND ST_Y(f.location) != 0
      ORDER BY distance_km ASC
      LIMIT ?
    `;

    const results = await manager.query(query, [
      radiusKm * 1000,
      facilityId,
      limit
    ]);

    return results;
  }

  /**
   * Find facilities near a specific student
   * @param studentId - Student ID
   * @param radiusKm - Search radius in kilometers
   * @param limit - Maximum number of results
   */
  static async findFacilitiesNearStudent(
    studentId: number,
    radiusKm: number,
    limit: number = 50,
    assignedFacilityIds?: number[]
  ): Promise<any[]> {
    const manager = getManager();

    // When a specific set of facility IDs is provided, restrict results to only those facilities
    let assignedFilter = '';
    const extraParams: any[] = [];
    if (assignedFacilityIds && assignedFacilityIds.length > 0) {
      const placeholders = assignedFacilityIds.map(() => '?').join(',');
      assignedFilter = `AND f.facility_id IN (${placeholders})`;
      extraParams.push(...assignedFacilityIds);
    }

    const query = `
      SELECT
        f.facility_id,
        f.organization_name,
        f.registered_business_name,
        f.website_url,
        f.states_covered,
        f.categories,
        ST_X(f.location) as longitude,
        ST_Y(f.location) as latitude,
        ROUND(ST_Distance_Sphere(f.location, s.location) / 1000, 2) as distance_km,
        s.student_id,
        CONCAT(s.first_name, ' ', s.last_name) as student_name
      FROM students s
      INNER JOIN facility f ON (
        f.isDeleted = 0
        AND f.location IS NOT NULL
        AND ST_X(f.location) != 0
        AND ST_Y(f.location) != 0
        AND ST_Distance_Sphere(f.location, s.location) <= ?
      )
      WHERE s.isDeleted = 0
        AND s.student_id = ?
        AND s.location IS NOT NULL
        AND ST_X(s.location) != 0
        AND ST_Y(s.location) != 0
        ${assignedFilter}
      ORDER BY distance_km ASC
      LIMIT ?
    `;

    const results = await manager.query(query, [
      radiusKm * 1000,
      studentId,
      ...extraParams,
      limit
    ]);

    return results;
  }

  /**
   * Fetch facilities by explicit IDs — no geospatial filter.
   * Used for student role where we show all assigned facilities regardless of location data.
   */
  static async findFacilitiesByIds(facilityIds: number[]): Promise<any[]> {
    if (facilityIds.length === 0) return [];
    const manager = getManager();
    const placeholders = facilityIds.map(() => '?').join(',');
    const query = `
      SELECT
        f.facility_id,
        f.organization_name,
        f.registered_business_name,
        f.website_url,
        f.states_covered,
        f.categories,
        ST_X(f.location) as longitude,
        ST_Y(f.location) as latitude
      FROM facility f
      WHERE f.isDeleted = 0
        AND f.facility_id IN (${placeholders})
      ORDER BY f.organization_name ASC
    `;
    return await manager.query(query, facilityIds);
  }

  /**
   * Get all facilities with count of nearby students
   * Optimized: Uses COALESCE to avoid null values, reducing post-processing
   * @param radiusKm - Search radius in kilometers
   * @param minStudents - Minimum number of students (optional filter)
   */
  static async getFacilitiesWithStudentCount(
    radiusKm: number,
    minStudents: number = 0
  ): Promise<any[]> {
    const manager = getManager();
    
    const query = `
      SELECT 
        f.facility_id,
        f.organization_name,
        f.registered_business_name,
        f.website_url,
        f.states_covered,
        f.categories,
        ST_X(f.location) as longitude,
        ST_Y(f.location) as latitude,
        COUNT(s.student_id) as nearby_students_count,
        COALESCE(
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'student_id', s.student_id,
              'name', CONCAT(s.first_name, ' ', s.last_name),
              'student_type', s.student_type,
              'status', s.status,
              'latitude', ROUND(ST_Y(s.location), 6),
              'longitude', ROUND(ST_X(s.location), 6),
              'distance_km', ROUND(ST_Distance_Sphere(s.location, f.location) / 1000, 2)
            )
          ),
          JSON_ARRAY()
        ) as nearby_students
      FROM facility f
      LEFT JOIN students s ON (
        s.isDeleted = 0
        AND s.location IS NOT NULL
        AND ST_X(s.location) != 0 
        AND ST_Y(s.location) != 0
        AND ST_Distance_Sphere(s.location, f.location) <= ?
      )
      WHERE f.isDeleted = 0
        AND f.location IS NOT NULL
        AND ST_X(f.location) != 0 
        AND ST_Y(f.location) != 0
      GROUP BY f.facility_id, f.organization_name, f.registered_business_name, 
               f.website_url, f.states_covered, f.categories, f.location
      ${minStudents > 0 ? 'HAVING nearby_students_count >= ?' : ''}
      ORDER BY nearby_students_count DESC, f.organization_name ASC
    `;

    const params = minStudents > 0 
      ? [radiusKm * 1000, minStudents]
      : [radiusKm * 1000];

    const results = await manager.query(query, params);

    // Optimized: Minimal post-processing - MySQL driver handles JSON parsing
    return results.map((row: any) => {
      let nearbyStudents = row.nearby_students;
      
      // Handle both string and already-parsed array
      if (typeof nearbyStudents === 'string') {
        try {
          nearbyStudents = JSON.parse(nearbyStudents);
        } catch (e) {
          nearbyStudents = [];
        }
      }
      
      // Filter out any null entries (shouldn't happen with COALESCE, but safety check)
      if (Array.isArray(nearbyStudents)) {
        nearbyStudents = nearbyStudents.filter((s: any) => s !== null && s.student_id !== null);
      } else {
        nearbyStudents = [];
      }
      
      return {
        ...row,
        nearby_students: nearbyStudents
      };
    });
  }
}
