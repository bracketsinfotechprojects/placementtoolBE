import { getRepository, Repository } from 'typeorm';
import { AttendanceLog, AttendanceStatus, ApprovalStatus } from '../../entities/attendance/attendance-log.entity';
import { CreateAttendanceLogDto } from './dto/create-attendance-log.dto';
import { UpdateAttendanceLogDto } from './dto/update-attendance-log.dto';
import { ApproveAttendanceDto } from './dto/approve-attendance.dto';

export class AttendanceService {
  private attendanceRepository: Repository<AttendanceLog>;

  constructor() {
    this.attendanceRepository = getRepository(AttendanceLog);
  }

  /**
   * Log daily attendance for a student
   */
  async logAttendance(createDto: CreateAttendanceLogDto): Promise<AttendanceLog> {
    try {
      const attendance = this.attendanceRepository.create({
        ...createDto,
        approval_status: ApprovalStatus.PENDING,
        logged_at: new Date(),
      });

      return await this.attendanceRepository.save(attendance);
    } catch (error) {
      throw new Error(`Failed to log attendance: ${error.message}`);
    }
  }

  /**
   * Approve or reject attendance
   */
  async approveAttendance(approveDto: ApproveAttendanceDto): Promise<AttendanceLog> {
    const attendance = await this.attendanceRepository.findOne({
      where: { attendance_log_id: approveDto.attendance_log_id },
    });

    if (!attendance) {
      throw new Error(
        `Attendance log with ID ${approveDto.attendance_log_id} not found`,
      );
    }

    attendance.approval_status = approveDto.approval_status;
    attendance.approved_by_user_id = approveDto.approved_by_user_id;
    attendance.approved_at = new Date();
    attendance.approval_remarks = approveDto.approval_remarks;
    attendance.updated_at = new Date();

    return await this.attendanceRepository.save(attendance);
  }

  /**
   * Get attendance logs with filters
   */
  async getAttendanceLogs(
    filters: {
      student_id?: number;
      facility_id?: number;
      approval_status?: ApprovalStatus;
      limit?: number;
      page?: number;
    },
  ): Promise<{ data: AttendanceLog[]; pagination: any }> {
    const limit = filters.limit || 10;
    const page = filters.page || 1;
    const skip = (page - 1) * limit;

    const query = this.attendanceRepository.createQueryBuilder('attendance');

    if (filters.student_id) {
      query.andWhere('attendance.student_id = :student_id', {
        student_id: filters.student_id,
      });
    }

    if (filters.facility_id) {
      query.andWhere('attendance.facility_id = :facility_id', {
        facility_id: filters.facility_id,
      });
    }

    if (filters.approval_status) {
      query.andWhere('attendance.approval_status = :approval_status', {
        approval_status: filters.approval_status,
      });
    }

    query.orderBy('attendance.attendance_date', 'DESC');
    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      pagination: {
        total,
        per_page: limit,
        current_page: page,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get pending attendance for approval
   */
  async getPendingAttendance(
    filters: {
      student_id: number;
      facility_id?: number;
      limit?: number;
      page?: number;
    },
  ): Promise<{ data: AttendanceLog[]; pagination: any }> {
    return this.getAttendanceLogs({
      ...filters,
      approval_status: ApprovalStatus.PENDING,
    });
  }

  /**
   * Update attendance log
   */
  async updateAttendance(
    attendance_log_id: number,
    updateDto: UpdateAttendanceLogDto,
  ): Promise<AttendanceLog> {
    const attendance = await this.attendanceRepository.findOne({
      where: { attendance_log_id },
    });

    if (!attendance) {
      throw new Error(
        `Attendance log with ID ${attendance_log_id} not found`,
      );
    }

    Object.assign(attendance, updateDto);
    attendance.updated_at = new Date();

    return await this.attendanceRepository.save(attendance);
  }

  /**
   * Get single attendance log
   */
  async getAttendanceById(attendance_log_id: number): Promise<AttendanceLog> {
    const attendance = await this.attendanceRepository.findOne({
      where: { attendance_log_id },
    });

    if (!attendance) {
      throw new Error(
        `Attendance log with ID ${attendance_log_id} not found`,
      );
    }

    return attendance;
  }
}
