import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity('career_job_student_mapping', { orderBy: { id: 'DESC' } })
@Index(['job_id', 'student_id'], { unique: true })
export class CareerJobStudentMapping {

  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'int', nullable: false, name: 'job_id' })
  job_id: number;

  @Column({ type: 'int', nullable: false, name: 'student_id' })
  student_id: number;

  @Column({ type: 'int', nullable: false, name: 'assigned_by' })
  assigned_by: number;

  @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP', name: 'assigned_date' })
  assigned_date: Date;

  @Column({ type: 'varchar', length: 20, nullable: false, default: 'active', name: 'status' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
