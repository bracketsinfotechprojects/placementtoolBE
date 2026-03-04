import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { PlacementSlot } from '../placement-slot/placement-slot.entity';
import { Student } from '../student/student.entity';

@Entity('placement_assignments')
@Index(['placementslot_id'])
@Index(['student_id'])
@Index(['status'])
export class PlacementAssignment {

  @PrimaryGeneratedColumn({ type: 'int', name: 'assignment_id' })
  assignment_id: number;

  // Foreign Keys
  @Column({
    type: 'int',
    nullable: false,
    name: 'placementslot_id',
    comment: 'Reference to placement_slots table'
  })
  placementslot_id: number;

  @Column({
    type: 'int',
    nullable: false,
    name: 'student_id',
    comment: 'Reference to students table'
  })
  student_id: number;

  // Assignment Status
  @Column({
    type: 'enum',
    enum: ['Assigned', 'Active', 'Completed', 'Cancelled', 'Dropped'],
    nullable: false,
    default: 'Assigned',
    name: 'status',
    comment: 'Status of the assignment'
  })
  status: 'Assigned' | 'Active' | 'Completed' | 'Cancelled' | 'Dropped';

  // Assignment Dates
  @Column({
    type: 'date',
    nullable: true,
    name: 'start_date',
    comment: 'Actual start date for this student'
  })
  start_date: Date;

  @Column({
    type: 'date',
    nullable: true,
    name: 'end_date',
    comment: 'Actual end date for this student'
  })
  end_date: Date;

  // Notes
  @Column({
    type: 'text',
    nullable: true,
    name: 'notes',
    comment: 'Notes about this assignment'
  })
  notes: string;

  // Audit
  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    comment: 'Record creation timestamp'
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    comment: 'Record update timestamp'
  })
  updated_at: Date;

  // Relationships
  @ManyToOne(() => PlacementSlot, { eager: false })
  @JoinColumn({ name: 'placementslot_id' })
  placementSlot: PlacementSlot;

  @ManyToOne(() => Student, { eager: false })
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
