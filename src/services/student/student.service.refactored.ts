/**
 * Student Service - Main Entry Point
 * Consolidated service that delegates to specialized sub-services
 * 
 * This refactored version splits the original 2500+ line service into:
 * - student-creation.service.ts: Create operations
 * - student-query.service.ts: Read operations
 * - student-update.service.ts: Update/Delete operations
 * - student-records.service.ts: Facility records, address changes, job status
 * - student-bulk.service.ts: Bulk upload operations
 * - student.interfaces.ts: Type definitions
 */

import StudentCreationService from './student-creation.service';
import StudentQueryService from './student-query.service';
import StudentUpdateService from './student-update.service';
import StudentRecordsService from './student-records.service';
import { IDeleteById, IDetailById } from '../../interfaces/common.interface';
import {
  ICreateStudent,
  ICreateExternalStudent,
  IUpdateStudent,
  IStudentQueryParams,
  IAdvancedSearchParams,
  ICreateFacilityRecords,
  ICreateAddressChangeRequest,
  ICreateJobStatusUpdate,
  ICreateSelfPlacement,
  IUpdateAddressChangeRequest,
  IUpdateJobStatusUpdate,
  IUpdateSelfPlacement
} from './student.interfaces';

/**
 * Main Student Service
 * Delegates to specialized services for better organization
 */
class StudentService {
  // ==================== CREATE OPERATIONS ====================
  
  /**
   * Create new student with all related entities and user account
   */
  create = StudentCreationService.create.bind(StudentCreationService);

  /**
   * Create external student (no user account, limited tables)
   */
  createExternalStudent = StudentCreationService.createExternal.bind(StudentCreationService);

  // ==================== READ OPERATIONS ====================
  
  /**
   * Get student by ID with location
   */
  getById = StudentQueryService.getById.bind(StudentQueryService);

  /**
   * Get student detail with validation
   */
  detail = StudentQueryService.detail.bind(StudentQueryService);

  /**
   * Get all student details with relations and user account
   */
  getAllDetails = StudentQueryService.getAllDetails.bind(StudentQueryService);

  /**
   * Get students list with specific fields
   */
  getStudentsList = StudentQueryService.getStudentsList.bind(StudentQueryService);

  /**
   * List students with pagination and filtering
   */
  list = StudentQueryService.list.bind(StudentQueryService);

  /**
   * Advanced search for students
   */
  advancedSearch = StudentQueryService.advancedSearch.bind(StudentQueryService);

  /**
   * Get student statistics
   */
  getStatistics = StudentQueryService.getStatistics.bind(StudentQueryService);

  /**
   * Get student with user account details
   */
  getWithUserDetails = StudentQueryService.getWithUserDetails.bind(StudentQueryService);

  // ==================== UPDATE OPERATIONS ====================
  
  /**
   * Update student with all related entities
   */
  update = StudentUpdateService.update.bind(StudentUpdateService);

  /**
   * Soft delete student
   */
  remove = StudentUpdateService.remove.bind(StudentUpdateService);

  /**
   * Permanently delete student
   */
  permanentlyDelete = StudentUpdateService.permanentlyDelete.bind(StudentUpdateService);

  /**
   * Bulk update student status
   */
  bulkUpdateStatus = StudentUpdateService.bulkUpdateStatus.bind(StudentUpdateService);

  // ==================== RECORDS OPERATIONS ====================
  
  /**
   * Add facility record for student
   */
  addFacilityRecord = StudentRecordsService.addFacilityRecord.bind(StudentRecordsService);

  /**
   * Add address change request
   */
  addAddressChangeRequest = StudentRecordsService.addAddressChangeRequest.bind(StudentRecordsService);

  /**
   * Add job status update
   */
  addJobStatusUpdate = StudentRecordsService.addJobStatusUpdate.bind(StudentRecordsService);

  /**
   * Add self placement
   */
  addSelfPlacement = StudentRecordsService.addSelfPlacement.bind(StudentRecordsService);

  /**
   * Update address change request
   */
  updateAddressChangeRequest = StudentRecordsService.updateAddressChangeRequest.bind(StudentRecordsService);

  /**
   * Update job status update
   */
  updateJobStatusUpdate = StudentRecordsService.updateJobStatusUpdate.bind(StudentRecordsService);

  /**
   * Update self placement
   */
  updateSelfPlacement = StudentRecordsService.updateSelfPlacement.bind(StudentRecordsService);

  // Note: Bulk upload operations would be in student-bulk.service.ts
  // bulkUpload = StudentBulkService.bulkUpload.bind(StudentBulkService);
  // generateTemplate = StudentBulkService.generateTemplate.bind(StudentBulkService);
}

export default new StudentService();

// Re-export interfaces for convenience
export * from './student.interfaces';
