import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
  Unique
} from 'typeorm';
import { Student } from './student.entity';
import { Facility } from '../facility/facility.entity';

@Entity('student_facility_assignments')
@Index(['student_id'])
@Index(['facility_id'])
@Unique(['student_id', 'facility_id'])
export class StudentFacilityAssignment {

  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({
    type: 'int',
    nullable: false,
    name: 'student_id',
    comment: 'Foreign key to students table'
  })
  student_id: number;

  @Column({
    type: 'int',
    nullable: false,
    name: 'facility_id',
    comment: 'Foreign key to facility table'
  })
  facility_id: number;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'assigned_at',
    comment: 'Timestamp when facility was assigned to student'
  })
  assigned_at: Date;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Facility, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;
}
