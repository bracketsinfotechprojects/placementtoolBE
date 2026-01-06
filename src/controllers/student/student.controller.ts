import { Request, Response } from 'express';
import { getRepository } from 'typeorm';

// Entities
import { Student } from '../../entities/student/student.entity';
import { ContactDetails } from '../../entities/student/contact-details.entity';
import { VisaDetails } from '../../entities/student/visa-details.entity';
import { Address } from '../../entities/student/address.entity';
import { EligibilityStatus } from '../../entities/student/eligibility-status.entity';
import { StudentLifestyle } from '../../entities/student/student-lifestyle.entity';
import { PlacementPreferences } from '../../entities/student/placement-preferences.entity';
import { FacilityRecords } from '../../entities/student/facility-records.entity';
import { User } from '../../entities/user/user.entity';

import { AddressChangeRequest } from '../../entities/student/address-change-request.entity';
import { JobStatusUpdate } from '../../entities/student/job-status-update.entity';
import StudentService from '../../services/student/student.service';

// Utilities
import ApiResponseUtility from '../../utilities/api-response.utility';

// Database
import DatabaseManager from '../../database/database.manager';

import { 
  ICreateStudent, 
  IUpdateStudent, 
  IStudentQueryParams,
  ICreateContactDetails,
  ICreateVisaDetails,
  ICreateAddress,
  ICreateEligibilityStatus,
  ICreateStudentLifestyle,
  ICreatePlacementPreferences,
  ICreateFacilityRecords,
  ICreateAddressChangeRequest,
  ICreateJobStatusUpdate
} from '../../services/student/student.service';

// Errors
import { StringError } from '../../errors/string.error';

