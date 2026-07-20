import { Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { CourseAssignment, AttendanceStatus } from '../../entities/course-assignment/course-assignment.entity';
import { CourseSlots } from '../../entities/course-slots/course-slots.entity';
import { Certificate } from '../../entities/certificate/certificate.entity';
import { AssignmentType } from '../../entities/certificate/certificate.entity';
import { Student } from '../../entities/student/student.entity';
import { ContactDetails } from '../../entities/student/contact-details.entity';
import EmailUtility from '../../utilities/email.utility';
import IRequest from '../../interfaces/IRequest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Ensure uploads/certificates directory exists
 * Creates it recursively if it doesn't exist
 */
const ensureUploadsDir = () => {
  try {
    const uploadsDir = path.join(__dirname, '../../../uploads/certificates');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log(`✅ Created certificates directory: ${uploadsDir}`);
    }
    
    return uploadsDir;
  } catch (error: any) {
    console.error(`❌ Error creating certificates directory:`, error.message);
    throw new Error(`Failed to create uploads directory: ${error.message}`);
  }
};

/**
 * Get the certificates upload directory path
 */
const getCertificatesDir = (): string => {
  try {
    return ensureUploadsDir();
  } catch (error: any) {
    console.error('Failed to get certificates directory:', error);
    throw error;
  }
};

export class CourseAttendanceController {

