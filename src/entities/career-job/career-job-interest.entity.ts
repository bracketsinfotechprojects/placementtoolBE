import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn
} from 'typeorm';

@Entity('career_job_interest', { orderBy: { id: 'DESC' } })
@Index(['job_id', 'student_id'], { unique: true })
export class CareerJobInterest {

  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'int', nullable: false, name: 'job_id' })
  job_id: number;

  @Column({ type: 'int', nullable: false, name: 'student_id' })
  student_id: number;

  @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP', name: 'interest_date' })
  interest_date: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