export default class StudentController {
  // Create a new student with all details
  static async create(req: Request, res: Response) {
    try {
      // Extract email from contact details if provided
      let email: string | undefined;
      if (req.body.contact_details && req.body.contact_details.email) {
        email = req.body.contact_details.email;
        console.log('📧 Email extracted from contact_details:', email);
      } else {
        console.log('⚠️ No email found in contact_details');
      }

      console.log('📝 Student creation request data:', {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: email,
        contact_details: req.body.contact_details
      });

      const studentData: ICreateStudent = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        dob: req.body.dob,
        gender: req.body.gender,
        nationality: req.body.nationality,
        student_type: req.body.student_type || 'domestic',
        status: req.body.status || 'active',
        email: email, // Pass email for automatic user creation
        password: req.body.password // Pass password for user account
      };

      console.log('📝 Student data prepared for service:', studentData);

      const student = await StudentService.create(studentData);
      
      // Create contact details if provided (separate from main transaction for flexibility)
      if (req.body.contact_details) {
        const contactData: ICreateContactDetails = {
          ...req.body.contact_details,
          student: { student_id: student.student_id }
        };
        await getRepository(ContactDetails).save(contactData);
        console.log('✅ Contact details created');
      }

      // Create visa details if provided
      if (req.body.visa_details) {
        const visaData: ICreateVisaDetails = {
          ...req.body.visa_details,
          student: { student_id: student.student_id }
        };
        await getRepository(VisaDetails).save(visaData);
        console.log('✅ Visa details created');
      }

      // Create addresses if provided
      if (req.body.addresses && req.body.addresses.length > 0) {
        for (const addressData of req.body.addresses) {
          await getRepository(Address).save({
            ...addressData,
            student: { student_id: student.student_id }
          });
        }
        console.log('✅ Addresses created');
      }

      // Create eligibility status if provided
      if (req.body.eligibility_status) {
        const eligibilityData: ICreateEligibilityStatus = {
          ...req.body.eligibility_status,
          student: { student_id: student.student_id }
        };
        await getRepository(EligibilityStatus).save(eligibilityData);
        console.log('✅ Eligibility status created');
      }

      // Create student lifestyle if provided
      if (req.body.student_lifestyle) {
        const lifestyleData: ICreateStudentLifestyle = {
          ...req.body.student_lifestyle,
          student: { student_id: student.student_id }
        };
        await getRepository(StudentLifestyle).save(lifestyleData);
        console.log('✅ Student lifestyle created');
      }

      // Create placement preferences if provided
      if (req.body.placement_preferences) {
        const placementData: ICreatePlacementPreferences = {
          ...req.body.placement_preferences,
          student: { student_id: student.student_id }
        };
        await getRepository(PlacementPreferences).save(placementData);
        console.log('✅ Placement preferences created');
      }

      // Create facility records if provided
      if (req.body.facility_records && req.body.facility_records.length > 0) {
        for (const facilityData of req.body.facility_records) {
          await getRepository(FacilityRecords).save({
            ...facilityData,
            student: { student_id: student.student_id }
          });
        }
        console.log('✅ Facility records created');
      }

      // Create address change requests if provided
      if (req.body.address_change_requests && req.body.address_change_requests.length > 0) {
        for (const addressChangeData of req.body.address_change_requests) {
          await getRepository(AddressChangeRequest).save({
            ...addressChangeData,
            student: { student_id: student.student_id }
          });
        }
        console.log('✅ Address change requests created');
      }

      // Create job status updates if provided
      if (req.body.job_status_updates && req.body.job_status_updates.length > 0) {
        for (const jobStatusData of req.body.job_status_updates) {
          await getRepository(JobStatusUpdate).save({
            ...jobStatusData,
            student: { student_id: student.student_id }
          });
        }
        console.log('✅ Job status updates created');
      }

      // Fetch complete student data with relations
      const completeStudent = await StudentService.getById({ id: student.student_id });

      console.log('🎉 Complete student creation finished successfully!');
      ApiResponseUtility.createdSuccess(res, completeStudent, 'Student created successfully');
    } catch (error) {
      console.error('❌ Student creation failed:', error.message);
      if (error instanceof StringError) {
        ApiResponseUtility.badRequest(res, error.message);
      } else {
        ApiResponseUtility.serverError(res, error.message);
      }
    }
  }

  // Get student by ID
  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        ApiResponseUtility.badRequest(res, 'Invalid student ID');
        return;
      }

      const student = await StudentService.getById({ id });
      if (!student) {
        ApiResponseUtility.notFound(res, 'Student not found');
        return;
      }

      ApiResponseUtility.success(res, student);
    } catch (error) {
      ApiResponseUtility.serverError(res, error.message);
    }
  }

  // Get detailed student information
  static async detail(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        ApiResponseUtility.badRequest(res, 'Invalid student ID');
        return;
      }

      const student = await StudentService.detail({ id });
      ApiResponseUtility.success(res, student);
    } catch (error) {
      if (error instanceof StringError) {
        ApiResponseUtility.notFound(res, error.message);
      } else {
        ApiResponseUtility.serverError(res, error.message);
      }
    }
  }

  // Update student information
  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.student_id, 10);
      if (isNaN(id)) {
        ApiResponseUtility.badRequest(res, 'Invalid student ID');
        return;
      }

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
    } catch (error) {
      if (error instanceof StringError) {
        ApiResponseUtility.badRequest(res, error.message);
      } else {
        ApiResponseUtility.serverError(res, error.message);
      }
    }
  }

  // List students with filtering and pagination
  static async list(req: Request, res: Response) {
    try {
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
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1
      };

      const result = await StudentService.list(queryParams);
      ApiResponseUtility.success(res, result.response, 'Students retrieved successfully', result.pagination);
    } catch (error) {
      ApiResponseUtility.serverError(res, error.message);
    }
  }

  // Delete student (soft delete)
  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        ApiResponseUtility.badRequest(res, 'Invalid student ID');
        return;
      }

      await StudentService.remove({ id });
      ApiResponseUtility.success(res, null, 'Student deleted successfully');
    } catch (error) {
      if (error instanceof StringError) {
        ApiResponseUtility.badRequest(res, error.message);
      } else {
        ApiResponseUtility.serverError(res, error.message);
      }
    }
  }

  // Permanently delete student and all related data
  static async permanentlyDelete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        ApiResponseUtility.badRequest(res, 'Invalid student ID');
        return;
      }

      await StudentService.permanentlyDelete({ id });
      ApiResponseUtility.success(res, null, 'Student permanently deleted');
    } catch (error) {
      if (error instanceof StringError) {
        ApiResponseUtility.badRequest(res, error.message);
      } else {
        ApiResponseUtility.serverError(res, error.message);
      }
    }
  }

  // Get student statistics
  static async getStatistics(req: Request, res: Response) {
    try {
      const statistics = await StudentService.getStatistics();
      ApiResponseUtility.success(res, statistics);
    } catch (error) {
      ApiResponseUtility.serverError(res, error.message);
    }
  }

  // Bulk update student status
  static async bulkUpdateStatus(req: Request, res: Response) {
    try {
      const { student_ids, status } = req.body;

      if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
        ApiResponseUtility.badRequest(res, 'Student IDs array is required');
        return;
      }

      if (!status) {
        ApiResponseUtility.badRequest(res, 'Status is required');
        return;
      }

      const result = await StudentService.bulkUpdateStatus(student_ids, status);
      ApiResponseUtility.success(res, result, 'Student statuses updated successfully');
    } catch (error) {
      if (error instanceof StringError) {
        ApiResponseUtility.badRequest(res, error.message);
      } else {
        ApiResponseUtility.serverError(res, error.message);
      }
    }
  }

  // Advanced search for students
  static async advancedSearch(req: Request, res: Response) {
    try {
      const searchParams = {
        name: req.query.name as string,
        nationality: req.query.nationality as string,
        student_type: req.query.student_type as string,
        status: req.query.status as string,
        min_age: req.query.min_age ? parseInt(req.query.min_age as string, 10) : undefined,
        max_age: req.query.max_age ? parseInt(req.query.max_age as string, 10) : undefined,
        has_visa: req.query.has_visa ? req.query.has_visa === 'true' : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1
      };

      const result = await StudentService.advancedSearch(searchParams);
      ApiResponseUtility.success(res, result.response, 'Students retrieved successfully', result.pagination);
    } catch (error) {
      ApiResponseUtility.serverError(res, error.message);
    }
  }

  // Get student details with user account and role information
  static async getWithUserDetails(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        ApiResponseUtility.badRequest(res, 'Invalid student ID');
        return;
      }

      const student = await StudentService.getById({ id });
      if (!student) {
        ApiResponseUtility.notFound(res, 'Student not found');
        return;
      }

      // Get associated user account information if student has email
      let userDetails = null;
      if (student.contact_details && student.contact_details.length > 0) {
        const primaryEmail = student.contact_details.find(cd => cd.email)?.email;
        if (primaryEmail) {
          try {
            // Find user by loginID (email)
            const user = await getRepository(User).findOne({
              where: { loginID: primaryEmail }
            });
            
            if (user) {
              // Get role name from roleID
              const roles = await getRepository(User).manager.connection.query(
                'SELECT role_name FROM roles WHERE role_id = ?',
                [user.roleID]
              );
              
              userDetails = {
                id: user.id,
                loginID: user.loginID,
                roleID: user.roleID,
                roleName: roles && roles.length > 0 ? roles[0].role_name : null,
                status: user.status,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
              };
            }
          } catch (userError) {
            console.log('⚠️ Could not fetch user details for student:', userError.message);
          }
        }
      }

      // Combine student and user data
      const result = {
        ...student,
        user_account: userDetails
      };

      ApiResponseUtility.success(res, result, 'Student details with user account retrieved successfully');
    } catch (error) {
      ApiResponseUtility.serverError(res, error.message);
    }
  }

  // Get all student details except password (comprehensive view)
  static async getAllDetails(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        ApiResponseUtility.badRequest(res, 'Invalid student ID');
        return;
      }

      const student = await StudentService.getAllDetails({ id });
      if (!student) {
        ApiResponseUtility.notFound(res, 'Student not found');
        return;
      }

      ApiResponseUtility.success(res, student, 'Student all details retrieved successfully (password excluded)');
    } catch (error) {
      if (error instanceof StringError) {
        ApiResponseUtility.notFound(res, error.message);
      } else {
        ApiResponseUtility.serverError(res, error.message);
      }
    }
  }
}