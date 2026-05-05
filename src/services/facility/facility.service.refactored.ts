/**
 * Facility Service - Main Entry Point
 * Consolidated service that delegates to specialized sub-services
 * 
 * This refactored version splits the original 1600+ line service into:
 * - facility-creation.service.ts: Create operations
 * - facility-query.service.ts: Read operations
 * - facility-update.service.ts: Update/Delete operations
 * - facility.interfaces.ts: Type definitions
 */

import FacilityCreationService from './facility-creation.service';
import FacilityQueryService from './facility-query.service';
import FacilityUpdateService from './facility-update.service';
import { IFacilityQueryParams } from '../../repositories/facility.repository';
import {
  ICreateFacility,
  IUpdateFacility,
  IUpdateCompleteFacility,
  IAgreementFiles
} from './facility.interfaces';

/**
 * Main Facility Service
 * Delegates to specialized services for better organization
 */
class FacilityService {
  // ==================== CREATE OPERATIONS ====================
  
  /**
   * Create new facility with all related entities
   */
  create = FacilityCreationService.create.bind(FacilityCreationService);

  // ==================== READ OPERATIONS ====================
  
  /**
   * Get facility by ID
   */
  getById = FacilityQueryService.getById.bind(FacilityQueryService);

  /**
   * Get facility detail with validation
   */
  detail = FacilityQueryService.detail.bind(FacilityQueryService);

  /**
   * List facilities with pagination and filtering
   */
  list = FacilityQueryService.list.bind(FacilityQueryService);

  /**
   * List facilities with simplified response
   */
  listSimplified = FacilityQueryService.listSimplified.bind(FacilityQueryService);

  // ==================== UPDATE OPERATIONS ====================
  
  /**
   * Update facility (partial update)
   */
  update = FacilityUpdateService.update.bind(FacilityUpdateService);

  /**
   * Complete update (replaces all related entities)
   */
  updateComplete = FacilityUpdateService.updateComplete.bind(FacilityUpdateService);

  /**
   * Soft delete facility
   */
  remove = FacilityUpdateService.remove.bind(FacilityUpdateService);

  /**
   * Permanently delete facility
   */
  permanentlyDelete = FacilityUpdateService.permanentlyDelete.bind(FacilityUpdateService);

  // Note: Bulk upload operations would be in facility-bulk.service.ts
  // bulkUpload = FacilityBulkService.bulkUpload.bind(FacilityBulkService);
  // validateFacilityRow = FacilityBulkService.validateFacilityRow.bind(FacilityBulkService);
}

export default new FacilityService();

// Re-export interfaces for convenience
export * from './facility.interfaces';
