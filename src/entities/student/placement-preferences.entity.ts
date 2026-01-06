import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { Student } from './student.entity';

@Entity('placement_preferences', { orderBy: { preference_id: 'DESC' } })
@Index(['preference_id'])
@Index(['student_id'])
export class PlacementPreferences {

  @PrimaryGeneratedColumn({ type: 'int', name: 'preference_id' })
  preference_id: number;

  @Column({ 
    type: 'int', 
    nullable: false,
    name: 'student_id',
    comment: 'Foreign key to students table'
  })
  student_id: number;

  // Location Preferences
  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'preferred_states',
    comment: 'Preferred states for placement'
  })
  preferred_states?: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'preferred_cities',
    comment: 'Preferred cities for placement'
  })
  preferred_cities?: string;

  @Column({ 
    type: 'int', 
    nullable: true,
    name: 'max_travel_distance_km',
    comment: 'Maximum travel distance in kilometers'
  })
  max_travel_distance_km?: number;

  // Shift Preferences
  @Column({
    type: 'boolean',
    default: false,
    name: 'morning_only',
    comment: 'Only morning shift preferred'
  })
  morning_only: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'evening_only',
    comment: 'Only evening shift preferred'
  })
  evening_only: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'night_shift',
    comment: 'Night shift acceptable'
  })
  night_shift: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'weekend_only',
    comment: 'Only weekend work preferred'
  })
  weekend_only: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'part_time',
    comment: 'Part-time work preferred'
  })
  part_time: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'full_time',
    comment: 'Full-time work preferred'
  })
  full_time: boolean;

  // Companion Preferences
  @Column({
    type: 'boolean',
    default: false,
    name: 'with_friend',
    comment: 'Wants to work with friend'
  })
  with_friend: boolean;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'friend_name_or_id',
    comment: 'Friend name or ID'
  })
  friend_name_or_id?: string;

  @Column({
    type: 'boolean',
    default: false,
    name: 'with_spouse',
    comment: 'Wants to work with spouse'
  })
  with_spouse: boolean;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'spouse_name_or_id',
    comment: 'Spouse name or ID'
  })
  spouse_name_or_id?: string;

  // Timeline Preferences
  @Column({ 
    type: 'date', 
    nullable: true,
    name: 'earliest_start_date',
    comment: 'Earliest start date preference'
  })
  earliest_start_date?: Date;

  @Column({ 
    type: 'date', 
    nullable: true,
    name: 'latest_start_date',
    comment: 'Latest start date preference'
  })
  latest_start_date?: Date;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: true,
    name: 'specific_month_preference',
    comment: 'Specific month preference'
  })
  specific_month_preference?: string;

  @Column({
    type: 'enum',
    enum: ['immediate', 'within_month', 'within_quarter', 'flexible'],
    default: 'flexible',
    name: 'urgency_level',
    comment: 'Level of urgency for placement'
  })
  urgency_level: 'immediate' | 'within_month' | 'within_quarter' | 'flexible';

  @Column({ 
    type: 'text', 
    nullable: true,
    name: 'additional_preferences',
    comment: 'Additional placement preferences'
  })
  additional_preferences?: string;

  // Relationship
  @ManyToOne(() => Student, student => student.placement_preferences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  // Helper methods
  hasLocationFlexibility(): boolean {
    return !this.preferred_states && !this.preferred_cities && !this.max_travel_distance_km;
  }

  hasShiftFlexibility(): boolean {
    return !this.morning_only && !this.evening_only && !this.weekend_only;
  }

  isUrgent(): boolean {
    return this.urgency_level === 'immediate';
  }
}