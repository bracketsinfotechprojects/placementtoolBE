import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  Index,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Trainer } from '../trainer/trainer.entity';

@Entity('CourseSlots')
@Index(['course_id'])
@Index(['course_date'])
@Index(['course_category'])
export class CourseSlots extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int', name: 'course_id' })
  course_id: number;

  // Course Overview
  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: false,
    name: 'course_name',
    comment: 'Name of the course'
  })
  course_name: string;

  @Column({ 
    type: 'set', 
    enum: ['Manual Handling', 'First Aid'],
    nullable: false,
    name: 'course_category',
    comment: 'Categories: Manual Handling, First Aid'
  })
  course_category: ('Manual Handling' | 'First Aid')[];

  @Column({ 
    type: 'set', 
    enum: ['Accredited', 'Non-Accredited', 'Refresher'],
    nullable: true,
    name: 'course_type',
    comment: 'Course types: Accredited, Non-Accredited, Refresher'
  })
  course_type: ('Accredited' | 'Non-Accredited' | 'Refresher')[];

  @Column({ 
    type: 'set', 
    enum: ['Aged Care', 'Disability', 'Healthcare Students'],
    nullable: true,
    name: 'course_scope',
    comment: 'Scopes: Aged Care, Disability, Healthcare Students'
  })
  course_scope: ('Aged Care' | 'Disability' | 'Healthcare Students')[];

  // Schedule & Location
  @Column({ 
    type: 'date', 
    nullable: false,
    name: 'course_date',
    comment: 'Date when the course is scheduled'
  })
  course_date: Date;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: true,
    name: 'day_of_week',
    comment: 'Day of the week for the course'
  })
  day_of_week: string;

  @Column({ 
    type: 'time', 
    nullable: true,
    name: 'reporting_time',
    comment: 'Time when participants should report'
  })
  reporting_time: string;

  @Column({ 
    type: 'time', 
    nullable: true,
    name: 'expected_end_time',
    comment: 'Expected end time of the course'
  })
  expected_end_time: string;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: true,
    name: 'total_duration',
    comment: 'Total duration e.g. "4 hours", "Full Day"'
  })
  total_duration: string;

  @Column({ 
    type: 'set', 
    enum: ['Onsite', 'Online', 'Hybrid'],
    nullable: true,
    name: 'mode',
    comment: 'Modes: Onsite, Online, Hybrid'
  })
  mode: ('Onsite' | 'Online' | 'Hybrid')[];

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'training_location',
    comment: 'Name of the training location/venue'
  })
  training_location: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'address',
    comment: 'Full address of the training location'
  })
  address: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'city',
    comment: 'City where training is conducted'
  })
  city: string;

  @Column({ 
    type: 'varchar', 
    length: 500, 
    nullable: true,
    name: 'google_maps_link',
    comment: 'Google Maps link to the training location'
  })
  google_maps_link: string;

  // Seat Availability
  @Column({ 
    type: 'int', 
    nullable: true,
    name: 'total_seats',
    comment: 'Total number of seats available'
  })
  total_seats: number;

  @Column({ 
    type: 'int', 
    nullable: true,
    name: 'seats_remaining',
    comment: 'Number of seats remaining'
  })
  seats_remaining: number;

  @Column({ 
    type: 'enum', 
    enum: ['Available', 'Filling Fast', 'Full'],
    nullable: true,
    name: 'seat_status',
    comment: 'Status: Available, Filling Fast, Full'
  })
  seat_status: 'Available' | 'Filling Fast' | 'Full';

  @Column({ 
    type: 'date', 
    nullable: true,
    name: 'last_booking_date',
    comment: 'Last date for booking'
  })
  last_booking_date: Date;

  // Certification Details
  @Column({ 
    type: 'boolean', 
    nullable: true,
    default: false,
    name: 'certificate_issued',
    comment: 'Whether certificate is issued'
  })
  certificate_issued: boolean;

  @Column({ 
    type: 'set', 
    enum: ['Digital', 'Physical'],
    nullable: true,
    name: 'certificate_type',
    comment: 'Certificate types: Digital, Physical'
  })
  certificate_type: ('Digital' | 'Physical')[];

  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: true,
    name: 'certificate_validity',
    comment: 'Validity period e.g. "12 months"'
  })
  certificate_validity: string;

  @Column({ 
    type: 'set', 
    enum: ['Institute', 'Registered Body'],
    nullable: true,
    name: 'issuing_authority',
    comment: 'Issuing authorities: Institute, Registered Body'
  })
  issuing_authority: ('Institute' | 'Registered Body')[];

  @Column({ 
    type: 'enum', 
    enum: ['Same Day', 'Within 48 Hours'],
    nullable: true,
    name: 'certificate_issue_timeline',
    comment: 'Timeline: Same Day, Within 48 Hours'
  })
  certificate_issue_timeline: 'Same Day' | 'Within 48 Hours';

  // Eligibility & Requirements
  @Column({ 
    type: 'set', 
    enum: ['External', 'Internal'],
    nullable: true,
    name: 'target_audience',
    comment: 'Target audiences: External, Internal'
  })
  target_audience: ('External' | 'Internal')[];

  @Column({ 
    type: 'set', 
    enum: ['ID Proof', 'Payment Receipt'],
    nullable: true,
    name: 'documents_required',
    comment: 'Required documents: ID Proof, Payment Receipt'
  })
  documents_required: ('ID Proof' | 'Payment Receipt')[];

  @Column({ 
    type: 'set', 
    enum: ['Online Module', 'None'],
    nullable: true,
    name: 'pre_course_requirement',
    comment: 'Pre-course requirements: Online Module, None'
  })
  pre_course_requirement: ('Online Module' | 'None')[];

  // Dress Code & Items
  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'dress_code',
    comment: 'Dress code e.g. "Comfortable clothing"'
  })
  dress_code: string;

  @Column({ 
    type: 'set', 
    enum: ['Notebook & Pen', 'Water Bottle'],
    nullable: true,
    name: 'items_to_bring',
    comment: 'Items to bring: Notebook & Pen, Water Bottle'
  })
  items_to_bring: ('Notebook & Pen' | 'Water Bottle')[];

  @Column({ 
    type: 'enum', 
    enum: ['Silent', 'Restricted'],
    nullable: true,
    name: 'mobile_phone_policy',
    comment: 'Policy: Silent, Restricted'
  })
  mobile_phone_policy: 'Silent' | 'Restricted';

  // Trainer Assignment
  @Column({ 
    type: 'int', 
    nullable: true,
    name: 'trainer_id',
    comment: 'Reference to Trainer table (assigned trainer for this course)'
  })
  trainer_id: number;

  // Audit fields
  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'created_by',
    comment: 'Name or ID of the person who added the course'
  })
  created_by: string;

  // Relationship
  @ManyToOne(() => Trainer, { eager: false })
  @JoinColumn({ name: 'trainer_id' })
  trainer: Trainer;

  toJSON() {
    const { ...result } = this;
    return result;
  }
}
