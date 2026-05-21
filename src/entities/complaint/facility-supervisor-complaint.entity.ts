import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Facility } from '../facility/facility.entity';
import { FacilitySupervisor } from '../facility-supervisor/facility-supervisor.entity';
import { Student } from '../student/student.entity';

@Entity('facility_supervisor_complaints', { orderBy: { complaint_id: 'DESC' } })
@Index(['complaint_id'])
@Index(['facility_id'])
@Index(['supervisor_id'])
@Index(['student_id'])
@Index(['status'])
@Index(['urgency_level'])
@Index(['createdAt'])
export class FacilitySupervisorComplaint extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int', name: 'complaint_id' })
  complaint_id: number;

  @Column({
    type: 'int',
    nullable: false,
    name: 'facility_id',
    comment: 'Foreign key to facilities table'
  })
  facility_id: number;

  @Column({
    type: 'int',
    nullable: true,
    name: 'supervisor_id',
    comment: 'Foreign key to facility supervisors table'
  })
  supervisor_id: number;

  @Column({
    type: 'int',
    nullable: false,
    name: 'student_id',
    comment: 'Foreign key to students table (student being complained against)'
  })
  student_id: number;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: false,
    name: 'student_name',
    comment: 'Name of the student being complained against'
  })
  student_name: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    name: 'complaint_type',
    comment: 'Type of complaint (e.g., Misconduct, Attendance, Academic, Behavior, Other)'
  })
  complaint_type: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
    name: 'urgency_level',
    comment: 'Urgency level (e.g., Low, Medium, High)'
  })
  urgency_level: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    name: 'location',
    comment: 'Location where the incident occurred (e.g., Building A, Room 203)'
  })
  location: string;

  @Column({
    type: 'text',
    nullable: false,
    name: 'description',
    comment: 'Detailed description of the complaint'
  })
  description: string;

  @Column({
    type: 'json',
    nullable: true,
    name: 'attachments',
    comment: 'Array of file paths for attachments'
  })
  attachments: string[];

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_anonymous',
    comment: 'Whether the complaint is reported anonymously'
  })
  is_anonymous: boolean;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'Pending',
    name: 'status',
    comment: 'Status of complaint (e.g., Pending, In Progress, Resolved, Closed, Rejected)'
  })
  status: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'resolution_notes',
    comment: 'Notes on resolution by admin/supervisor'
  })
  resolution_notes: string;

  @Column({
    type: 'datetime',
    nullable: true,
    name: 'resolved_at',
    comment: 'Timestamp when complaint was resolved'
  })
  resolved_at: Date;

  @ManyToOne(() => Facility, { nullable: false })
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  @ManyToOne(() => FacilitySupervisor, { nullable: false })
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: FacilitySupervisor;

  @ManyToOne(() => Student, { nullable: false })
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
