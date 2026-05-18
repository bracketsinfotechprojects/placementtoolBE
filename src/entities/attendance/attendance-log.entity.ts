import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { Student } from '../student/student.entity';
import { Facility } from '../facility/facility.entity';
import { PlacementSlot } from '../placement-slot/placement-slot.entity';
import { FacilityBranchSite } from '../facility/facility-branch-site.entity';
import { User } from '../user/user.entity';
import { AttendanceDeviation } from './attendance-deviation.entity';
import { CourseAssignment } from '../course-assignment/course-assignment.entity';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LEAVE = 'leave',
  HALF_DAY = 'half_day',
  LATE = 'late',
  EARLY_DEPARTURE = 'early_departure'
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

@Entity('attendance_logs', { orderBy: { attendance_log_id: 'DESC' } })
@Index(['student_id'])
@Index(['facility_id'])
@Index(['placement_slot_id'])
@Index(['attendance_date'])
@Index(['status'])
@Index(['student_id', 'attendance_date'])
@Index(['facility_id', 'attendance_date'])
export class AttendanceLog {

  @PrimaryGeneratedColumn({ type: 'int', name: 'attendance_log_id' })
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

  @Column({
    type: 'int',
    nullable: false,
    name: 'placement_slot_id',
    comment: 'Foreign key to placement_slots table'
  })
  placement_slot_id: number;

  @Column({
    type: 'int',
    nullable: true,
    name: 'branch_id',
    comment: 'Foreign key to facility_branch_site table'
  })
  branch_id: number;

  // Attendance Details
  @Column({
    type: 'date',
    nullable: false,
    name: 'attendance_date',
    comment: 'Date of attendance'
  })
  attendance_date: Date;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
    name: 'status',
    comment: 'Attendance status'
  })
  status: AttendanceStatus;

  @Column({
    type: 'time',
    nullable: true,
    name: 'login_time',
    comment: 'Time when student logged in/arrived'
  })
  login_time: string;

  @Column({
    type: 'time',
    nullable: true,
    name: 'logout_time',
    comment: 'Time when student logged out/left'
  })
  logout_time: string;

  @Column({
    type: 'int',
    nullable: true,
    default: 0,
    name: 'break_duration_minutes',
    comment: 'Break duration in minutes'
  })
  break_duration_minutes: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    name: 'worked_hours',
    comment: 'Total hours worked (calculated)'
  })
  worked_hours: number;

  // Work Details
  @Column({
    type: 'text',
    nullable: true,
    name: 'task_description',
    comment: 'Tasks completed during the day'
  })
  task_description: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'supervisor_notes',
    comment: 'Notes from facility supervisor'
  })
  supervisor_notes: string;
  @Column({
    type: 'int',
    nullable: false,
    name: 'logged_by_user_id',
    comment: 'Foreign key to users table - who logged this attendance'
  })
  logged_by_user_id: number;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'logged_at',
    comment: 'When this record was created'
  })
  logged_at: Date;

  @Column({
    type: 'int',
    nullable: true,
    name: 'updated_by_user_id',
    comment: 'Foreign key to users table - who last updated'
  })
  updated_by_user_id: number;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    name: 'updated_at',
    comment: 'When this record was last updated'
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

  // Approval Status
  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
    name: 'approval_status',
    comment: 'Approval status of attendance (pending, approved, rejected)'
  })
  approval_status: ApprovalStatus;

  @Column({
    type: 'int',
    nullable: true,
    name: 'approved_by_user_id',
    comment: 'Foreign key to users table - who approved/rejected this attendance'
  })
  approved_by_user_id: number;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'approved_at',
    comment: 'When this attendance was approved/rejected'
  })
  approved_at: Date;

  @Column({
    type: 'text',
    nullable: true,
    name: 'approval_remarks',
    comment: 'Remarks from approver when rejecting or approving'
  })
  approval_remarks: string;

  // Relations
  @ManyToOne(() => Student, student => student.attendance_logs)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Facility)
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  @ManyToOne(() => PlacementSlot)
  @JoinColumn({ name: 'placement_slot_id' })
  placement_slot: PlacementSlot;

  @ManyToOne(() => FacilityBranchSite, { nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch: FacilityBranchSite;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'logged_by_user_id', referencedColumnName: 'id' })
  logged_by: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by_user_id', referencedColumnName: 'id' })
  updated_by: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by_user_id', referencedColumnName: 'id' })
  approved_by: User;

  @OneToMany(() => AttendanceDeviation, deviation => deviation.attendance_log)
  deviations: AttendanceDeviation[];

  // Helper methods
  calculateWorkedHours(): number {
    if (!this.login_time || !this.logout_time) return 0;
    
    const [loginHour, loginMin] = this.login_time.split(':').map(Number);
    const [logoutHour, logoutMin] = this.logout_time.split(':').map(Number);
    
    const loginMinutes = loginHour * 60 + loginMin;
    const logoutMinutes = logoutHour * 60 + logoutMin;
    
    const totalMinutes = logoutMinutes - loginMinutes - (this.break_duration_minutes || 0);
    return Math.max(0, totalMinutes / 60);
  }

  isPresent(): boolean {
    return this.status === AttendanceStatus.PRESENT;
  }

  isAbsent(): boolean {
    return this.status === AttendanceStatus.ABSENT;
  }

  isOnLeave(): boolean {
    return this.status === AttendanceStatus.LEAVE;
  }

  isLate(): boolean {
    return this.status === AttendanceStatus.LATE;
  }

  hasEarlyDeparture(): boolean {
    return this.status === AttendanceStatus.EARLY_DEPARTURE;
  }

  isHalfDay(): boolean {
    return this.status === AttendanceStatus.HALF_DAY;
  }

  isPending(): boolean {
    return this.approval_status === ApprovalStatus.PENDING;
  }

  isApproved(): boolean {
    return this.approval_status === ApprovalStatus.APPROVED;
  }

  isRejected(): boolean {
    return this.approval_status === ApprovalStatus.REJECTED;
  }
}
