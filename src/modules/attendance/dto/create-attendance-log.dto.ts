import { AttendanceStatus } from '../../../entities/attendance/attendance-log.entity';

export class CreateAttendanceLogDto {
  student_id: number;
  facility_id: number;
  placement_slot_id: number;
  branch_id?: number;
  attendance_date: string;
  status: AttendanceStatus;
  login_time?: string;
  logout_time?: string;
  break_duration_minutes?: number;
  worked_hours?: number;
  task_description?: string;
  supervisor_notes?: string;
  logged_by_user_id: number;
  updated_by_user_id?: number;
}
