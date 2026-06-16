import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity('career_jobs', { orderBy: { job_id: 'DESC' } })
@Index(['job_id'])
@Index(['is_active'])
export class CareerJob {

  @PrimaryGeneratedColumn({ type: 'int', name: 'job_id' })
  job_id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'designation' })
  designation: string;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'company' })
  company: string;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'location' })
  location: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'salary' })
  salary: string;

  @Column({
    type: 'enum',
    enum: ['full_time', 'part_time', 'contract', 'internship'],
    nullable: true,
    name: 'job_type'
  })
  job_type: 'full_time' | 'part_time' | 'contract' | 'internship';

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'experience_required' })
  experience_required: string;

  @Column({ type: 'text', nullable: true, name: 'description' })
  description: string;

  @Column({ type: 'text', nullable: true, name: 'requirements' })
  requirements: string;

  @Column({ type: 'date', nullable: true, name: 'application_deadline' })
  application_deadline: Date;

  @Column({ type: 'tinyint', width: 1, nullable: false, default: 1, name: 'is_active' })
  is_active: boolean;

  @Column({ type: 'int', nullable: false, name: 'created_by' })
  created_by: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
