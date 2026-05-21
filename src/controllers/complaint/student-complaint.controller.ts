import { Request, Response } from 'express';
import BaseController from '../base.controller';
import StudentComplaintService, { ICreateStudentComplaint, IUpdateStudentComplaint } from '../../services/complaint/student-complaint.service';
import ApiResponseUtility from '../../utilities/api-response.utility';
import * as path from 'path';
import * as fs from 'fs';

export default class StudentComplaintController extends BaseController {
  /**
   * Create a new student complaint
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
      await StudentComplaintController.executeAction(res, async () => {
        const studentId = StudentComplaintController.parseId(req, 'studentId');

        const complaintData: ICreateStudentComplaint = {
          student_id: studentId,
          facility_id: req.body.facility_id ? parseInt(req.body.facility_id, 10) : undefined,
          category: req.body.category,
          priority: req.body.priority,
          description: req.body.description,
          location: req.body.location,
          attachments: attachments.length > 0 ? attachments : undefined,
          urgency_level: req.body.urgency_level,
          is_anonymous: req.body.is_anonymous === 'true' || req.body.is_anonymous === true
        };

        const complaint = await StudentComplaintService.create(complaintData);

        console.log('🎉 Student complaint created successfully!');
        ApiResponseUtility.createdSuccess(res, complaint, 'Complaint created successfully');
      }, 'Student complaint creation failed');
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
    await StudentComplaintController.executeAction(res, async () => {
      const studentId = StudentComplaintController.parseId(req, 'studentId');
      const complaintId = StudentComplaintController.parseId(req, 'complaintId');

      const complaint = await StudentComplaintService.getById(complaintId, studentId);

      ApiResponseUtility.success(res, complaint, 'Complaint retrieved successfully');
    }, 'Failed to retrieve complaint');
  }

  /**
   * Get all complaints for a student
   */
  static async getByStudentId(req: Request, res: Response) {
    await StudentComplaintController.executeAction(res, async () => {
      const studentId = StudentComplaintController.parseId(req, 'studentId');
      const { limit, page } = StudentComplaintController.parsePaginationParams(req.query);

      const result = await StudentComplaintService.getByStudentId(studentId, limit, page);

      ApiResponseUtility.success(res, result.data, 'Complaints retrieved successfully', result.pagination);
    }, 'Failed to retrieve complaints');
  }

  /**
   * Update complaint
   */
  static async update(req: Request, res: Response) {
    await StudentComplaintController.executeAction(res, async () => {
      const studentId = StudentComplaintController.parseId(req, 'studentId');
      const complaintId = StudentComplaintController.parseId(req, 'complaintId');

      const updateData: IUpdateStudentComplaint = {
        category: req.body.category,
        priority: req.body.priority,
        description: req.body.description,
        location: req.body.location,
        urgency_level: req.body.urgency_level,
        status: req.body.status,
        resolution_notes: req.body.resolution_notes,
        resolved_at: req.body.resolved_at ? new Date(req.body.resolved_at) : undefined
      };

      const complaint = await StudentComplaintService.update(complaintId, studentId, updateData);

      ApiResponseUtility.success(res, complaint, 'Complaint updated successfully');
    }, 'Failed to update complaint');
  }

  /**
   * Delete complaint
   */
  static async delete(req: Request, res: Response) {
    await StudentComplaintController.executeAction(res, async () => {
      const studentId = StudentComplaintController.parseId(req, 'studentId');
      const complaintId = StudentComplaintController.parseId(req, 'complaintId');

      const result = await StudentComplaintService.delete(complaintId, studentId);

      ApiResponseUtility.success(res, result, 'Complaint deleted successfully');
    }, 'Failed to delete complaint');
  }
}
