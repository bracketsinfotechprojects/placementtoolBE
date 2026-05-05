import FacilityRepository, { IFacilityQueryParams } from '../../repositories/facility.repository';
import { StringError } from '../../errors/string.error';

/**
 * Facility Query Service
 * Handles all read operations for facilities
 */
class FacilityQueryService {
  /**
   * Get facility by ID
   */
  async getById(id: number) {
    return await FacilityRepository.findById(id);
  }

  /**
   * Get facility detail with validation
   */
  async detail(id: number) {
    const facility = await FacilityRepository.findByIdWithRelations(id);
    if (!facility) {
      throw new StringError('Facility does not exist');
    }
    return facility;
  }

  /**
   * List facilities with pagination and filtering
   */
  async list(params: IFacilityQueryParams) {
    return await FacilityRepository.list(params);
  }

  /**
   * List facilities with simplified response
   */
  async listSimplified(params: IFacilityQueryParams) {
    const result = await FacilityRepository.list(params);
    
    // Simplify response - only include essential fields
    const simplifiedResponse = result.response.map(facility => ({
      facility_id: facility.facility_id,
      organization_name: facility.organization_name,
      states_covered: facility.states_covered,
      categories: facility.categories,
      createdAt: facility.createdAt
    }));

    return {
      response: simplifiedResponse,
      pagination: result.pagination
    };
  }
}

export default new FacilityQueryService();
