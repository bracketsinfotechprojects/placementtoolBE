import { IsInt, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApprovalStatus } from '../../../entities/attendance/attendance-log.entity';

export class ApproveAttendanceDto {
  @IsInt()
  attendance_log_id: number;

  @IsEnum(ApprovalStatus)
  approval_status: ApprovalStatus;

  @IsInt()
  approved_by_user_id: number;

  @IsOptional()
  @IsString()
  approval_remarks?: string;
}
