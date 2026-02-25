import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  Index,
  ManyToOne,
  JoinColumn,
  Unique
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Student } from '../student/student.entity';
import { CourseSlots } from '../course-slots/course-slots.entity';
import { Trainer } from '../trainer/trainer.entity';

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
