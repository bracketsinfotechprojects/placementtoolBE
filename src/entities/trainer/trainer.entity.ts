import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  Index,
  CreateDateColumn, 
  UpdateDateColumn
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';

@Entity('Trainer', { orderBy: { trainer_id: 'DESC' } })
@Index(['trainer_id'])
@Index(['email'], { unique: true })
@Index(['mobile_number'])
export class Trainer extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int', name: 'trainer_id' })
  trainer_id: number;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: false,
    name: 'first_name',
    comment: 'First name of the trainer'
  })
  first_name: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: false,
    name: 'last_name',
    comment: 'Last name of the trainer'
  })
  last_name: string;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: false,
    name: 'gender',
    comment: 'Gender of the trainer'
  })
  gender: string;

  @Column({ 
    type: 'date', 
    nullable: false,
    name: 'date_of_birth',
    comment: 'Date of birth of the trainer'
  })
  date_of_birth: Date;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: false,
    name: 'mobile_number',
    comment: 'Mobile number of the trainer'
  })
  mobile_number: string;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: true,
    name: 'alternate_contact',
    comment: 'Alternate contact number of the trainer'
  })
  alternate_contact: string;

  @Column({ 
    type: 'varchar', 
    length: 150, 
    nullable: false,
    name: 'email',
    unique: true,
    comment: 'Email ID of the trainer'
  })
  email: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'trainer_type',
    comment: 'Type of trainer (e.g., Full-time, Part-time, Contract)'
  })
  trainer_type: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'course_auth',
    comment: 'Course authorization/qualifications'
  })
  course_auth: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'acc_numbers',
    comment: 'Account numbers or identifiers'
  })
  acc_numbers: string;

  @Column({ 
    type: 'int', 
    nullable: true,
    name: 'yoe',
    comment: 'Years of experience'
  })
  yoe: number;

  @Column({ 
    type: 'json',
    nullable: true,
    name: 'state_covered',
    comment: 'Array of states covered by the trainer'
  })
  state_covered: string[];

  @Column({ 
    type: 'json',
    nullable: true,
    name: 'cities_covered',
    comment: 'Array of cities covered by the trainer'
  })
  cities_covered: string[];

  @Column({ 
    type: 'json',
    nullable: true,
    name: 'available_days',
    comment: 'Array of available days (e.g., Monday, Tuesday)'
  })
  available_days: string[];

  @Column({ 
    type: 'json',
    nullable: true,
    name: 'time_slots',
    comment: 'Array of available time slots'
  })
  time_slots: string[];

  @Column({ 
    type: 'boolean',
    nullable: false,
    name: 'suprise_visit',
    default: false,
    comment: 'Whether trainer can do surprise visits'
  })
  suprise_visit: boolean;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'photograph',
    comment: 'Path to photograph file'
  })
  photograph: string;

  @Column({ 
    type: 'int',
    nullable: true,
    name: 'user_id',
    comment: 'Foreign key to users table for login credentials'
  })
  user_id: number;

  toJSON() {
    const { ...result } = this;
    return result;
  }
}
