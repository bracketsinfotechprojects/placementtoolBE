import { Request, Response } from 'express';
import BaseController from '../base.controller';
import FacilitySupervisorComplaintService, { ICreateFacilitySupervisorComplaint, IUpdateFacilitySupervisorComplaint } from '../../services/complaint/facility-supervisor-complaint.service';
import ApiResponseUtility from '../../utilities/api-response.utility';
import { StringError } from '../../errors/string.error';
import * as path from 'path';
import * as fs from 'fs';

export default class FacilitySupervisorComplaintController extends BaseController {
  /**
   * Create a new facility supervisor complaint
   */
  static async create(req: Request, res: Response) {
    // Extract file paths from multer if files were uploaded
    const uploadedFiles: any[] = [];
    const attachments: string[] = [];
    
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file: any) => {
        uploadedFiles.push(file);
        const relativePath = path.relative(process.cwd(), file.path).replace(/\\/g, '/');
        attachments.push(relativePath);
      });
    }

    try {
      await FacilitySupervisorComplaintController.executeAction(res, async () => {
        const facilityId = FacilitySupervisorComplaintController.parseId(req, 'facilityId');

        const complaintData: ICreateFacilitySupervisorComplaint = {
          facility_id: facilityId,
          supervisor_id: req.body.supervisor_id ? parseInt(req.body.supervisor_id, 10) : undefined,
          student_id: parseInt(req.body.student_id, 10),
          student_name: req.body.student_name,
          complaint_type: req.body.complaint_type,
          urgency_level: req.body.urgency_level,
          location: req.body.location,
          description: req.body.description,
          attachments: attachments.length > 0 ? attachments : undefined,
          is_anonymous: req.body.is_anonymous === 'true' || req.body.is_anonymous === true
        };

        const complaint = await FacilitySupervisorComplaintService.create(complaintData);

        console.log('🎉 Facility supervisor complaint created successfully!');
        ApiResponseUtility.createdSuccess(res, complaint, 'Complaint created successfully');
      }, 'Facility supervisor complaint creation failed');
    } catch (error) {
      // Rollback: Delete uploaded files on failure
      console.error('Error creating complaint, rolling back uploaded files:', error);
      uploadedFiles.forEach((file: any) => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
            console.log(`✅ Deleted file on rollback: ${file.path}`);
          }
        } catch (deleteError) {
          console.error(`Failed to delete file ${file.path}:`, deleteError);
        }
      });
      throw error;
    }
  }

  /**
   * Get complaint by ID
   */
  static async getById(req: Request, res: Response) {
    await FacilitySupervisorComplaintController.executeAction(res, async () => {
      const facilityId = FacilitySupervisorComplaintController.parseId(req, 'facilityId');
      const complaintId = FacilitySupervisorComplaintController.parseId(req, 'complaintId');

      const complaint = await FacilitySupervisorComplaintService.getById(complaintId, facilityId);

      ApiResponseUtility.success(res, complaint, 'Complaint retrieved successfully');
    }, 'Failed to retrieve complaint');
  }

  /**
   * Get all complaints for a facility
   */
  static async getByFacilityId(req: Request, res: Response) {
    await FacilitySupervisorComplaintController.executeAction(res, async () => {
      const facilityId = FacilitySupervisorComplaintController.parseId(req, 'facilityId');
      const { limit, page } = FacilitySupervisorComplaintController.parsePaginationParams(req.query);

      const result = await FacilitySupervisorComplaintService.getByFacilityId(facilityId, limit, page);

      ApiResponseUtility.success(res, result.data, 'Complaints retrieved successfully', result.pagination);
    }, 'Failed to retrieve complaints');
  }

  /**
   * Get all complaints by a specific supervisor
   */
  static async getBySupervisorId(req: Request, res: Response) {
    await FacilitySupervisorComplaintController.executeAction(res, async () => {
      const facilityId = FacilitySupervisorComplaintController.parseId(req, 'facilityId');
      const supervisorId = FacilitySupervisorComplaintController.parseId(req, 'supervisorId');
      const { limit, page } = FacilitySupervisorComplaintController.parsePaginationParams(req.query);

      const result = await FacilitySupervisorComplaintService.getBySupervisorId(supervisorId, facilityId, limit, page);

      ApiResponseUtility.success(res, result.data, 'Complaints retrieved successfully', result.pagination);
    }, 'Failed to retrieve complaints');
  }

  /**
   * Update complaint
   */
  static async update(req: Request, res: Response) {
    await FacilitySupervisorComplaintController.executeAction(res, async () => {
      const facilityId = FacilitySupervisorComplaintController.parseId(req, 'facilityId');
      const complaintId = FacilitySupervisorComplaintController.parseId(req, 'complaintId');

      const updateData: IUpdateFacilitySupervisorComplaint = {
        complaint_type: req.body.complaint_type,
        urgency_level: req.body.urgency_level,
        location: req.body.location,
        description: req.body.description,
        status: req.body.status,
        resolution_notes: req.body.resolution_notes,
        resolved_at: req.body.resolved_at ? new Date(req.body.resolved_at) : undefined
      };

      const complaint = await FacilitySupervisorComplaintService.update(complaintId, facilityId, updateData);

      ApiResponseUtility.success(res, complaint, 'Complaint updated successfully');
    }, 'Failed to update complaint');
  }

  /**
   * Delete complaint
   */
  static async delete(req: Request, res: Response) {
    await FacilitySupervisorComplaintController.executeAction(res, async () => {
      const facilityId = FacilitySupervisorComplaintController.parseId(req, 'facilityId');
      const complaintId = FacilitySupervisorComplaintController.parseId(req, 'complaintId');

      const result = await FacilitySupervisorComplaintService.delete(complaintId, facilityId);

      ApiResponseUtility.success(res, result, 'Complaint deleted successfully');
    }, 'Failed to delete complaint');
  }
}
