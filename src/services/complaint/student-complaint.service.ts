import { getRepository } from 'typeorm';
import { StudentComplaint } from '../../entities/complaint/student-complaint.entity';
import { Student } from '../../entities/student/student.entity';
import { Facility } from '../../entities/facility/facility.entity';
import TransactionUtility from '../../utilities/transaction.utility';
import ApiUtility from '../../utilities/api.utility';
import { StringError } from '../../errors/string.error';
import { MoreThan } from 'typeorm';

export interface ICreateStudentComplaint {
  student_id: number;
  facility_id?: number;
  category: string;
  priority: string;
  description: string;
  location: string;
  attachments?: string[];
  urgency_level: string;
  is_anonymous: boolean;
}

export interface IUpdateStudentComplaint {
  category?: string;
  priority?: string;
  description?: string;
  location?: string;
  urgency_level?: string;
  status?: string;
  resolution_notes?: string;
  resolved_at?: Date;
}

export default class StudentComplaintService {
  /**
   * Create a new student complaint
   */
  static async create(params: ICreateStudentComplaint) {
    return await TransactionUtility.executeInTransaction(async (queryRunner) => {
      // Verify student exists
      const student = await queryRunner.manager.findOne(Student, {
        where: { student_id: params.student_id, isDeleted: false }
      });

      if (!student) {
        throw new StringError('Student not found');
      }

      // Verify facility exists if provided
      if (params.facility_id) {
        const facility = await queryRunner.manager.findOne(Facility, {
          where: { facility_id: params.facility_id, isDeleted: false }
        });

        if (!facility) {
          throw new StringError('Facility not found');
        }
      }

      // Check for duplicate complaints within the last 5 minutes
      // (same student, facility, category, and description)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentDuplicate = await queryRunner.manager.findOne(StudentComplaint, {
        where: {
          student_id: params.student_id,
          facility_id: params.facility_id || null,
          category: params.category,
          description: params.description,
          isDeleted: false,
          createdAt: MoreThan(fiveMinutesAgo)
        }
      });

      if (recentDuplicate) {
        throw new StringError('A similar complaint was already submitted recently. Please wait before submitting another complaint.');
      }

      // Create complaint
      const complaint = new StudentComplaint();
      complaint.student_id = params.student_id;
      complaint.facility_id = params.facility_id || null;
      complaint.category = params.category;
      complaint.priority = params.priority;
      complaint.description = params.description;
      complaint.location = params.location;
      complaint.attachments = params.attachments || [];
      complaint.urgency_level = params.urgency_level;
      complaint.is_anonymous = params.is_anonymous;
      complaint.status = 'Pending';

      const savedComplaint = await queryRunner.manager.save(StudentComplaint, complaint);

      console.log(`✅ Student complaint created successfully with ID: ${savedComplaint.complaint_id}`);

      // Sanitize response based on is_anonymous flag
      return this.sanitizeComplaintResponse(savedComplaint);
    });
  }

  /**
   * Get complaint by ID
   */
  static async getById(complaintId: number, studentId: number) {
    const complaint = await getRepository(StudentComplaint).findOne({
      where: {
        complaint_id: complaintId,
        student_id: studentId,
        isDeleted: false
      },
      relations: ['student', 'facility']
    });

    if (!complaint) {
      throw new StringError('Complaint not found');
    }

    return this.sanitizeComplaintResponse(complaint);
  }

  /**
   * Get all complaints for a student
   */
  static async getByStudentId(studentId: number, limit: number = 20, page: number = 1) {
    const skip = (page - 1) * limit;

    const [complaints, total] = await getRepository(StudentComplaint).findAndCount({
      where: {
        student_id: studentId,
        isDeleted: false
      },
      relations: ['student', 'facility'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip
    });

    const sanitizedComplaints = complaints.map(complaint => 
      this.sanitizeComplaintResponse(complaint)
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: sanitizedComplaints,
      pagination: {
        totalItems: total,
        totalPages: totalPages,
        currentPage: page,
        previousPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null
      }
    };
  }

  /**
   * Update complaint
   */
  static async update(complaintId: number, studentId: number, params: IUpdateStudentComplaint) {
    return await TransactionUtility.executeInTransaction(async (queryRunner) => {
      const complaint = await queryRunner.manager.findOne(StudentComplaint, {
        where: {
          complaint_id: complaintId,
          student_id: studentId,
          isDeleted: false
        }
      });

      if (!complaint) {
        throw new StringError('Complaint not found');
      }

      // Update fields if provided
      if (params.category !== undefined) complaint.category = params.category;
      if (params.priority !== undefined) complaint.priority = params.priority;
      if (params.description !== undefined) complaint.description = params.description;
      if (params.location !== undefined) complaint.location = params.location;
      if (params.urgency_level !== undefined) complaint.urgency_level = params.urgency_level;
      if (params.status !== undefined) complaint.status = params.status;
      if (params.resolution_notes !== undefined) complaint.resolution_notes = params.resolution_notes;
      if (params.resolved_at !== undefined) complaint.resolved_at = params.resolved_at;

      const updatedComplaint = await queryRunner.manager.save(StudentComplaint, complaint);

      console.log(`✅ Student complaint updated successfully with ID: ${updatedComplaint.complaint_id}`);

      return this.sanitizeComplaintResponse(updatedComplaint);
    });
  }

  /**
   * Delete complaint (soft delete)
   */
  static async delete(complaintId: number, studentId: number) {
    return await TransactionUtility.executeInTransaction(async (queryRunner) => {
      const complaint = await queryRunner.manager.findOne(StudentComplaint, {
        where: {
          complaint_id: complaintId,
          student_id: studentId,
          isDeleted: false
        }
      });

      if (!complaint) {
        throw new StringError('Complaint not found');
      }

      complaint.isDeleted = true;
      await queryRunner.manager.save(StudentComplaint, complaint);

      console.log(`✅ Student complaint deleted successfully with ID: ${complaintId}`);

      return { message: 'Complaint deleted successfully' };
    });
  }

  /**
   * Sanitize complaint response based on is_anonymous flag
   * If anonymous, don't include student_id in response
   */
  private static sanitizeComplaintResponse(complaint: StudentComplaint): any {
    const response: any = {
      complaint_id: complaint.complaint_id,
      facility_id: complaint.facility_id,
      category: complaint.category,
      priority: complaint.priority,
      description: complaint.description,
      location: complaint.location,
      attachments: complaint.attachments,
      urgency_level: complaint.urgency_level,
      is_anonymous: complaint.is_anonymous,
      status: complaint.status,
      resolution_notes: complaint.resolution_notes,
      resolved_at: complaint.resolved_at,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt
    };

    // Only include student_id if not anonymous
    if (!complaint.is_anonymous) {
      response.student_id = complaint.student_id;
    }

    return response;
  }
}
