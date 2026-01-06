import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { Student } from './student.entity';

@Entity('facility_records', { orderBy: { facility_id: 'DESC' } })
@Index(['facility_id'])
@Index(['student_id'])
@Index(['facility_name'])
@Index(['branch_site'])
export class FacilityRecords {

  @PrimaryGeneratedColumn({ type: 'int', name: 'facility_id' })
  facility_id: number;

  @Column({ 
    type: 'int', 
    nullable: false,
    name: 'student_id',
    comment: 'Foreign key to students table'
  })
  student_id: number;

  // Facility Information
  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'facility_name',
    comment: 'Name of the facility'
  })
  facility_name?: string;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: true,
    name: 'facility_type',
    comment: 'Type of facility'
  })
  facility_type?: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'branch_site',
    comment: 'Branch or site name'
  })
  branch_site?: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'facility_address',
    comment: 'Facility address'
  })
  facility_address?: string;

  // Contact Information
  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'contact_person_name',
    comment: 'Contact person name'
  })
  contact_person_name?: string;

  @Column({ 
    type: 'varchar', 
    length: 150, 
    nullable: true,
    name: 'contact_email',
    comment: 'Contact email'
  })
  contact_email?: string;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: true,
    name: 'contact_phone',
    comment: 'Contact phone number'
  })
  contact_phone?: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'supervisor_name',
    comment: 'Supervisor name'
  })
  supervisor_name?: string;

  // Placement Details
  @Column({ 
    type: 'int', 
    nullable: true,
    name: 'distance_from_student_km',
    comment: 'Distance from student location in km'
  })
  distance_from_student_km?: number;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: true,
    name: 'slot_id',
    comment: 'Slot identifier'
  })
  slot_id?: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'course_type',
    comment: 'Type of course'
  })
  course_type?: string;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: true,
    name: 'shift_timing',
    comment: 'Shift timing'
  })
  shift_timing?: string;

  @Column({ 
    type: 'date', 
    nullable: true,
    name: 'start_date',
    comment: 'Placement start date'
  })
  start_date?: Date;

  @Column({ 
    type: 'int', 
    nullable: true,
    name: 'duration_hours',
    comment: 'Duration in hours'
  })
  duration_hours?: number;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: true,
    name: 'gender_requirement',
    comment: 'Gender requirement (male/female/any)'
  })
  gender_requirement?: string;

  // Application Status
  @Column({ 
    type: 'date', 
    nullable: true,
    name: 'applied_on',
    comment: 'Date when application was submitted'
  })
  applied_on?: Date;

  @Column({
    type: 'boolean',
    default: false,
    name: 'student_confirmed',
    comment: 'Whether student confirmed the placement'
  })
  student_confirmed: boolean;

  @Column({ 
    type: 'text', 
    nullable: true,
    name: 'student_comments',
    comment: 'Student comments about the facility'
  })
  student_comments?: string;

  // Document Information
  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'document_type',
    comment: 'Type of document'
  })
  document_type?: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'file_path',
    comment: 'Path to uploaded document'
  })
  file_path?: string;

  @Column({
    type: 'enum',
    enum: ['applied', 'under_review', 'accepted', 'rejected', 'confirmed', 'completed'],
    default: 'applied',
    name: 'application_status',
    comment: 'Current application status'
  })
  application_status: 'applied' | 'under_review' | 'accepted' | 'rejected' | 'confirmed' | 'completed';

  // Relationship
  @ManyToOne(() => Student, student => student.facility_records, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  // Helper methods
  isConfirmed(): boolean {
    return this.student_confirmed && this.application_status === 'confirmed';
  }

  isActive(): boolean {
    return ['applied', 'under_review', 'accepted', 'confirmed'].includes(this.application_status);
  }

  getFullFacilityInfo(): string {
    const parts = [this.facility_name, this.branch_site, this.facility_address];
    return parts.filter(part => part).join(' - ');
  }
}