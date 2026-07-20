import { Request, Response } from 'express';
import BaseController from '../base.controller';
import FacilitySupervisorService from '../../services/facility-supervisor/facility-supervisor.service';
import ApiResponseUtility from '../../utilities/api-response.utility';
import { IFacilitySupervisorQueryParams } from '../../repositories/facility-supervisor.repository';
import FileService from '../../services/file/file.service';
import { EntityType, DocumentType } from '../../entities/file/file.entity';
import * as fs from 'fs';
import PlacementAssignmentService from '../../services/placement-assignment/placement-assignment.service';
import IRequest from '../../interfaces/IRequest';
import { StringError } from '../../errors/string.error';

export default class FacilitySupervisorController extends BaseController {
  static async create(req: Request, res: Response) {
    // Extract file paths from multer upload
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    // Parse login object from JSON string if received as multipart/form-data
    let bodyData = req.body;
    if (bodyData.login && typeof bodyData.login === 'string') {
      try {
        bodyData.login = JSON.parse(bodyData.login);
      } catch (error) {
        // Clean up uploaded files on error
        FacilitySupervisorController.cleanupFiles(files);
        throw new Error('Invalid login JSON format');
      }
    }
    
    // Parse array fields from JSON strings if received as multipart/form-data
    if (bodyData.facility_types && typeof bodyData.facility_types === 'string') {
      try {
        bodyData.facility_types = JSON.parse(bodyData.facility_types);
      } catch (error) {
        bodyData.facility_types = bodyData.facility_types.split(',').map((s: string) => s.trim());
      }
    }
    
    // Convert boolean string fields to actual booleans ('yes'/'no' or 'true'/'false')
    if (bodyData.portal_access_enabled === 'yes' || bodyData.portal_access_enabled === 'true') bodyData.portal_access_enabled = true;
    if (bodyData.portal_access_enabled === 'no' || bodyData.portal_access_enabled === 'false') bodyData.portal_access_enabled = false;
    
    // Create supervisor first (without file paths)
    const supervisorData = {
      ...bodyData,
      photograph: undefined,
      id_proof_document: undefined,
      police_check_document: undefined,
      authorization_letter_document: undefined
    };
    
    let supervisor: any = null;
    let supervisorId: number | null = null;
    const uploadedFiles: any[] = [];
    
    try {
      supervisor = await FacilitySupervisorService.create(supervisorData);
      supervisorId = supervisor.supervisor_id;
      
      // Upload photograph
      if (files?.photograph?.[0]) {
        const fileRecord = await FileService.uploadFile({
          file: files.photograph[0],
          entity_type: EntityType.FACILITY_SUPERVISOR,
          entity_id: supervisorId,
          doc_type: DocumentType.PHOTOGRAPH
        });
        uploadedFiles.push(fileRecord);
        await FacilitySupervisorService.update({
          id: supervisorId,
          photograph: fileRecord.file_path
        });
      }
      
      // Upload id_proof_document
      if (files?.id_proof_document?.[0]) {
        const fileRecord = await FileService.uploadFile({
          file: files.id_proof_document[0],
          entity_type: EntityType.FACILITY_SUPERVISOR,
          entity_id: supervisorId,
          doc_type: DocumentType.ID_PROOF
        });
        uploadedFiles.push(fileRecord);
        await FacilitySupervisorService.update({
          id: supervisorId,
          id_proof_document: fileRecord.file_path
        });
      }
      
      // Upload police_check_document
      if (files?.police_check_document?.[0]) {
        const fileRecord = await FileService.uploadFile({
          file: files.police_check_document[0],
          entity_type: EntityType.FACILITY_SUPERVISOR,
          entity_id: supervisorId,
          doc_type: DocumentType.POLICE_CHECK
        });
        uploadedFiles.push(fileRecord);
        await FacilitySupervisorService.update({
          id: supervisorId,
          police_check_document: fileRecord.file_path
        });
      }
      
      // Upload authorization_letter_document
      if (files?.authorization_letter_document?.[0]) {
        const fileRecord = await FileService.uploadFile({
          file: files.authorization_letter_document[0],
          entity_type: EntityType.FACILITY_SUPERVISOR,
          entity_id: supervisorId,
          doc_type: DocumentType.AUTHORIZATION_LETTER
        });
        uploadedFiles.push(fileRecord);
        await FacilitySupervisorService.update({
          id: supervisorId,
          authorization_letter_document: fileRecord.file_path
        });
      }
      
      // Get the final supervisor with all file paths
      const finalSupervisor = await FacilitySupervisorService.getById(supervisorId);
      
      ApiResponseUtility.createdSuccess(res, {
        ...finalSupervisor,
        uploaded_files: uploadedFiles
      }, 'Facility Supervisor created successfully');
      
    } catch (error: any) {
      console.error('❌ Error in facility supervisor creation, rolling back...', error.message);
      
      // Rollback: Delete uploaded files from files table
      for (const uploadedFile of uploadedFiles) {
        try {
          await FileService.permanentlyDeleteFile(uploadedFile.id);
          console.log(`🗑️ Rolled back file: ${uploadedFile.file_path}`);
        } catch (deleteError) {
          console.error(`⚠️ Failed to rollback file ${uploadedFile.id}:`, deleteError);
        }
      }
      
      // Rollback: Delete the supervisor record
      if (supervisorId) {
        try {
          await FacilitySupervisorService.permanentlyDelete(supervisorId);
          console.log(`🗑️ Rolled back supervisor: ${supervisorId}`);
        } catch (deleteError) {
          console.error(`⚠️ Failed to rollback supervisor ${supervisorId}:`, deleteError);
        }
      }
      
      // Clean up any remaining temp files
      FacilitySupervisorController.cleanupFiles(files);
      
      throw error;
    }
  }
  
