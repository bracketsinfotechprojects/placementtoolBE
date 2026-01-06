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

@Entity('contact_details', { orderBy: { contact_id: 'DESC' } })
@Unique(['email'])
@Index(['contact_id'])
@Index(['student_id'])
export class ContactDetails {

  @PrimaryGeneratedColumn({ type: 'int', name: 'contact_id' })
  contact_id: number;

  @Column({ 
    type: 'int', 
    nullable: false,
    name: 'student_id',
    comment: 'Foreign key to students table'
  })
  student_id: number;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: true,
    name: 'primary_mobile',
    comment: 'Primary mobile number'
  })
  primary_mobile?: string;

  @Column({ 
    type: 'varchar', 
    length: 150, 
    nullable: true,
    name: 'email',
    comment: 'Email address'
  })
  email?: string;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: true,
    name: 'emergency_contact',
    comment: 'Emergency contact number'
  })
  emergency_contact?: string;

  @Column({
    type: 'enum',
    enum: ['mobile', 'landline', 'whatsapp'],
    default: 'mobile',
    name: 'contact_type',
    comment: 'Type of contact method'
  })
  contact_type: 'mobile' | 'landline' | 'whatsapp';

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_primary',
    comment: 'Is this the primary contact method'
  })
  is_primary: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'verified_at',
    comment: 'When the contact was verified'
  })
  verified_at?: Date;

  // Relationship
  @ManyToOne(() => Student, student => student.contact_details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  // Helper methods
  isVerified(): boolean {
    return this.verified_at !== null && this.verified_at !== undefined;
  }

  isPrimaryContact(): boolean {
    return this.is_primary;
  }
}