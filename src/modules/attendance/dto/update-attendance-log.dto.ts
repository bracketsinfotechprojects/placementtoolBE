import { AttendanceStatus, ApprovalStatus } from '../../../entities/attendance/attendance-log.entity';

export class UpdateAttendanceLogDto {
  attendance_date?: Date;
  status?: AttendanceStatus;
  login_time?: string;
  logout_time?: string;
  break_duration_minutes?: number;
  worked_hours?: number;
  task_description?: string;
  supervisor_notes?: string;
  approval_status?: ApprovalStatus;
  approved_by_user_id?: string; // Can be email or user ID
  approval_remarks?: string;
  updated_by_user_id?: number;
}
