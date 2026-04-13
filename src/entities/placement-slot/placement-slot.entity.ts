import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  JoinColumn,
  CreateDateColumn
} from 'typeorm';
import { Facility } from '../facility/facility.entity';
import { User } from '../user/user.entity';

@Entity('placement_slots', { orderBy: { placementslot_id: 'DESC' } })
@Index(['placementslot_id'])
@Index(['facility_id'])
@Index(['created_by'])
export class PlacementSlot {

  @PrimaryGeneratedColumn({ type: 'int', name: 'placementslot_id' })
  placementslot_id: number;

  @Column({
    type: 'varchar',
    nullable: false,
    name: 'facility_id',
    comment: 'Foreign key to Facility table (stored as string)'
  })
  facility_id: string;

  // Core slot details
  @Column({
    type: 'json',
    nullable: true,
    name: 'placementslot_type',
    comment: 'Type of placement slot (multi-select as JSON array)'
  })
  placementslot_type: string[];

  @Column({
    type: 'json',
    nullable: true,
    name: 'course_applicable',
    comment: 'Course applicable for this slot (multi-select as JSON array)'
  })
  course_applicable: string[];

  @Column({
    type: 'int',
    nullable: true,
    name: 'total_slots_offered',
    comment: 'Total number of slots offered'
  })
  total_slots_offered: number;

  @Column({
    type: 'int',
    nullable: true,
    name: 'remaining_seats',
    comment: 'Number of remaining seats available for booking'
  })
  remaining_seats: number;

  @Column({
    type: 'date',
    nullable: true,
    name: 'placement_start_date',
    comment: 'Placement start date'
  })
  placement_start_date: Date;

  @Column({
    type: 'date',
    nullable: true,
    name: 'placement_end_date',
    comment: 'Placement end date'
  })
  placement_end_date: Date;

  @Column({
    type: 'int',
    nullable: true,
    name: 'total_hours_required',
    comment: 'Total hours required for placement'
  })
  total_hours_required: number;

  @Column({
    type: 'json',
    nullable: true,
    name: 'expected_duration',
    comment: 'Expected duration of placement (multi-select as JSON array)'
  })
  expected_duration: string[];

  @Column({
    type: 'json',
    nullable: true,
    name: 'shift_type',
    comment: 'Type of shift (multi-select as JSON array)'
  })
  shift_type: string[];

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'shift_timings',
    comment: 'Specific shift timings'
  })
  shift_timings: string;

  @Column({
    type: 'json',
    nullable: true,
    name: 'working_days',
    comment: 'Working days pattern (multi-select as JSON array)'
  })
  working_days: string[];

  // Requirements
  @Column({
    type: 'json',
    nullable: true,
    name: 'mandatory_courses',
    comment: 'JSON array of mandatory courses required'
  })
  mandatory_courses: string[];

  @Column({
    type: 'json',
    nullable: true,
    name: 'documents_required',
    comment: 'JSON array of required documents'
  })
  documents_required: string[];

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'allowed_visa_types',
    comment: 'Allowed visa types for this placement'
  })
  allowed_visa_types: string;

  @Column({
    type: 'boolean',
    nullable: true,
    name: 'work_hour_limit',
    comment: 'Whether there is a work hour limit',
    default: false
  })
  work_hour_limit: boolean;

  @Column({
    type: 'text',
    nullable: true,
    name: 'work_hour_limit_details',
    comment: 'Details about work hour limitations'
  })
  work_hour_limit_details: string;

  @Column({
    type: 'json',
    nullable: true,
    name: 'gender_preference',
    comment: 'Gender preference for placement (multi-select as JSON array)'
  })
  gender_preference: string[];

  // Rules & Expectations
  @Column({
    type: 'text',
    nullable: true,
    name: 'dress_code',
    comment: 'Dress code requirements'
  })
  dress_code: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'attendance_rules',
    comment: 'Attendance rules and requirements'
  })
  attendance_rules: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'leave_policy',
    comment: 'Leave policy details'
  })
  leave_policy: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'behaviour_expectations',
    comment: 'Expected behavior and conduct'
  })
  behaviour_expectations: string;

  // Commercials
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'placement_fee',
    comment: 'Placement fee amount (stored as string)'
  })
  placement_fee: string;

  @Column({
    type: 'boolean',
    nullable: true,
    name: 'placement_fee_status',
    comment: 'Whether placement fee is active/paid',
    default: false
  })
  placement_fee_status: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
    name: 'invoice_required',
    comment: 'Whether invoice is required',
    default: false
  })
  invoice_required: boolean;

  @Column({
    type: 'text',
    nullable: true,
    name: 'special_commercial_terms',
    comment: 'Special commercial terms and conditions'
  })
  special_commercial_terms: string;

  // Constraints
  @Column({
    type: 'boolean',
    nullable: true,
    name: 'urgent_requirement',
    comment: 'Whether this is an urgent requirement',
    default: false
  })
  urgent_requirement: boolean;

  @Column({
    type: 'json',
    nullable: true,
    name: 'priority_category',
    comment: 'Priority category for this slot (multi-select as JSON array)'
  })
  priority_category: string[];

  @Column({
    type: 'text',
    nullable: true,
    name: 'restrictions',
    comment: 'Any restrictions for this placement'
  })
  restrictions: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'not_comfortable_with',
    comment: 'Things not comfortable with for this placement'
  })
  not_comfortable_with: string;

  // Audit: who added it
  @Column({
    type: 'int',
    nullable: false,
    name: 'created_by',
    comment: 'Foreign key to Users table - who created this slot'
  })
  created_by: number;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    comment: 'Record creation timestamp'
  })
  created_at: Date;

  @Column({
    type: 'boolean',
    nullable: false,
    name: 'is_deleted',
    comment: 'Soft delete flag',
    default: false
  })
  is_deleted: boolean;

  // Relations
  @ManyToOne(() => Facility)
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
