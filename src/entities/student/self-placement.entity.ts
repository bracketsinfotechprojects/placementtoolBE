import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { Student } from './student.entity';

@Entity('self_placements', { orderBy: { placement_id: 'DESC' } })
@Index(['placement_id'])
@Index(['student_id'])
@Index(['facility_name'])
export class SelfPlacement {

  @PrimaryGeneratedColumn({ type: 'int', name: 'placement_id' })
  placement_id: number;

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
    nullable: false,
    name: 'facility_name',
    comment: 'Name of the facility'
  })
  facility_name: string;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: true,
    name: 'facility_type',
    comment: 'Type of facility (Hospital, Clinic, Aged Care, etc.)'
  })
  facility_type?: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'facility_address',
    comment: 'Complete facility address'
  })
  facility_address?: string;

  // Contact Information
  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'contact_person_name',
    comment: 'Primary contact person name'
  })
  contact_person_name?: string;

  @Column({ 
    type: 'varchar', 
    length: 150, 
    nullable: true,
    name: 'contact_email',
    comment: 'Contact person email'
  })
  contact_email?: string;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: true,
    name: 'contact_phone',
    comment: 'Contact person phone number'
  })
  contact_phone?: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'supervisor_name',
    comment: 'Supervisor name at facility'
  })
  supervisor_name?: string;

  // Supporting Documents (Multiple document support)
  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'supporting_documents_path',
    comment: 'Path to supporting documents'
  })
  supporting_documents_path?: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'offer_letter_path',
    comment: 'Path to offer/acceptance letter'
  })
  offer_letter_path?: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'registration_proof_path',
    comment: 'Path to facility registration proof'
  })
  registration_proof_path?: string;

  // Status and Review
  @Column({
    type: 'enum',
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending',
    name: 'status',
    comment: 'Self placement application status'
  })
  status: 'pending' | 'under_review' | 'approved' | 'rejected';

  @Column({ 
    type: 'datetime', 
    nullable: true,
    name: 'reviewed_at',
    comment: 'When admin reviewed the application'
  })
  reviewed_at?: Date;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'reviewed_by',
    comment: 'Admin who reviewed the application'
  })
  reviewed_by?: string;

  @Column({ 
    type: 'text', 
    nullable: true,
    name: 'review_comments',
    comment: 'Admin comments on the application'
  })
  review_comments?: string;

  @Column({ 
    type: 'text', 
    nullable: true,
    name: 'student_comments',
    comment: 'Student comments about the placement'
  })
  student_comments?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relationship
  @ManyToOne(() => Student, student => student.self_placements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  // Helper methods
  isPending(): boolean {
    return this.status === 'pending';
  }

  isApproved(): boolean {
    return this.status === 'approved';
  }

  needsReview(): boolean {
    return this.status === 'pending' || this.status === 'under_review';
  }
}
