import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  ManyToOne,
  JoinColumn,
  Index,
  Unique
} from 'typeorm';
import { Student } from './student.entity';

@Entity('visa_details', { orderBy: { visa_id: 'DESC' } })
@Unique(['visa_number'])
@Index(['visa_id'])
@Index(['student_id'])
export class VisaDetails {

  @PrimaryGeneratedColumn({ type: 'int', name: 'visa_id' })
  visa_id: number;

  @Column({ 
    type: 'int', 
    nullable: false,
    name: 'student_id',
    comment: 'Foreign key to students table'
  })
  student_id: number;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: true,
    name: 'visa_type',
    comment: 'Type of visa (student, work, tourist, etc.)'
  })
  visa_type?: string;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: true,
    name: 'visa_number',
    comment: 'Visa number'
  })
  visa_number?: string;

  @Column({ 
    type: 'date', 
    nullable: true,
    name: 'start_date',
    comment: 'Visa start date'
  })
  start_date?: Date;

  @Column({ 
    type: 'date', 
    nullable: true,
    name: 'expiry_date',
    comment: 'Visa expiry date'
  })
  expiry_date?: Date;

  @Column({
    type: 'enum',
    enum: ['active', 'expired', 'revoked', 'pending'],
    default: 'active',
    name: 'status',
    comment: 'Visa status'
  })
  status: 'active' | 'expired' | 'revoked' | 'pending';

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'issuing_country',
    comment: 'Country that issued the visa'
  })
  issuing_country?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'document_path',
    comment: 'Path to visa document'
  })
  document_path?: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'work_limitation',
    comment: 'Work limitations or restrictions on visa'
  })
  work_limitation?: string;

  // Relationship
  @ManyToOne(() => Student, student => student.visa_details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  // Helper methods
  isActive(): boolean {
    return this.status === 'active';
  }

  isExpiringSoon(days: number = 30): boolean {
    if (!this.expiry_date) return false;
    const today = new Date();
    const expiry = new Date(this.expiry_date);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days && diffDays > 0;
  }

  isExpired(): boolean {
    if (!this.expiry_date) return false;
    return new Date(this.expiry_date) < new Date();
  }
}