import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { Student } from '../student/student.entity';
import { Facility } from '../facility/facility.entity';
import { PlacementSlot } from '../placement-slot/placement-slot.entity';
import { User } from '../user/user.entity';

export enum SummaryPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export enum SummaryStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

@Entity('attendance_summary', { orderBy: { summary_id: 'DESC' } })
@Index(['student_id'])
@Index(['facility_id'])
@Index(['placement_slot_id'])
@Index(['period_start_date', 'period_end_date'])
@Index(['student_id', 'period_start_date', 'period_end_date'])
@Index(['status'])
export class AttendanceSummary {

  @PrimaryGeneratedColumn({ type: 'int', name: 'summary_id' })
  summary_id: number;

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

  @Column({
    type: 'int',
    nullable: false,
    name: 'placement_slot_id',
    comment: 'Foreign key to placement_slots table'
  })
  placement_slot_id: number;

  // Period Details
  @Column({
    type: 'enum',
    enum: SummaryPeriod,
    default: SummaryPeriod.WEEKLY,
    name: 'summary_period',
    comment: 'Period type for summary'
  })
  summary_period: SummaryPeriod;

  @Column({
    type: 'date',
    nullable: false,
    name: 'period_start_date',
    comment: 'Start date of the period'
  })
  period_start_date: Date;

  @Column({
    type: 'date',
    nullable: false,
    name: 'period_end_date',
    comment: 'End date of the period'
  })
  period_end_date: Date;

  // Attendance Metrics
  @Column({
    type: 'int',
    nullable: false,
    name: 'total_days_in_period',
    comment: 'Total working days in period'
  })
  total_days_in_period: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
    name: 'days_present',
    comment: 'Number of days present'
  })
  days_present: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
    name: 'days_absent',
    comment: 'Number of days absent'
  })
  days_absent: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
    name: 'days_on_leave',
    comment: 'Number of days on leave'
  })
  days_on_leave: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
    name: 'half_days',
    comment: 'Number of half days'
  })
  half_days: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
    name: 'late_arrivals',
    comment: 'Number of late arrivals'
  })
  late_arrivals: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
    name: 'early_departures',
    comment: 'Number of early departures'
  })
  early_departures: number;

  // Hours Metrics
  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: false,
    default: 0,
    name: 'total_hours_worked',
    comment: 'Total hours worked in period'
  })
  total_hours_worked: number;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: false,
    name: 'total_hours_required',
    comment: 'Total hours required for period'
  })
  total_hours_required: number;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
    name: 'hours_shortfall',
    comment: 'Hours shortfall if any'
  })
  hours_shortfall: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    name: 'average_daily_hours',
    comment: 'Average hours per day'
  })
  average_daily_hours: number;

  // Compliance
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: false,
    name: 'attendance_percentage',
    comment: 'Attendance percentage (0-100)'
  })
  attendance_percentage: number;

  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
    name: 'meets_minimum_attendance',
    comment: 'Whether meets minimum attendance requirement'
  })
  meets_minimum_attendance: boolean;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
    name: 'policy_violations',
    comment: 'Number of policy violations'
  })
  policy_violations: number;

  // Status
  @Column({
    type: 'enum',
    enum: SummaryStatus,
    default: SummaryStatus.DRAFT,
    name: 'status',
    comment: 'Summary status'
  })
  status: SummaryStatus;

  @Column({
    type: 'int',
    nullable: true,
    name: 'approved_by_user_id',
    comment: 'Foreign key to users table - who approved'
  })
  approved_by_user_id: number;

  @Column({
    type: 'text',
    nullable: true,
    name: 'approval_notes',
    comment: 'Notes on approval/rejection'
  })
  approval_notes: string;

  // Audit Trail
  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    comment: 'Record creation timestamp'
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    name: 'updated_at',
    comment: 'Record update timestamp'
  })
  updated_at: Date;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'is_deleted',
    comment: 'Soft delete flag'
  })
  is_deleted: boolean;

  // Relations
  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Facility)
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  @ManyToOne(() => PlacementSlot)
  @JoinColumn({ name: 'placement_slot_id' })
  placement_slot: PlacementSlot;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by_user_id' })
  approved_by: User;

  // Helper methods
  calculateAttendancePercentage(): number {
    if (this.total_days_in_period === 0) return 0;
    return (this.days_present / this.total_days_in_period) * 100;
  }

  calculateHoursShortfall(): number {
    const shortfall = this.total_hours_required - this.total_hours_worked;
    return Math.max(0, shortfall);
  }

  calculateAverageDailyHours(): number {
    if (this.days_present === 0) return 0;
    return this.total_hours_worked / this.days_present;
  }

  isApproved(): boolean {
    return this.status === SummaryStatus.APPROVED;
  }

  isRejected(): boolean {
    return this.status === SummaryStatus.REJECTED;
  }

  isDraft(): boolean {
    return this.status === SummaryStatus.DRAFT;
  }

  isSubmitted(): boolean {
    return this.status === SummaryStatus.SUBMITTED;
  }

  hasViolations(): boolean {
    return this.policy_violations > 0;
  }

  hasHoursShortfall(): boolean {
    return this.hours_shortfall > 0;
  }
}
