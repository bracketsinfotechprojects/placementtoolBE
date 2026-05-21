import { getRepository } from 'typeorm';
import { FacilitySupervisorComplaint } from '../../entities/complaint/facility-supervisor-complaint.entity';
import { Facility } from '../../entities/facility/facility.entity';
import { FacilitySupervisor } from '../../entities/facility-supervisor/facility-supervisor.entity';
import { Student } from '../../entities/student/student.entity';
import TransactionUtility from '../../utilities/transaction.utility';
import ApiUtility from '../../utilities/api.utility';
import { StringError } from '../../errors/string.error';
import { MoreThan } from 'typeorm';

export interface ICreateFacilitySupervisorComplaint {
  facility_id: number;
  supervisor_id?: number;
  student_id: number;
  student_name: string;
  complaint_type: string;
  urgency_level: string;
  location: string;
  description: string;
  attachments?: string[];
  is_anonymous: boolean;
}

export interface IUpdateFacilitySupervisorComplaint {
  complaint_type?: string;
  urgency_level?: string;
  location?: string;
  description?: string;
  status?: string;
  resolution_notes?: string;
  resolved_at?: Date;
}

export default class FacilitySupervisorComplaintService {
  /**
   * Create a new facility supervisor complaint
   */
  static async create(params: ICreateFacilitySupervisorComplaint) {
    return await TransactionUtility.executeInTransaction(async (queryRunner) => {
      // Verify facility exists
      const facility = await queryRunner.manager.findOne(Facility, {
        where: { facility_id: params.facility_id, isDeleted: false }
      });

      if (!facility) {
        throw new StringError('Facility not found');
      }

      // Verify supervisor exists if supervisor_id is provided
      if (params.supervisor_id) {
        const supervisor = await queryRunner.manager.findOne(FacilitySupervisor, {
          where: { supervisor_id: params.supervisor_id, facility_id: params.facility_id, isDeleted: false }
        });

        if (!supervisor) {
          throw new StringError('Supervisor not found or does not belong to this facility');
        }
      }

      // Verify student exists
      const student = await queryRunner.manager.findOne(Student, {
        where: { student_id: params.student_id, isDeleted: false }
      });

      if (!student) {
        throw new StringError('Student not found');
      }

      // Check for duplicate complaints within the last 5 minutes
      // (same facility, supervisor, student, complaint_type, and description)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentDuplicate = await queryRunner.manager.findOne(FacilitySupervisorComplaint, {
        where: {
          facility_id: params.facility_id,
          supervisor_id: params.supervisor_id || null,
          student_id: params.student_id,
          complaint_type: params.complaint_type,
          description: params.description,
          isDeleted: false,
          createdAt: MoreThan(fiveMinutesAgo)
        }
      });

      if (recentDuplicate) {
        throw new StringError('A similar complaint was already submitted recently. Please wait before submitting another complaint.');
      }

      // Create complaint
      const complaint = new FacilitySupervisorComplaint();
      complaint.facility_id = params.facility_id;
      complaint.supervisor_id = params.supervisor_id || null;
      complaint.student_id = params.student_id;
      complaint.student_name = params.student_name;
      complaint.complaint_type = params.complaint_type;
      complaint.urgency_level = params.urgency_level;
      complaint.location = params.location;
      complaint.description = params.description;
      complaint.attachments = params.attachments || [];
      complaint.is_anonymous = params.is_anonymous;
      complaint.status = 'Pending';

      const savedComplaint = await queryRunner.manager.save(FacilitySupervisorComplaint, complaint);

      console.log(`✅ Facility supervisor complaint created successfully with ID: ${savedComplaint.complaint_id}`);

      // Sanitize response based on is_anonymous flag
      return this.sanitizeComplaintResponse(savedComplaint);
    });
  }

  /**
   * Get complaint by ID
   */
  static async getById(complaintId: number, facilityId: number) {
    const complaint = await getRepository(FacilitySupervisorComplaint).findOne({
      where: {
        complaint_id: complaintId,
        facility_id: facilityId,
        isDeleted: false
      },
      relations: ['facility', 'supervisor', 'student']
    });

    if (!complaint) {
      throw new StringError('Complaint not found');
    }

    return this.sanitizeComplaintResponse(complaint);
  }

  /**
   * Get all complaints for a facility
   */
  static async getByFacilityId(facilityId: number, limit: number = 20, page: number = 1) {
    const skip = (page - 1) * limit;

    const [complaints, total] = await getRepository(FacilitySupervisorComplaint).findAndCount({
      where: {
        facility_id: facilityId,
        isDeleted: false
      },
      relations: ['facility', 'supervisor', 'student'],
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
   * Get all complaints by a specific supervisor
   */
  static async getBySupervisorId(supervisorId: number, facilityId: number, limit: number = 20, page: number = 1) {
    const skip = (page - 1) * limit;

    const [complaints, total] = await getRepository(FacilitySupervisorComplaint).findAndCount({
      where: {
        supervisor_id: supervisorId,
        facility_id: facilityId,
        isDeleted: false
      },
      relations: ['facility', 'supervisor', 'student'],
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
  static async update(complaintId: number, facilityId: number, params: IUpdateFacilitySupervisorComplaint) {
    return await TransactionUtility.executeInTransaction(async (queryRunner) => {
      const complaint = await queryRunner.manager.findOne(FacilitySupervisorComplaint, {
        where: {
          complaint_id: complaintId,
          facility_id: facilityId,
          isDeleted: false
        }
      });

      if (!complaint) {
        throw new StringError('Complaint not found');
      }

      // Update fields if provided
      if (params.complaint_type !== undefined) complaint.complaint_type = params.complaint_type;
      if (params.urgency_level !== undefined) complaint.urgency_level = params.urgency_level;
      if (params.location !== undefined) complaint.location = params.location;
      if (params.description !== undefined) complaint.description = params.description;
      if (params.status !== undefined) complaint.status = params.status;
      if (params.resolution_notes !== undefined) complaint.resolution_notes = params.resolution_notes;
      if (params.resolved_at !== undefined) complaint.resolved_at = params.resolved_at;

      const updatedComplaint = await queryRunner.manager.save(FacilitySupervisorComplaint, complaint);

      console.log(`✅ Facility supervisor complaint updated successfully with ID: ${updatedComplaint.complaint_id}`);

      return this.sanitizeComplaintResponse(updatedComplaint);
    });
  }

  /**
   * Delete complaint (soft delete)
   */
  static async delete(complaintId: number, facilityId: number) {
    return await TransactionUtility.executeInTransaction(async (queryRunner) => {
      const complaint = await queryRunner.manager.findOne(FacilitySupervisorComplaint, {
        where: {
          complaint_id: complaintId,
          facility_id: facilityId,
          isDeleted: false
        }
      });

      if (!complaint) {
        throw new StringError('Complaint not found');
      }

      complaint.isDeleted = true;
      await queryRunner.manager.save(FacilitySupervisorComplaint, complaint);

      console.log(`✅ Facility supervisor complaint deleted successfully with ID: ${complaintId}`);

      return { message: 'Complaint deleted successfully' };
    });
  }

  /**
   * Sanitize complaint response based on is_anonymous flag
   * If anonymous, don't include supervisor_id in response
   */
  private static sanitizeComplaintResponse(complaint: FacilitySupervisorComplaint): any {
    const response: any = {
      complaint_id: complaint.complaint_id,
      facility_id: complaint.facility_id,
      student_id: complaint.student_id,
      student_name: complaint.student_name,
      complaint_type: complaint.complaint_type,
      urgency_level: complaint.urgency_level,
      location: complaint.location,
      description: complaint.description,
      attachments: complaint.attachments,
      is_anonymous: complaint.is_anonymous,
      status: complaint.status,
      resolution_notes: complaint.resolution_notes,
      resolved_at: complaint.resolved_at,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt
    };

    // Only include supervisor_id if not anonymous
    if (!complaint.is_anonymous) {
      response.supervisor_id = complaint.supervisor_id;
    }

    return response;
  }
}
