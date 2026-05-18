import { AttendanceStatus } from '../../../entities/attendance/attendance-log.entity';

export class UpdateAttendanceLogDto {
  status?: AttendanceStatus;
  login_time?: string;
  logout_time?: string;
  break_duration_minutes?: number;
  worked_hours?: number;
  task_description?: string;
  supervisor_notes?: string;
  updated_by_user_id?: number;
}
