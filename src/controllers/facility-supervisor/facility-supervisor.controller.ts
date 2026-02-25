import { Request, Response } from 'express';
import BaseController from '../base.controller';
import FacilitySupervisorService from '../../services/facility-supervisor/facility-supervisor.service';
import ApiResponseUtility from '../../utilities/api-response.utility';
import { IFacilitySupervisorQueryParams } from '../../repositories/facility-supervisor.repository';
import FileService from '../../services/file/file.service';
import { EntityType, DocumentType } from '../../entities/file/file.entity';
import * as fs from 'fs';

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
      const supervisor = await FacilitySupervisorService.update({ id, ...req.body });
      ApiResponseUtility.success(res, supervisor, 'Facility Supervisor updated successfully');
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
}
