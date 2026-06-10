import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  JoinColumn,
  CreateDateColumn
} from 'typeorm';
import { Student } from '../student/student.entity';
import { Trainer } from '../trainer/trainer.entity';
import { User } from '../user/user.entity';

export enum AssignmentType {
  COURSE = 'course',
  PLACEMENT = 'placement'
}

@Entity('certificates', { orderBy: { certificate_id: 'DESC' } })
@Index(['student_id'])
@Index(['assignment_id'])
@Index(['assignment_type'])
@Index(['student_id', 'assignment_id'])
export class Certificate {

  @PrimaryGeneratedColumn({ type: 'int', name: 'certificate_id' })
  certificate_id: number;

  @Column({
    type: 'int',
    nullable: false,
    name: 'student_id',
    comment: 'Foreign key to students table'
  })
  student_id: number;

  @Column({
    type: 'enum',
    enum: AssignmentType,
    nullable: false,
    name: 'assignment_type',
    comment: 'Type of assignment: course or placement'
  })
  assignment_type: AssignmentType;

  @Column({
    type: 'int',
    nullable: false,
    name: 'assignment_id',
    comment: 'Foreign key to CourseAssignments or PlacementAssignments table'
  })
  assignment_id: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    name: 'certificate_file_path',
    comment: 'Path/URL to certificate file'
  })
  certificate_file_path: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at'
  })
  created_at: Date;

  @Column({
    type: 'int',
    nullable: false,
    name: 'created_by_user_id',
    comment: 'User who uploaded the certificate'
  })
  created_by_user_id: number;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'is_deleted',
    comment: 'Soft delete flag'
  })
  is_deleted: boolean;

  // Relations
  @ManyToOne(() => Student, { eager: false })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'created_by_user_id', referencedColumnName: 'id' })
  created_by: User;

  toJSON() {
    const { ...result } = this;
    return result;
  }
}