  /**
   * Update student attendance status (present/absent/late/etc)
   * PUT /api/course-attendance/:assignmentId
   */
  static async updateAttendance(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { assignmentId } = req.params;
      const { attendance_status, attendance_date, trainer_notes } = req.body;
      const trainerId = req.user?.id || (req.user as any)?.userID;

      // Validate input
      if (!assignmentId) {
        return res.status(400).json({
          success: false,
          message: 'Assignment ID is required'
        });
      }

      if (!attendance_status) {
        return res.status(400).json({
          success: false,
          message: 'Attendance status is required'
        });
      }

      // Validate attendance status
      const validStatuses = Object.values(AttendanceStatus);
      if (!validStatuses.includes(attendance_status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid attendance status. Valid values: ${validStatuses.join(', ')}`
        });
      }

      // Get course assignment
      const courseAssignmentRepo = getRepository(CourseAssignment);
      const assignment = await courseAssignmentRepo.findOne({
        where: { assignment_id: parseInt(assignmentId) }
      });

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Course assignment not found'
        });
      }

      // Verify trainer authorization - trainer must be assigned to this course
      if (assignment.trainer_id !== trainerId) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to mark attendance for this course'
        });
      }

      // Update attendance
      assignment.attendance_status = attendance_status;
      assignment.attendance_date = attendance_date ? new Date(attendance_date) : new Date();
      assignment.trainer_notes = trainer_notes || null;
      assignment.attendance_updated_at = new Date();

      await courseAssignmentRepo.save(assignment);

      return res.status(200).json({
        success: true,
        message: 'Attendance updated successfully',
        data: {
          assignment_id: assignment.assignment_id,
          student_id: assignment.student_id,
          course_id: assignment.course_id,
          trainer_id: assignment.trainer_id,
          attendance_status: assignment.attendance_status,
          attendance_date: assignment.attendance_date,
          trainer_notes: assignment.trainer_notes,
          attendance_updated_at: assignment.attendance_updated_at
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk update attendance for multiple students
   * PUT /api/course-attendance/bulk
   */
  static async bulkUpdateAttendance(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { records } = req.body;
      const trainerId = req.user?.id || (req.user as any)?.userID;

      if (!records || !Array.isArray(records) || records.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Records array is required and must not be empty'
        });
      }

      const courseAssignmentRepo = getRepository(CourseAssignment);
      const results = {
        total: records.length,
        successful: 0,
        failed: 0,
        errors: [] as any[]
      };

      for (let i = 0; i < records.length; i++) {
        const { assignment_id, attendance_status, attendance_date, trainer_notes } = records[i];

        // Validate record
        if (!assignment_id || !attendance_status) {
          results.failed++;
          results.errors.push({
            index: i,
            message: 'assignment_id and attendance_status are required'
          });
          continue;
        }

        // Validate status
        const validStatuses = Object.values(AttendanceStatus);
        if (!validStatuses.includes(attendance_status)) {
          results.failed++;
          results.errors.push({
            index: i,
            message: `Invalid status. Valid values: ${validStatuses.join(', ')}`
          });
          continue;
        }

        try {
          const assignment = await courseAssignmentRepo.findOne({
            where: { assignment_id: parseInt(assignment_id) }
          });

          if (!assignment) {
            results.failed++;
            results.errors.push({
              index: i,
              message: 'Assignment not found'
            });
            continue;
          }

          // Verify trainer authorization
          if (assignment.trainer_id !== trainerId) {
            results.failed++;
            results.errors.push({
              index: i,
              message: 'Not authorized to mark this assignment'
            });
            continue;
          }

          // Update attendance
          assignment.attendance_status = attendance_status;
          assignment.attendance_date = attendance_date ? new Date(attendance_date) : new Date();
          assignment.trainer_notes = trainer_notes || null;
          assignment.attendance_updated_at = new Date();

          await courseAssignmentRepo.save(assignment);
          results.successful++;

        } catch (err) {
          results.failed++;
          results.errors.push({
            index: i,
            message: err.message
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Bulk attendance update completed',
        data: results
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload certificate
   * POST /api/certificates/upload
   */
  static async uploadCertificate(req: IRequest, res: Response, next: NextFunction) {
    try {
      // Ensure upload directory exists before processing
      try {
        ensureUploadsDir();
      } catch (dirError: any) {
        return res.status(500).json({
          success: false,
          message: 'Failed to prepare upload directory',
          error: dirError.message
        });
      }

      const { student_id, assignment_id, assignment_type } = req.body;
      const userId = req.user?.id || (req.user as any)?.userID;
      const userRole = (req.user as any)?.role || (req.user as any)?.roleID;
      const file = req.file;

      console.log(`Certificate upload - Student: ${student_id}, Assignment: ${assignment_id}, Type: ${assignment_type}, User ID: ${userId}, Role: ${userRole}`);

      // Validate inputs
      if (!student_id || !assignment_id || !assignment_type || !file) {
        // Clean up file if exists
        if (file && fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (e) {
            // Ignore cleanup errors
          }
        }
        
        return res.status(400).json({
          success: false,
          message: 'student_id, assignment_id, assignment_type, and file are required'
        });
      }

      // Validate assignment type
      if (!['course', 'placement'].includes(assignment_type)) {
        // Clean up file
        if (file && fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (e) {
            // Ignore cleanup errors
          }
        }
        
        return res.status(400).json({
          success: false,
          message: 'Invalid assignment_type. Must be "course" or "placement"'
        });
      }

      // Authorization check
      // Allowed roles for uploading certificates:
      // 1 = Admin
      // 2 = Facility User
      // 3 = Facility Supervisor
      // 4 = Placement Executive (if trainer)
      // 5 = Trainer
      const allowedRoles = [1, 2, 3, 4, 5]; // Admin, Facility User, Facility Supervisor, Placement Executive, Trainer
      
      if (!allowedRoles.includes(userRole)) {
        // Clean up file
        if (file && fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (e) {
            // Ignore cleanup errors
          }
        }
        
        console.log(`Unauthorized certificate upload attempt - User role: ${userRole}`);
        return res.status(403).json({
          success: false,
          message: 'Only Admin, Facility Users, Facility Supervisors, Placement Executives, and Trainers can upload certificates'
        });
      }

      // Verify file actually exists and is accessible
      if (!file || !fs.existsSync(file.path)) {
        return res.status(500).json({
          success: false,
          message: 'Uploaded file not found or not accessible'
        });
      }

      const certificateRepo = getRepository(Certificate);

      // Create certificate record
      const certificate = new Certificate();
      certificate.student_id = parseInt(student_id);
      certificate.assignment_id = parseInt(assignment_id);
      certificate.assignment_type = assignment_type;
      certificate.certificate_file_path = file.path; // Store full path
      certificate.created_by_user_id = userId;
      certificate.created_at = new Date();
      certificate.is_deleted = false;

      const saved = await certificateRepo.save(certificate);

      console.log(`Certificate uploaded successfully - ID: ${saved.certificate_id}, Student: ${student_id}, by User: ${userId}`);

      // Email the certificate to the student as an attachment
      const student = await getRepository(Student).findOne({ where: { student_id: saved.student_id, isDeleted: false } });
      if (student) {
        const studentContact = await getRepository(ContactDetails).findOne({
          where: { student_id: student.student_id, is_primary: true }
        }) || await getRepository(ContactDetails).findOne({ where: { student_id: student.student_id } });

        if (studentContact?.email) {
          let certificateName = 'Placement Certificate';
          if (saved.assignment_type === AssignmentType.COURSE) {
            const courseAssignment = await getRepository(CourseAssignment).findOne({ where: { assignment_id: saved.assignment_id } });
            if (courseAssignment) {
              const courseSlot = await getRepository(CourseSlots).findOne({ where: { course_id: courseAssignment.course_id } });
              certificateName = courseSlot?.course_name || 'Workshop Certificate';
            }
          }

          EmailUtility.sendCertificateEmail(
            studentContact.email,
            student.fullName,
            certificateName,
            file.path,
            file.originalname
          ).catch(() => {});
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Certificate uploaded successfully',
        data: {
          certificate_id: saved.certificate_id,
          student_id: saved.student_id,
          assignment_id: saved.assignment_id,
          assignment_type: saved.assignment_type,
          certificate_file_path: saved.certificate_file_path,
          created_at: saved.created_at,
          created_by_user_id: saved.created_by_user_id
        }
      });

    } catch (error) {
      console.error('Certificate upload error:', error);
      
      // Clean up uploaded file on error
      if (req.file) {
        try {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
            console.log(`Cleaned up file: ${req.file.path}`);
          }
        } catch (e) {
          console.error('Error cleaning up file:', e);
        }
      }
      
      next(error);
    }
  }

  /**
   * Download certificate
   * GET /api/certificates/:certificateId/download
   */
  static async downloadCertificate(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { certificateId } = req.params;
      const userRole = (req.user as any)?.role || (req.user as any)?.roleID;

      if (!certificateId) {
        return res.status(400).json({
          success: false,
          message: 'Certificate ID is required'
        });
      }

      const certificateRepo = getRepository(Certificate);
      const certificate = await certificateRepo.findOne({
        where: { 
          certificate_id: parseInt(certificateId),
          is_deleted: false
        },
        relations: ['student']
      });

      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: 'Certificate not found'
        });
      }

      // Authorization check: 
      // Admin (roleID 1) can download any certificate
      // For non-admin users, allow download (assumes API will be called by authorized users)
      const isAdmin = userRole === 1 || userRole === 'admin';
      
      if (!isAdmin) {
        // For non-admin users, we allow download (the API endpoint is protected by JWT auth)
        // Additional validation can be added here if needed
        console.log(`Certificate download request - Certificate student_id: ${certificate.student_id}, User role: ${userRole}`);
      }

      // Resolve the file path - handle both relative and absolute paths
      let filePath = certificate.certificate_file_path;
      if (!path.isAbsolute(filePath)) {
        filePath = path.join(__dirname, '../../../', filePath);
      }

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Certificate file not found on server'
        });
      }

      // Download file
      const fileName = `certificate_${certificate.certificate_id}_${Date.now()}${path.extname(filePath)}`;
      res.download(filePath, fileName, (err) => {
        if (err && !res.headersSent) {
          return res.status(500).json({
            success: false,
            message: 'Error downloading certificate'
          });
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get certificate details
   * GET /api/certificates/:certificateId
   */
  static async getCertificate(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { certificateId } = req.params;
      const userRole = (req.user as any)?.role || (req.user as any)?.roleID;

      if (!certificateId) {
        return res.status(400).json({
          success: false,
          message: 'Certificate ID is required'
        });
      }

      const certificateRepo = getRepository(Certificate);
      const certificate = await certificateRepo.findOne({
        where: { 
          certificate_id: parseInt(certificateId),
          is_deleted: false
        },
        relations: ['student', 'created_by']
      });

      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: 'Certificate not found'
        });
      }

      // Authorization check: Admin or authorized staff can view
      // Only admin (roleID 1) can view any certificate
      // For now, we allow any authenticated user to view (can be restricted further)
      const isAdmin = userRole === 1 || userRole === 'admin';
      
      if (!isAdmin) {
        // Non-admin users can still view (authenticated users)
        console.log(`Certificate details viewed by user role: ${userRole}`);
      }

      // Sanitize response to exclude sensitive data
      const sanitized: any = {
        certificate_id: certificate.certificate_id,
        student_id: certificate.student_id,
        assignment_type: certificate.assignment_type,
        assignment_id: certificate.assignment_id,
        certificate_file_path: certificate.certificate_file_path,
        created_at: certificate.created_at,
        created_by_user_id: certificate.created_by_user_id,
        is_deleted: certificate.is_deleted
      };

      // Add created_by info WITHOUT sensitive fields like password
      if ((certificate as any).created_by) {
        sanitized.created_by = {
          id: (certificate as any).created_by.id,
          loginID: (certificate as any).created_by.loginID
          // Exclude password, token, and other sensitive fields
        };
      }

      // Add student info WITHOUT sensitive fields
      if ((certificate as any).student) {
        sanitized.student = {
          student_id: (certificate as any).student.student_id,
          first_name: (certificate as any).student.first_name,
          last_name: (certificate as any).student.last_name
          // Exclude sensitive student data
        };
      }

      return res.status(200).json({
        success: true,
        message: 'Certificate retrieved successfully',
        data: sanitized
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * List certificates for a student
   * GET /api/certificates/student/:studentId
   */
  static async listStudentCertificates(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.params;
      const { limit = 10, page = 1 } = req.query;

      if (!studentId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID is required'
        });
      }

      const certificateRepo = getRepository(Certificate);
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const [certificates, total] = await certificateRepo.findAndCount({
        where: {
          student_id: parseInt(studentId),
          is_deleted: false
        },
        relations: ['student', 'created_by'],
        order: { created_at: 'DESC' },
        take: parseInt(limit as string),
        skip
      });

      // Sanitize sensitive data from response
      const sanitizedCertificates = certificates.map((cert: any) => {
        const sanitized: any = {
          certificate_id: cert.certificate_id,
          student_id: cert.student_id,
          assignment_type: cert.assignment_type,
          assignment_id: cert.assignment_id,
          certificate_file_path: cert.certificate_file_path,
          created_at: cert.created_at,
          created_by_user_id: cert.created_by_user_id,
          is_deleted: cert.is_deleted
        };

        // Add created_by info WITHOUT sensitive fields
        if (cert.created_by) {
          sanitized.created_by = {
            id: cert.created_by.id,
            loginID: cert.created_by.loginID,
            // Exclude password, token, and other sensitive fields
          };
        }

        // Add student info WITHOUT sensitive fields
        if (cert.student) {
          sanitized.student = {
            student_id: cert.student.student_id,
            first_name: cert.student.first_name,
            last_name: cert.student.last_name,
            email: cert.student.contact_details?.[0]?.email || null
            // Exclude sensitive student data
          };
        }

        return sanitized;
      });

      return res.status(200).json({
        success: true,
        message: 'Certificates retrieved successfully',
        data: sanitizedCertificates,
        pagination: {
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          pages: Math.ceil(total / parseInt(limit as string))
        }
      });

    } catch (error) {
      next(error);
    }
  }
}
