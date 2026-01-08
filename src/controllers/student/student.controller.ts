import { Request, Response } from 'express';

// Base
import BaseController from '../base.controller';

// Services
import StudentService from '../../services/student/student.service';

// Utilities
import ApiResponseUtility from '../../utilities/api-response.utility';

// Interfaces
import {
  ICreateStudent,
  IUpdateStudent,
  IStudentQueryParams
} from '../../services/student/student.service';

// Errors
import { StringError } from '../../errors/string.error';

export default class StudentController extends BaseController {
  // Create a new student with all details
  static async create(req: Request, res: Response) {
    await StudentController.executeAction(res, async () => {
      // Extract email from root level or contact details
      const email = req.body.email || req.body.contact_details?.email;

      const studentData: ICreateStudent = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        dob: req.body.dob,
        gender: req.body.gender,
        nationality: req.body.nationality,
        student_type: req.body.student_type || 'domestic',
        status: req.body.status || 'active',
        email: email,
        password: req.body.password,
        
        // Pass all related entities
        contact_details: req.body.contact_details,
        visa_details: req.body.visa_details,
        addresses: req.body.addresses,
        eligibility_status: req.body.eligibility_status,
        student_lifestyle: req.body.student_lifestyle,
        placement_preferences: req.body.placement_preferences,
        facility_records: req.body.facility_records,
        address_change_requests: req.body.address_change_requests,
        job_status_updates: req.body.job_status_updates
      };

      // Create student with all related entities in a single transaction
      const student = await StudentService.create(studentData);

      console.log('🎉 Student created successfully with all related data!');
      ApiResponseUtility.createdSuccess(res, student, 'Student created successfully');
    }, 'Student creation failed');
  }

  // Get student by ID
  static async getById(req: Request, res: Response) {
    await StudentController.executeAction(res, async () => {
      const id = StudentController.parseId(req);
      const student = await StudentService.getById({ id });

      if (!student) {
        throw new StringError('Student not found');
      }

      ApiResponseUtility.success(res, student);
    }, 'Failed to retrieve student');
  }

  // Get detailed student information
  static async detail(req: Request, res: Response) {
    await StudentController.executeAction(res, async () => {
      const id = StudentController.parseId(req);
      const student = await StudentService.detail({ id });
      ApiResponseUtility.success(res, student);
    }, 'Failed to retrieve student details');
  }

  // Update student information
  static async update(req: Request, res: Response) {
    await StudentController.executeAction(res, async () => {
      const id = StudentController.parseId(req, 'student_id');

      const updateData: IUpdateStudent = {
        student_id: id,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        dob: req.body.dob,
        gender: req.body.gender,
        nationality: req.body.nationality,
        student_type: req.body.student_type,
        status: req.body.status
      };

      const updatedStudent = await StudentService.update(updateData);
      ApiResponseUtility.success(res, updatedStudent, 'Student updated successfully');
    }, 'Failed to update student');
  }

  // List students with filtering and pagination
  static async list(req: Request, res: Response) {
    await StudentController.executeAction(res, async () => {
      const pagination = StudentController.parsePaginationParams(req.query);

      const queryParams: IStudentQueryParams = {
        keyword: req.query.keyword as string,
        status: req.query.status as string,
        student_type: req.query.student_type as string,
        nationality: req.query.nationality as string,
        min_age: req.query.min_age ? parseInt(req.query.min_age as string, 10) : undefined,
        max_age: req.query.max_age ? parseInt(req.query.max_age as string, 10) : undefined,
        created_from: req.query.created_from as string,
        created_to: req.query.created_to as string,
        sort_by: req.query.sort_by as string,
        sort_order: req.query.sort_order as string,
        ...pagination
      };

      const result = await StudentService.list(queryParams);
      ApiResponseUtility.success(res, result.response, 'Students retrieved successfully', result.pagination);
    }, 'Failed to retrieve students');
  }

  // Delete student (soft delete)
  static async delete(req: Request, res: Response) {
    await StudentController.executeAction(res, async () => {
      const id = StudentController.parseId(req);
      await StudentService.remove({ id });
      ApiResponseUtility.success(res, null, 'Student deleted successfully');
    }, 'Failed to delete student');
  }

  // Permanently delete student
  static async permanentlyDelete(req: Request, res: Response) {
    await StudentController.executeAction(res, async () => {
      const id = StudentController.parseId(req);
      await StudentService.permanentlyDelete({ id });
      ApiResponseUtility.success(res, null, 'Student permanently deleted');
    }, 'Failed to permanently delete student');
  }

  // Get student statistics
  static async getStatistics(req: Request, res: Response) {
    await StudentController.executeAction(res, async () => {
      const statistics = await StudentService.getStatistics();
      ApiResponseUtility.success(res, statistics);
    }, 'Failed to retrieve statistics');
  }

  // Bulk update student status
  static async bulkUpdateStatus(req: Request, res: Response) {
    await StudentController.executeAction(res, async () => {
      const { student_ids, status } = req.body;

      StudentController.validateRequiredFields(req.body, ['student_ids', 'status']);

      if (!Array.isArray(student_ids) || student_ids.length === 0) {
        throw new StringError('Student IDs must be a non-empty array');
      }

      const result = await StudentService.bulkUpdateStatus(student_ids, status);
      ApiResponseUtility.success(res, result, 'Student statuses updated successfully');
    }, 'Failed to bulk update student statuses');
  }

  // Advanced search for students
  static async advancedSearch(req: Request, res: Response) {
    await StudentController.executeAction(res, async () => {
      const pagination = StudentController.parsePaginationParams(req.query);

      const searchParams = {
        name: req.query.name as string,
        nationality: req.query.nationality as string,
        student_type: req.query.student_type as string,
        status: req.query.status as string,
        min_age: req.query.min_age ? parseInt(req.query.min_age as string, 10) : undefined,
        max_age: req.query.max_age ? parseInt(req.query.max_age as string, 10) : undefined,
        has_visa: req.query.has_visa ? req.query.has_visa === 'true' : undefined,
        ...pagination
      };

      const result = await StudentService.advancedSearch(searchParams);
      ApiResponseUtility.success(res, result.response, 'Students retrieved successfully', result.pagination);
    }, 'Failed to perform advanced search');
  }

  // Get student details with user account
  static async getWithUserDetails(req: Request, res: Response) {
    await StudentController.executeAction(res, async () => {
      const id = StudentController.parseId(req);
      const result = await StudentService.getWithUserDetails(id);
      ApiResponseUtility.success(res, result, 'Student details with user account retrieved successfully');
    }, 'Failed to retrieve student with user details');
  }

  // Get all student details (comprehensive view)
  static async getAllDetails(req: Request, res: Response) {
    await StudentController.executeAction(res, async () => {
      const id = StudentController.parseId(req);
      const student = await StudentService.getAllDetails({ id });
      ApiResponseUtility.success(res, student, 'Student all details retrieved successfully');
    }, 'Failed to retrieve all student details');
  }
}