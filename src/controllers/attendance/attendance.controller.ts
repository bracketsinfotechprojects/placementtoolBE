import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { AttendanceLog, ApprovalStatus } from '../../entities/attendance/attendance-log.entity';
import { Student } from '../../entities/student/student.entity';
import { Facility } from '../../entities/facility/facility.entity';
import { PlacementSlot } from '../../entities/placement-slot/placement-slot.entity';
import { PlacementAssignment } from '../../entities/placement-assignment/placement-assignment.entity';
import { User } from '../../entities/user/user.entity';
import { CreateAttendanceLogDto } from '../../modules/attendance/dto/create-attendance-log.dto';
import { ApproveAttendanceDto } from '../../modules/attendance/dto/approve-attendance.dto';
import logger from '../../configs/logger.config';

class AttendanceController {
  /**
   * Log daily attendance for a student
   */
  static async logAttendance(req: Request, res: Response) {
    try {
      const createAttendanceLogDto: CreateAttendanceLogDto = req.body;

      const attendanceLogRepository = getRepository(AttendanceLog);
      const studentRepository = getRepository(Student);
      const facilityRepository = getRepository(Facility);
      const placementSlotRepository = getRepository(PlacementSlot);
      const userRepository = getRepository(User);

      // Validate that student exists
      const student = await studentRepository.findOne({
        where: { student_id: createAttendanceLogDto.student_id },
      });
      if (!student) {
        return res.status(400).json({
          success: false,
          message: `Student with ID ${createAttendanceLogDto.student_id} not found`,
        });
      }

      // Validate that facility exists
      const facility = await facilityRepository.findOne({
        where: { facility_id: createAttendanceLogDto.facility_id },
      });
      if (!facility) {
        return res.status(400).json({
          success: false,
          message: `Facility with ID ${createAttendanceLogDto.facility_id} not found`,
        });
      }

      // Validate that placement slot exists
      const placementSlot = await placementSlotRepository.findOne({
        where: { placementslot_id: createAttendanceLogDto.placement_slot_id },
      });
      if (!placementSlot) {
        return res.status(400).json({
          success: false,
          message: `Placement slot with ID ${createAttendanceLogDto.placement_slot_id} not found`,
        });
      }

      // Validate attendance date is within student's placement assignment dates
      const placementAssignmentRepository = getRepository(PlacementAssignment);
      const placementAssignment = await placementAssignmentRepository.findOne({
        where: {
          student_id: createAttendanceLogDto.student_id,
          placementslot_id: createAttendanceLogDto.placement_slot_id,
        },
      });

      if (!placementAssignment) {
        return res.status(400).json({
          success: false,
          message: `Placement assignment not found for student ${createAttendanceLogDto.student_id} in slot ${createAttendanceLogDto.placement_slot_id}`,
        });
      }

      // Check if attendance date is within the placement assignment dates
      const attendanceDate = new Date(createAttendanceLogDto.attendance_date);
      attendanceDate.setHours(0, 0, 0, 0);

      if (placementAssignment.start_date) {
        const startDate = new Date(placementAssignment.start_date);
        startDate.setHours(0, 0, 0, 0);
        if (attendanceDate < startDate) {
          return res.status(400).json({
            success: false,
            message: `Attendance date cannot be before placement start date (${placementAssignment.start_date.toISOString().split('T')[0]})`,
          });
        }
      }

      if (placementAssignment.end_date) {
        const endDate = new Date(placementAssignment.end_date);
        endDate.setHours(0, 0, 0, 0);
        if (attendanceDate > endDate) {
          return res.status(400).json({
            success: false,
            message: `Attendance date cannot be after placement end date (${placementAssignment.end_date.toISOString().split('T')[0]})`,
          });
        }
      }

      // Validate that logged_by user exists
      const loggedByUser = await userRepository.findOne({
        where: { id: createAttendanceLogDto.logged_by_user_id },
      });
      if (!loggedByUser) {
        return res.status(400).json({
          success: false,
          message: `User with ID ${createAttendanceLogDto.logged_by_user_id} not found`,
        });
      }

      // Create attendance log
      const attendanceLog = attendanceLogRepository.create({
        ...createAttendanceLogDto,
        logged_at: new Date(),
        approval_status: ApprovalStatus.PENDING,
      });

      const savedLog = await attendanceLogRepository.save(attendanceLog);

      return res.status(201).json({
        success: true,
        message: 'Attendance logged successfully',
        data: savedLog,
      });
    } catch (error) {
      logger.error('Error logging attendance:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to log attendance',
      });
    }
  }

  /**
   * Approve or reject attendance
   */
  static async approveAttendance(req: Request, res: Response) {
    try {
      const approveAttendanceDto: ApproveAttendanceDto = req.body;

      const attendanceLogRepository = getRepository(AttendanceLog);
      const userRepository = getRepository(User);

      // Validate that attendance log exists
      const attendanceLog = await attendanceLogRepository.findOne({
        where: { attendance_log_id: approveAttendanceDto.attendance_log_id },
      });
      if (!attendanceLog) {
        return res.status(404).json({
          success: false,
          message: `Attendance log with ID ${approveAttendanceDto.attendance_log_id} not found`,
        });
      }

      // Validate that approver user exists
      const approverUser = await userRepository.findOne({
        where: { id: approveAttendanceDto.approved_by_user_id },
      });
      if (!approverUser) {
        return res.status(400).json({
          success: false,
          message: `User with ID ${approveAttendanceDto.approved_by_user_id} not found`,
        });
      }

      // Authorization check: Only admin (roleID = 1), facility user (roleID = 2), or facility supervisor (roleID = 3) linked to this facility can approve
      const isAdmin = approverUser.roleID === 1;
      const isFacilityUser = approverUser.roleID === 2 && approverUser.facilityID !== null;
      const isFacilitySupervisor = approverUser.roleID === 3 && approverUser.supervisorID !== null;
      
      if (!isAdmin && !isFacilityUser && !isFacilitySupervisor) {
        return res.status(403).json({
          success: false,
          message: 'Only admin, facility user, or facility supervisor can approve attendance',
        });
      }

      // If facility user, verify they are linked to this facility
      if (isFacilityUser) {
        if (Number(approverUser.facilityID) !== attendanceLog.facility_id) {
          return res.status(403).json({
            success: false,
            message: 'You can only approve attendance for your assigned facility',
          });
        }
      }

      // If supervisor, verify they are linked to this facility
      if (isFacilitySupervisor) {
        // Get supervisor details to check facility link
        // Assuming there's a supervisors table with facility_id
        // For now, we'll check if the supervisor's facility matches the attendance facility
        // This requires a query to the supervisors table
        const supervisorFacilityCheck = await attendanceLogRepository.query(
          `SELECT s.facility_id FROM supervisors s WHERE s.supervisor_id = ? AND s.facility_id = ?`,
          [approverUser.supervisorID, attendanceLog.facility_id]
        );

        if (supervisorFacilityCheck.length === 0) {
          return res.status(403).json({
            success: false,
            message: 'You can only approve attendance for your assigned facility',
          });
        }
      }

      // Update attendance log with approval status
      attendanceLog.approval_status = approveAttendanceDto.approval_status;
      attendanceLog.approved_by_user_id = approveAttendanceDto.approved_by_user_id;
      attendanceLog.approved_at = new Date();
      attendanceLog.approval_remarks = approveAttendanceDto.approval_remarks || null;
      attendanceLog.updated_by_user_id = approveAttendanceDto.approved_by_user_id;
      attendanceLog.updated_at = new Date();

      const updatedLog = await attendanceLogRepository.save(attendanceLog);

      return res.status(200).json({
        success: true,
        message: `Attendance ${approveAttendanceDto.approval_status} successfully`,
        data: updatedLog,
      });
    } catch (error) {
      logger.error('Error approving attendance:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to approve attendance',
      });
    }
  }

  /**
   * Get attendance logs
   */
  static async getAttendanceLogs(req: Request, res: Response) {
    try {
      const { student_id, facility_id, approval_status, limit = 10, page = 1 } = req.query;

      const attendanceLogRepository = getRepository(AttendanceLog);
      let query = attendanceLogRepository.createQueryBuilder('attendance');

      if (student_id) {
        query = query.where('attendance.student_id = :student_id', { student_id });
      }

      if (facility_id) {
        query = query.andWhere('attendance.facility_id = :facility_id', { facility_id });
      }

      if (approval_status) {
        query = query.andWhere('attendance.approval_status = :approval_status', { approval_status });
      }

      const skip = (Number(page) - 1) * Number(limit);
      const [data, total] = await query
        .orderBy('attendance.attendance_date', 'DESC')
        .skip(skip)
        .take(Number(limit))
        .getManyAndCount();

      return res.status(200).json({
        success: true,
        message: 'Attendance logs retrieved successfully',
        data,
        pagination: {
          total,
          per_page: Number(limit),
          current_page: Number(page),
          last_page: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error('Error fetching attendance logs:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch attendance logs',
      });
    }
  }

  /**
   * Get pending attendance for approval
   */
  static async getPendingAttendance(req: Request, res: Response) {
    try {
      const { facility_id, limit = 10, page = 1 } = req.query;

      const attendanceLogRepository = getRepository(AttendanceLog);
      let query = attendanceLogRepository.createQueryBuilder('attendance')
        .where('attendance.approval_status = :approval_status', { approval_status: ApprovalStatus.PENDING });

      if (facility_id) {
        query = query.andWhere('attendance.facility_id = :facility_id', { facility_id });
      }

      const skip = (Number(page) - 1) * Number(limit);
      const [data, total] = await query
        .orderBy('attendance.attendance_date', 'DESC')
        .skip(skip)
        .take(Number(limit))
        .getManyAndCount();

      return res.status(200).json({
        success: true,
        message: 'Pending attendance retrieved successfully',
        data,
        pagination: {
          total,
          per_page: Number(limit),
          current_page: Number(page),
          last_page: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error('Error fetching pending attendance:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch pending attendance',
      });
    }
  }
}

export default AttendanceController;
