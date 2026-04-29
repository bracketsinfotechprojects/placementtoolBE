import { Request, Response } from 'express';
import BaseController from '../base.controller';
import PlacementExecutiveService from '../../services/placement-executive/placement-executive.service';
import ApiResponseUtility from '../../utilities/api-response.utility';
import { IPlacementExecutiveQueryParams } from '../../repositories/placement-executive.repository';
import FileService from '../../services/file/file.service';
import { EntityType, DocumentType } from '../../entities/file/file.entity';

export default class PlacementExecutiveController extends BaseController {
  static async create(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const photographFile = req.file;
      
      // Parse login object from JSON string if received as multipart/form-data
      let bodyData = req.body;
      if (bodyData.login && typeof bodyData.login === 'string') {
        try {
          bodyData.login = JSON.parse(bodyData.login);
        } catch (error) {
          throw new Error('Invalid login JSON format');
        }
      }
      
      // Parse array fields from JSON strings if received as multipart/form-data
      if (bodyData.employment_type && typeof bodyData.employment_type === 'string') {
        try {
          bodyData.employment_type = JSON.parse(bodyData.employment_type);
        } catch (error) {
          // If not valid JSON, split by comma
          bodyData.employment_type = bodyData.employment_type.split(',').map((s: string) => s.trim());
        }
      }
      if (bodyData.facility_types_handled && typeof bodyData.facility_types_handled === 'string') {
        try {
          bodyData.facility_types_handled = JSON.parse(bodyData.facility_types_handled);
        } catch (error) {
          bodyData.facility_types_handled = bodyData.facility_types_handled.split(',').map((s: string) => s.trim());
        }
      }
      
      const executive = await PlacementExecutiveService.create(bodyData, photographFile);
      ApiResponseUtility.createdSuccess(res, executive, 'Placement Executive created successfully');
    }, 'Create placement executive');
  }

  static async getById(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      const executive = await PlacementExecutiveService.getById(id);
      ApiResponseUtility.success(res, executive);
    }, 'Get placement executive by ID');
  }

  static async update(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      
      // Extract photograph file from multer upload
      const photographFile = req.file;
      
      // Parse body data
      let bodyData = req.body;
      
      // Parse array fields from JSON strings if received as multipart/form-data
      if (bodyData.employment_type && typeof bodyData.employment_type === 'string') {
        try {
          bodyData.employment_type = JSON.parse(bodyData.employment_type);
        } catch (error) {
          bodyData.employment_type = bodyData.employment_type.split(',').map((s: string) => s.trim());
        }
      }
      if (bodyData.facility_types_handled && typeof bodyData.facility_types_handled === 'string') {
        try {
          bodyData.facility_types_handled = JSON.parse(bodyData.facility_types_handled);
        } catch (error) {
          bodyData.facility_types_handled = bodyData.facility_types_handled.split(',').map((s: string) => s.trim());
        }
      }
      
      // Helper function to check if value is provided and not empty
      const hasValue = (value: any) => {
        return value !== undefined && value !== null && value !== '';
      };
      
      // Build update data object - only include fields with actual values
      const updateData: any = { id };
      
      if (hasValue(bodyData.full_name)) updateData.full_name = bodyData.full_name;
      if (hasValue(bodyData.mobile_number)) updateData.mobile_number = bodyData.mobile_number;
      if (hasValue(bodyData.email)) updateData.email = bodyData.email;
      if (hasValue(bodyData.joining_date)) updateData.joining_date = bodyData.joining_date;
      if (bodyData.employment_type !== undefined && bodyData.employment_type !== null && bodyData.employment_type !== '') {
        updateData.employment_type = bodyData.employment_type;
      }
      if (bodyData.facility_types_handled !== undefined && bodyData.facility_types_handled !== null && bodyData.facility_types_handled !== '') {
        updateData.facility_types_handled = bodyData.facility_types_handled;
      }
      
      try {
        // Update basic executive data first (without photograph)
        if (Object.keys(updateData).length > 1) { // More than just 'id'
          await PlacementExecutiveService.update(updateData);
        }
        
        // Handle photograph upload if new file is provided
        if (photographFile) {
          // Deactivate old photograph files
          await FileService.deactivateEntityFiles(EntityType.PLACEMENT_EXECUTIVE, id, DocumentType.PHOTOGRAPH);
          
          const fileRecord = await FileService.uploadFile({
            file: photographFile,
            entity_type: EntityType.PLACEMENT_EXECUTIVE,
            entity_id: id,
            doc_type: DocumentType.PHOTOGRAPH
          });
          
          // Update executive with new photograph path
          await PlacementExecutiveService.update({
            id,
            photograph: fileRecord.file_path
          });
        }
        
        // Get the final executive with all updated data
        const executive = await PlacementExecutiveService.getById(id);
        
        ApiResponseUtility.success(res, executive, 'Placement Executive updated successfully');
        
      } catch (error: any) {
        console.error('❌ Error in placement executive update:', error.message);
        throw error;
      }
    }, 'Update placement executive');
  }

  static async list(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const params: IPlacementExecutiveQueryParams = {
        keyword: req.query.keyword as string,
        employment_type: req.query.employment_type as string,
        sort_by: req.query.sort_by as string,
        sort_order: req.query.sort_order as string,
        ...BaseController.parsePaginationParams(req.query)
      };

      const result = await PlacementExecutiveService.list(params);
      ApiResponseUtility.success(res, result.response, 'Placement Executives retrieved successfully', result.pagination);
    }, 'List placement executives');
  }

  static async delete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      await PlacementExecutiveService.remove(id);
      ApiResponseUtility.success(res, null, 'Placement Executive deleted successfully');
    }, 'Delete placement executive');
  }

  static async permanentlyDelete(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const id = BaseController.parseId(req, 'id');
      await PlacementExecutiveService.permanentlyDelete(id);
      ApiResponseUtility.success(res, null, 'Placement Executive permanently deleted');
    }, 'Permanently delete placement executive');
  }

  static async bulkUpload(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      if (!req.file) {
        throw new Error('Excel file is required');
      }

      const result = await PlacementExecutiveService.bulkUpload(req.file.path);

      if (result.success) {
        ApiResponseUtility.success(res, result, 'Bulk upload completed successfully');
      } else {
        res.status(400).json({
          success: false,
          message: 'Bulk upload failed - see errors for details',
          data: result
        });
      }
    }, 'Bulk upload placement executives');
  }

  static async downloadTemplate(req: Request, res: Response) {
    await BaseController.executeAction(res, async () => {
      const buffer = PlacementExecutiveService.generateTemplate();
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=placement_executives_template.xlsx');
      res.send(buffer);
    }, 'Download placement executives template');
  }
}
