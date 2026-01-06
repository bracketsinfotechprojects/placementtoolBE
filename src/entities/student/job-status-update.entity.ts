import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { Student } from './student.entity';

@Entity('job_status_updates', { orderBy: { jsu_id: 'DESC' } })
@Index(['jsu_id'])
@Index(['student_id'])
@Index(['status'])
@Index(['last_updated_on'])
export class JobStatusUpdate {

  @PrimaryGeneratedColumn({ type: 'int', name: 'jsu_id' })
  jsu_id: number;

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
    nullable: false,
    name: 'status',
    comment: 'Job status'
  })
  status: string;

  @Column({ 
    type: 'date', 
    nullable: false,
    name: 'last_updated_on',
    comment: 'When the status was last updated'
  })
  last_updated_on: Date;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'employer_name',
    comment: 'Name of the employer'
  })
  employer_name?: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'job_role',
    comment: 'Job role or position'
  })
  job_role?: string;

  @Column({ 
    type: 'date', 
    nullable: true,
    name: 'start_date',
    comment: 'Job start date'
  })
  start_date?: Date;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: true,
    name: 'employment_type',
    comment: 'Type of employment (full-time, part-time, contract)'
  })
  employment_type?: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'offer_letter_path',
    comment: 'Path to offer letter document'
  })
  offer_letter_path?: string;

  @Column({
    type: 'boolean',
    default: false,
    name: 'actively_applying',
    comment: 'Whether student is actively applying for jobs'
  })
  actively_applying: boolean;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'expected_timeline',
    comment: 'Expected timeline for job placement'
  })
  expected_timeline?: string;

  @Column({ 
    type: 'text', 
    nullable: true,
    name: 'searching_comments',
    comment: 'Comments about job searching'
  })
  searching_comments?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'created_at',
    comment: 'Record creation timestamp'
  })
  created_at?: Date;

  // Relationship
  @ManyToOne(() => Student, student => student.job_status_updates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  // Helper methods
  isActive(): boolean {
    const status = this.status.toLowerCase();
    return status === 'applied' || status === 'interviewing' || status === 'offer_received' || status === 'employed';
  }

  isEmployed(): boolean {
    return this.status.toLowerCase() === 'employed';
  }

  hasJob(): boolean {
    return !!(this.employer_name && this.job_role);
  }

  isRecent(days: number = 30): boolean {
    if (!this.last_updated_on) return false;
    const today = new Date();
    const updated = new Date(this.last_updated_on);
    const diffTime = today.getTime() - updated.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
  }
}