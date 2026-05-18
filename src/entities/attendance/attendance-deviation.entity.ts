import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  JoinColumn,
  CreateDateColumn
} from 'typeorm';
import { AttendanceLog } from './attendance-log.entity';
import { Student } from '../student/student.entity';
import { Facility } from '../facility/facility.entity';
import { User } from '../user/user.entity';

export enum DeviationType {
  ABSENCE = 'absence',
  LATE_ARRIVAL = 'late_arrival',
  EARLY_DEPARTURE = 'early_departure',
  INSUFFICIENT_HOURS = 'insufficient_hours',
  POLICY_VIOLATION = 'policy_violation',
  OTHER = 'other'
}

export enum DeviationSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum DeviationResolutionStatus {
  FLAGGED = 'flagged',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated'
}

@Entity('attendance_deviations', { orderBy: { deviation_id: 'DESC' } })
@Index(['attendance_log_id'])
@Index(['student_id'])
@Index(['facility_id'])
@Index(['deviation_type'])
@Index(['severity'])
@Index(['status'])
export class AttendanceDeviation {

  @PrimaryGeneratedColumn({ type: 'int', name: 'deviation_id' })
  deviation_id: number;

  @Column({
    type: 'int',
    nullable: false,
    name: 'attendance_log_id',
    comment: 'Foreign key to attendance_logs table'
  })
  attendance_log_id: number;

  @Column({
    type: 'int',
    nullable: false,
    name: 'student_id',
    comment: 'Foreign key to students table'
  })
  student_id: number;

  @Column({
    type: 'int',
    nullable: false,
    name: 'facility_id',
    comment: 'Foreign key to facility table'
  })
  facility_id: number;

  // Deviation Details
  @Column({
    type: 'enum',
    enum: DeviationType,
    nullable: false,
    name: 'deviation_type',
    comment: 'Type of deviation'
  })
  deviation_type: DeviationType;

  @Column({
    type: 'enum',
    enum: DeviationSeverity,
    default: DeviationSeverity.MEDIUM,
    name: 'severity',
    comment: 'Severity level'
  })
  severity: DeviationSeverity;

  @Column({
    type: 'text',
    nullable: false,
    name: 'description',
    comment: 'Description of deviation'
  })
  description: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    name: 'impact_on_hours',
    comment: 'Impact on total hours worked'
  })
  impact_on_hours: number;

  // Resolution
  @Column({
    type: 'enum',
    enum: DeviationResolutionStatus,
    default: DeviationResolutionStatus.FLAGGED,
    name: 'status',
    comment: 'Resolution status'
  })
  status: DeviationResolutionStatus;

  @Column({
    type: 'text',
    nullable: true,
    name: 'resolution_notes',
    comment: 'Notes on resolution'
  })
  resolution_notes: string;

  @Column({
    type: 'int',
    nullable: true,
    name: 'resolved_by_user_id',
    comment: 'Foreign key to users table - who resolved'
  })
  resolved_by_user_id: number;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'resolved_at',
    comment: 'When deviation was resolved'
  })
  resolved_at: Date;

  // Audit Trail
  @CreateDateColumn({
    type: 'timestamp',
    name: 'flagged_at',
    comment: 'When deviation was flagged'
  })
  flagged_at: Date;

  @Column({
    type: 'int',
    nullable: false,
    name: 'flagged_by_user_id',
    comment: 'Foreign key to users table - who flagged'
  })
  flagged_by_user_id: number;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'is_deleted',
    comment: 'Soft delete flag'
  })
  is_deleted: boolean;

  // Relations
  @ManyToOne(() => AttendanceLog, log => log.deviations)
  @JoinColumn({ name: 'attendance_log_id' })
  attendance_log: AttendanceLog;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Facility)
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'flagged_by_user_id' })
  flagged_by: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'resolved_by_user_id' })
  resolved_by: User;

  // Helper methods
  isFlagged(): boolean {
    return this.status === DeviationResolutionStatus.FLAGGED;
  }

  isAcknowledged(): boolean {
    return this.status === DeviationResolutionStatus.ACKNOWLEDGED;
  }

  isResolved(): boolean {
    return this.status === DeviationResolutionStatus.RESOLVED;
  }

  isEscalated(): boolean {
    return this.status === DeviationResolutionStatus.ESCALATED;
  }

  isCritical(): boolean {
    return this.severity === DeviationSeverity.CRITICAL;
  }

  isHigh(): boolean {
    return this.severity === DeviationSeverity.HIGH;
  }

  requiresAction(): boolean {
    return [DeviationResolutionStatus.FLAGGED, DeviationResolutionStatus.ESCALATED].includes(this.status);
  }
}
