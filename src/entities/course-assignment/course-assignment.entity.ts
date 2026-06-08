import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
  UpdateDateColumn
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Student } from '../student/student.entity';
import { CourseSlots } from '../course-slots/course-slots.entity';
import { Trainer } from '../trainer/trainer.entity';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EARLY_DEPARTURE = 'early_departure',
  HALF_DAY = 'half_day',
  LEAVE = 'leave'
}

@Entity('CourseAssignments')
@Index(['course_id'])
@Index(['trainer_id'])
@Index(['student_id'])
@Unique('UQ_CourseAssignments_unique', ['course_id', 'trainer_id', 'student_id'])
export class CourseAssignment extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int', name: 'assignment_id' })
  assignment_id: number;

  // Foreign Keys
  @Column({ 
    type: 'int', 
    nullable: false,
    name: 'course_id',
    comment: 'Reference to CourseSlots table'
  })
  course_id: number;

  @Column({ 
    type: 'int', 
    nullable: false,
    name: 'trainer_id',
    comment: 'Reference to Trainer table'
  })
  trainer_id: number;

  @Column({ 
    type: 'int', 
    nullable: false,
    name: 'student_id',
    comment: 'Reference to students table'
  })
  student_id: number;

  // Metadata
  @Column({ 
    type: 'date', 
    nullable: true,
    default: () => 'CURRENT_DATE',
    name: 'enrollment_date',
    comment: 'Date when student was enrolled in the course'
  })
  enrollment_date: Date;

  @Column({ 
    type: 'enum', 
    enum: ['Active', 'Completed', 'Dropped'],
    nullable: false,
    default: 'Active',
    name: 'status',
    comment: 'Status of the assignment'
  })
  status: 'Active' | 'Completed' | 'Dropped';

  // Attendance Fields
  @Column({ 
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.ABSENT,
    nullable: false,
    name: 'attendance_status',
    comment: 'Attendance status (present, absent, late, early_departure, half_day, leave)'
  })
  attendance_status: AttendanceStatus;

  @Column({ 
    type: 'date',
    nullable: true,
    name: 'attendance_date',
    comment: 'Date of attendance mark'
  })
  attendance_date: Date;

  @Column({ 
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'trainer_notes',
    comment: 'Notes from trainer regarding attendance'
  })
  trainer_notes: string;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    name: 'attendance_updated_at',
    comment: 'When attendance was last updated'
  })
  attendance_updated_at: Date;

  // Relationships
  @ManyToOne(() => CourseSlots, { eager: false })
  @JoinColumn({ name: 'course_id' })
  course: CourseSlots;

  @ManyToOne(() => Trainer, { eager: false })
  @JoinColumn({ name: 'trainer_id' })
  trainer: Trainer;

  @ManyToOne(() => Student, { eager: false })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  toJSON() {
    const { ...result } = this;
    return result;
  }
}
