import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  Index,
  CreateDateColumn, 
  UpdateDateColumn
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';

@Entity('placement_executives', { orderBy: { executive_id: 'DESC' } })
@Index(['executive_id'])
@Index(['email'], { unique: true })
@Index(['mobile_number'])
export class PlacementExecutive extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int', name: 'executive_id' })
  executive_id: number;

  @Column({ 
    type: 'varchar', 
    length: 150, 
    nullable: false,
    name: 'full_name',
    comment: 'Full name of the placement executive'
  })
  full_name: string;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: false,
    name: 'mobile_number',
    comment: 'Mobile number of the placement executive'
  })
  mobile_number: string;

  @Column({ 
    type: 'varchar', 
    length: 150, 
    nullable: true,
    name: 'email',
    unique: true,
    comment: 'Email ID of the placement executive'
  })
  email: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'photograph',
    comment: 'Path to photograph file'
  })
  photograph: string;

  @Column({ 
    type: 'date', 
    nullable: false,
    name: 'joining_date',
    comment: 'Date when the executive joined'
  })
  joining_date: Date;

  @Column({ 
    type: 'enum',
    enum: ['full-time', 'part-time', 'contract'],
    nullable: false,
    name: 'employment_type',
    comment: 'Type of employment'
  })
  employment_type: 'full-time' | 'part-time' | 'contract';

  @Column({ 
    type: 'json',
    nullable: true,
    name: 'facility_types_handled',
    comment: 'Array of facility types handled (Aged Care, Disability, Home Care)'
  })
  facility_types_handled: string[];

  @Column({ 
    type: 'int',
    nullable: true,
    name: 'user_id',
    comment: 'Foreign key to users table for login credentials'
  })
  user_id: number;

  @Column({
    type: 'boolean',
    nullable: false,
    name: 'isDeleted',
    comment: 'Soft delete flag',
    default: false
  })
  isDeleted: boolean;

  @CreateDateColumn({
    type: 'datetime',
    name: 'createdAt',
    comment: 'Record creation timestamp'
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'datetime',
    name: 'updatedAt',
    comment: 'Record last update timestamp'
  })
  updatedAt: Date;

  toJSON() {
    const { ...result } = this;
    return result;
  }
}
