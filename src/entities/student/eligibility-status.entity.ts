import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { Student } from './student.entity';

@Entity('eligibility_status', { orderBy: { status_id: 'DESC' } })
@Index(['status_id'])
@Index(['student_id'])
export class EligibilityStatus {

  @PrimaryGeneratedColumn({ type: 'int', name: 'status_id' })
  status_id: number;

  @Column({ 
    type: 'int', 
    nullable: false,
    name: 'student_id',
    comment: 'Foreign key to students table'
  })
  student_id: number;

  @Column({
    type: 'boolean',
    default: false,
    name: 'classes_completed',
    comment: 'Whether classes are completed'
  })
  classes_completed: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'fees_paid',
    comment: 'Whether fees are paid'
  })
  fees_paid: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'assignments_submitted',
    comment: 'Whether assignments are submitted'
  })
  assignments_submitted: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'documents_submitted',
    comment: 'Whether documents are submitted'
  })
  documents_submitted: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'trainer_consent',
    comment: 'Whether trainer has given consent'
  })
  trainer_consent: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'override_requested',
    comment: 'Whether override is requested'
  })
  override_requested: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'manual_override',
    comment: 'Whether manual override is applied'
  })
  manual_override: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'manual_handling',
    comment: 'Whether manual handling is required'
  })
  manual_handling: boolean;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'requested_by',
    comment: 'Who requested the override'
  })
  requested_by?: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'reason',
    comment: 'Reason for override'
  })
  reason?: string;

  @Column({ 
    type: 'text', 
    nullable: true,
    name: 'comments',
    comment: 'Additional comments'
  })
  comments?: string;

  @Column({
    type: 'enum',
    enum: ['eligible', 'not_eligible', 'pending', 'override'],
    default: 'not_eligible',
    name: 'overall_status',
    comment: 'Overall eligibility status'
  })
  overall_status: 'eligible' | 'not_eligible' | 'pending' | 'override';

  // Relationship
  @ManyToOne(() => Student, student => student.eligibility_status, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  // Helper methods
  isEligible(): boolean {
    return this.overall_status === 'eligible';
  }

  isComplete(): boolean {
    return this.classes_completed && 
           this.fees_paid && 
           this.assignments_submitted && 
           this.documents_submitted && 
           this.trainer_consent;
  }

  needsOverride(): boolean {
    return this.override_requested && !this.isComplete();
  }
}