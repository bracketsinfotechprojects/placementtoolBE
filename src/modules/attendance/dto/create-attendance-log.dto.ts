import { IsInt, IsEnum, IsOptional, IsString, IsDateString, IsNumber, Min } from 'class-validator';
import { AttendanceStatus } from '../../../entities/attendance/attendance-log.entity';

export class CreateAttendanceLogDto {
  @IsInt()
  student_id: number;

  @IsInt()
  facility_id: number;

  @IsInt()
  placement_slot_id: number;

  @IsOptional()
  @IsInt()
  branch_id?: number;

  @IsDateString()
  attendance_date: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsOptional()
  @IsString()
  login_time?: string;

  @IsOptional()
  @IsString()
  logout_time?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  break_duration_minutes?: number;

  @IsOptional()
  @IsNumber()
  worked_hours?: number;

  @IsOptional()
  @IsString()
  task_description?: string;

  @IsOptional()
  @IsString()
  supervisor_notes?: string;

  @IsInt()
  logged_by_user_id: number;

  @IsOptional()
  @IsInt()
  updated_by_user_id?: number;
}