  // Helper method to clean up uploaded files
  private static cleanupFiles(files: { [fieldname: string]: Express.Multer.File[] } | undefined) {
    if (!files) return;
    
    for (const fieldname of Object.keys(files)) {
      const fileArray = files[fieldname];
      if (Array.isArray(fileArray)) {
        for (const file of fileArray) {
          if (file.path && fs.existsSync(file.path)) {
            try {
              fs.unlinkSync(file.path);
              console.log(`🗑️ Cleaned up temp file: ${file.path}`);
            } catch (error) {
              console.error(`⚠️ Failed to clean up temp file ${file.path}:`, error);
            }
          }
        }
      }
    }
  }

  static async getById(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const supervisor = await FacilitySupervisorService.getById(id);
      ApiResponseUtility.success(res, supervisor);
    }, 'Get facility supervisor by ID');
  }

  static async update(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      
      // Extract file paths from multer upload
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Parse body data
      let bodyData = req.body;
      
      // Parse array fields from JSON strings if received as multipart/form-data
      if (bodyData.facility_types && typeof bodyData.facility_types === 'string') {
        try {
          bodyData.facility_types = JSON.parse(bodyData.facility_types);
        } catch (error) {
          bodyData.facility_types = bodyData.facility_types.split(',').map((s: string) => s.trim());
        }
      }
      
      // Convert numeric fields from strings to numbers
      if (bodyData.facility_id && typeof bodyData.facility_id === 'string') {
        bodyData.facility_id = parseInt(bodyData.facility_id);
      }
      if (bodyData.max_students_can_handle && typeof bodyData.max_students_can_handle === 'string') {
        bodyData.max_students_can_handle = parseInt(bodyData.max_students_can_handle);
      }
      
      // Convert boolean string fields to actual booleans
      if (bodyData.portal_access_enabled === 'yes' || bodyData.portal_access_enabled === 'true') bodyData.portal_access_enabled = true;
      if (bodyData.portal_access_enabled === 'no' || bodyData.portal_access_enabled === 'false') bodyData.portal_access_enabled = false;
      
      const uploadedFiles: any[] = [];
      
      try {
        // Build update data object - only include fields that have actual values
        const updateData: any = { id };
        
        // Helper function to check if value is provided and not empty
        const hasValue = (value: any) => {
          return value !== undefined && value !== null && value !== '';
        };
        
        // Only add fields that have actual values (not empty strings from Swagger)
        if (hasValue(bodyData.full_name)) updateData.full_name = bodyData.full_name;
        if (hasValue(bodyData.designation)) updateData.designation = bodyData.designation;
        if (hasValue(bodyData.mobile_number)) updateData.mobile_number = bodyData.mobile_number;
        if (hasValue(bodyData.email)) updateData.email = bodyData.email;
        if (hasValue(bodyData.facility_id)) updateData.facility_id = bodyData.facility_id;
        if (hasValue(bodyData.facility_name)) updateData.facility_name = bodyData.facility_name;
        if (hasValue(bodyData.branch_site)) updateData.branch_site = bodyData.branch_site;
        if (bodyData.facility_types !== undefined && bodyData.facility_types !== null && bodyData.facility_types !== '') {
          updateData.facility_types = bodyData.facility_types;
        }
        if (hasValue(bodyData.facility_address)) updateData.facility_address = bodyData.facility_address;
        if (hasValue(bodyData.max_students_can_handle)) updateData.max_students_can_handle = bodyData.max_students_can_handle;
        if (bodyData.portal_access_enabled !== undefined && bodyData.portal_access_enabled !== null && bodyData.portal_access_enabled !== '') {
          updateData.portal_access_enabled = bodyData.portal_access_enabled;
        }
        
        // Update basic supervisor data first (without file paths)
        if (Object.keys(updateData).length > 1) { // More than just 'id'
          await FacilitySupervisorService.update(updateData);
        }
        
        // Handle file uploads only if new files are provided
        
        // Upload photograph if provided
        if (files?.photograph?.[0]) {
          // Deactivate old photograph files
          await FileService.deactivateEntityFiles(EntityType.FACILITY_SUPERVISOR, id, DocumentType.PHOTOGRAPH);
          
          const fileRecord = await FileService.uploadFile({
            file: files.photograph[0],
            entity_type: EntityType.FACILITY_SUPERVISOR,
            entity_id: id,
            doc_type: DocumentType.PHOTOGRAPH
          });
          uploadedFiles.push(fileRecord);
          await FacilitySupervisorService.update({
            id,
            photograph: fileRecord.file_path
          });
        }
        
        // Upload id_proof_document if provided
        if (files?.id_proof_document?.[0]) {
          // Deactivate old ID proof files
          await FileService.deactivateEntityFiles(EntityType.FACILITY_SUPERVISOR, id, DocumentType.ID_PROOF);
          
          const fileRecord = await FileService.uploadFile({
            file: files.id_proof_document[0],
            entity_type: EntityType.FACILITY_SUPERVISOR,
            entity_id: id,
            doc_type: DocumentType.ID_PROOF
          });
          uploadedFiles.push(fileRecord);
          await FacilitySupervisorService.update({
            id,
            id_proof_document: fileRecord.file_path
          });
        }
        
        // Upload police_check_document if provided
        if (files?.police_check_document?.[0]) {
          // Deactivate old police check files
          await FileService.deactivateEntityFiles(EntityType.FACILITY_SUPERVISOR, id, DocumentType.POLICE_CHECK);
          
          const fileRecord = await FileService.uploadFile({
            file: files.police_check_document[0],
            entity_type: EntityType.FACILITY_SUPERVISOR,
            entity_id: id,
            doc_type: DocumentType.POLICE_CHECK
          });
          uploadedFiles.push(fileRecord);
          await FacilitySupervisorService.update({
            id,
            police_check_document: fileRecord.file_path
          });
        }
        
        // Upload authorization_letter_document if provided
        if (files?.authorization_letter_document?.[0]) {
          // Deactivate old authorization letter files
          await FileService.deactivateEntityFiles(EntityType.FACILITY_SUPERVISOR, id, DocumentType.AUTHORIZATION_LETTER);
          
          const fileRecord = await FileService.uploadFile({
            file: files.authorization_letter_document[0],
            entity_type: EntityType.FACILITY_SUPERVISOR,
            entity_id: id,
            doc_type: DocumentType.AUTHORIZATION_LETTER
          });
          uploadedFiles.push(fileRecord);
          await FacilitySupervisorService.update({
            id,
            authorization_letter_document: fileRecord.file_path
          });
        }
        
        // Get the final supervisor with all updated data
        const supervisor = await FacilitySupervisorService.getById(id);
        
        ApiResponseUtility.success(res, {
          ...supervisor,
          uploaded_files: uploadedFiles.length > 0 ? uploadedFiles : undefined
        }, 'Facility Supervisor updated successfully');
        
      } catch (error: any) {
        console.error('❌ Error in facility supervisor update:', error.message);
        
        // Clean up any uploaded temp files on error
        FacilitySupervisorController.cleanupFiles(files);
        
        throw error;
      }
    }, 'Update facility supervisor');
  }

  static async list(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const params: IFacilitySupervisorQueryParams = {
        keyword: req.query.keyword as string,
        facility_id: req.query.facility_id ? parseInt(req.query.facility_id as string) : undefined,
        portal_access_enabled: req.query.portal_access_enabled === 'true' ? true : req.query.portal_access_enabled === 'false' ? false : undefined,
        sort_by: req.query.sort_by as string,
        sort_order: req.query.sort_order as string,
        ...BaseController.parsePaginationParams(req.query)
      };

      const result = await FacilitySupervisorService.list(params);
      ApiResponseUtility.success(res, result.response, 'Facility Supervisors retrieved successfully', result.pagination);
    }, 'List facility supervisors');
  }

  static async delete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      await FacilitySupervisorService.remove(id);
      ApiResponseUtility.success(res, null, 'Facility Supervisor deleted successfully');
    }, 'Delete facility supervisor');
  }

  static async permanentlyDelete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      await FacilitySupervisorService.permanentlyDelete(id);
      ApiResponseUtility.success(res, null, 'Facility Supervisor permanently deleted');
    }, 'Permanently delete facility supervisor');
  }

  static async bulkUpload(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      if (!req.file) {
        throw new Error('Excel file is required');
      }

      const facilityId = parseInt(req.body.facility_id, 10);
      if (!req.body.facility_id || isNaN(facilityId)) {
        throw new Error('facility_id is required and must be a valid number');
      }

      const result = await FacilitySupervisorService.bulkUpload(req.file.path, facilityId);

      if (result.success) {
        ApiResponseUtility.success(res, result, 'Bulk upload completed successfully');
      } else {
        res.status(400).json({
          success: false,
          message: 'Bulk upload failed - see errors for details',
          data: result
        });
      }
    }, 'Bulk upload facility supervisors');
  }

  static async downloadTemplate(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const buffer = FacilitySupervisorService.generateTemplate();
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=facility_supervisors_template.xlsx');
      res.send(buffer);
    }, 'Download facility supervisors template');
  }

  static async getStudentsByFacility(req: IRequest, res: Response) {
    await BaseController.executeAction(res, async () => {
      const user = req.user;
      if (!user) {
        throw new StringError('Unauthorized');
      }

      if (user.roleID !== 2 && user.roleID !== 3) {
        throw new StringError('Only Facility or Supervisor users can access this endpoint');
      }

      const filters = {
        status: req.query.status as string,
        assignment_status: req.query.assignment_status as string,
        facility_confirmation_status: req.query.facility_confirmation_status as string,
        student_type: req.query.student_type as string,
        search: req.query.search as string,
        facility_id: req.query.facility_id ? (isNaN(Number(req.query.facility_id)) ? req.query.facility_id as string : Number(req.query.facility_id)) : undefined,
        ...BaseController.parsePaginationParams(req.query)
      };

      const result = await PlacementAssignmentService.getStudentsByFacility(user.id, user.roleID, filters);
      ApiResponseUtility.success(res, result.data, 'Students retrieved successfully', result.pagination);
    }, 'Get students by facility');
  }
}
