import { ApprovalStatus } from '../../../entities/attendance/attendance-log.entity';

export class ApproveAttendanceDto {
  attendance_log_id: number;
  approval_status: ApprovalStatus;
  approved_by_user_id: number;
  approval_remarks?: string;
}
