import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { Student } from './student.entity';

@Entity('address_change_requests', { orderBy: { acr_id: 'DESC' } })
@Index(['acr_id'])
@Index(['student_id'])
export class AddressChangeRequest {

  @PrimaryGeneratedColumn({ type: 'int', name: 'acr_id' })
  acr_id: number;

  @Column({ 
    type: 'int', 
    nullable: false,
    name: 'student_id',
    comment: 'Foreign key to students table'
  })
  student_id: number;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'current_address',
    comment: 'Current address'
  })
  current_address?: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'new_address',
    comment: 'Requested new address'
  })
  new_address?: string;

  @Column({ 
    type: 'date', 
    nullable: true,
    name: 'effective_date',
    comment: 'When the address change should take effect'
  })
  effective_date?: Date;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'change_reason',
    comment: 'Reason for address change'
  })
  change_reason?: string;

  @Column({
    type: 'boolean',
    default: false,
    name: 'impact_acknowledged',
    comment: 'Whether impact has been acknowledged'
  })
  impact_acknowledged: boolean;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected', 'implemented'],
    default: 'pending',
    name: 'status',
    comment: 'Status of the address change request'
  })
  status: 'pending' | 'approved' | 'rejected' | 'implemented';

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'reviewed_at',
    comment: 'When the request was reviewed'
  })
  reviewed_at?: Date;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'reviewed_by',
    comment: 'Who reviewed the request'
  })
  reviewed_by?: string;

  @Column({ 
    type: 'text', 
    nullable: true,
    name: 'review_comments',
    comment: 'Comments from review'
  })
  review_comments?: string;

  // Relationship
  @ManyToOne(() => Student, student => student.address_change_requests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  // Helper methods
  isPending(): boolean {
    return this.status === 'pending';
  }

  isApproved(): boolean {
    return this.status === 'approved';
  }

  isImplemented(): boolean {
    return this.status === 'implemented';
  }

  needsReview(): boolean {
    return this.status === 'pending' && this.impact_acknowledged;
  }
}