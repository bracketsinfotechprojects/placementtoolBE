import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { Student } from './student.entity';

@Entity('student_lifestyle', { orderBy: { lifestyle_id: 'DESC' } })
@Index(['lifestyle_id'])
@Index(['student_id'])
export class StudentLifestyle {

  @PrimaryGeneratedColumn({ type: 'int', name: 'lifestyle_id' })
  lifestyle_id: number;

  @Column({ 
    type: 'int', 
    nullable: false,
    name: 'student_id',
    comment: 'Foreign key to students table'
  })
  student_id: number;

  // Employment & Family
  @Column({
    type: 'boolean',
    default: false,
    name: 'currently_working',
    comment: 'Whether student is currently working'
  })
  currently_working: boolean;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: true,
    name: 'working_hours',
    comment: 'Working hours (full-time, part-time, etc.)'
  })
  working_hours?: string;

  @Column({
    type: 'boolean',
    default: false,
    name: 'has_dependents',
    comment: 'Whether student has dependents'
  })
  has_dependents: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'married',
    comment: 'Whether student is married'
  })
  married: boolean;

  // Transport & Mobility
  @Column({
    type: 'boolean',
    default: false,
    name: 'driving_license',
    comment: 'Whether student has driving license'
  })
  driving_license: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'own_vehicle',
    comment: 'Whether student owns a vehicle'
  })
  own_vehicle: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'public_transport_only',
    comment: 'Whether student relies only on public transport'
  })
  public_transport_only: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'can_travel_long_distance',
    comment: 'Whether student can travel long distances'
  })
  can_travel_long_distance: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'drop_support_available',
    comment: 'Whether drop support is available'
  })
  drop_support_available: boolean;

  // Availability & Flexibility
  @Column({
    type: 'boolean',
    default: false,
    name: 'fully_flexible',
    comment: 'Whether student is fully flexible'
  })
  fully_flexible: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'rush_placement_required',
    comment: 'Whether rush placement is required'
  })
  rush_placement_required: boolean;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'preferred_days',
    comment: 'Preferred days for placement'
  })
  preferred_days?: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'preferred_time_slots',
    comment: 'Preferred time slots'
  })
  preferred_time_slots?: string;

  @Column({ 
    type: 'text', 
    nullable: true,
    name: 'additional_notes',
    comment: 'Additional lifestyle notes'
  })
  additional_notes?: string;

  // Relationship
  @ManyToOne(() => Student, student => student.student_lifestyle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  // Helper methods
  hasMobilityRestrictions(): boolean {
    return this.public_transport_only && !this.own_vehicle && !this.drop_support_available;
  }

  isFlexible(): boolean {
    return this.fully_flexible && !this.currently_working;
  }

  needsSpecialConsideration(): boolean {
    return this.has_dependents || this.married || this.hasMobilityRestrictions();
  }
}