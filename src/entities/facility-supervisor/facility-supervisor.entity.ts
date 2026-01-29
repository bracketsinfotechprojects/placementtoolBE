import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  Index,
  CreateDateColumn, 
  UpdateDateColumn
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';

@Entity('FacilitySupervisor', { orderBy: { supervisor_id: 'DESC' } })
@Index(['supervisor_id'])
@Index(['email'], { unique: true })
@Index(['facility_id'])
@Index(['mobile_number'])
export class FacilitySupervisor extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int', name: 'supervisor_id' })
  supervisor_id: number;

  @Column({ 
    type: 'varchar', 
    length: 150, 
    nullable: false,
    name: 'full_name',
    comment: 'Full name of the facility supervisor'
  })
  full_name: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: false,
    name: 'designation',
    comment: 'Designation/title of the supervisor'
  })
  designation: string;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: false,
    name: 'mobile_number',
    comment: 'Mobile number of the supervisor'
  })
  mobile_number: string;

  @Column({ 
    type: 'varchar', 
    length: 150, 
    nullable: true,
    name: 'email',
    unique: true,
    comment: 'Email ID of the supervisor'
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
    type: 'int',
    nullable: false,
    name: 'facility_id',
    comment: 'Foreign key to facilities table'
  })
  facility_id: number;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'facility_name',
    comment: 'Name of the facility (denormalized for quick access)'
  })
  facility_name: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'branch_site',
    comment: 'Branch or site name within the facility'
  })
  branch_site: string;

  @Column({ 
    type: 'json',
    nullable: true,
    name: 'facility_types',
    comment: 'Array of facility types (Aged Care, Disability, Home Care)'
  })
  facility_types: string[];

  @Column({ 
    type: 'text',
    nullable: true,
    name: 'facility_address',
    comment: 'Address of the facility'
  })
  facility_address: string;

  @Column({ 
    type: 'int',
    nullable: true,
    name: 'max_students_can_handle',
    comment: 'Maximum number of students the supervisor can handle'
  })
  max_students_can_handle: number;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'id_proof_document',
    comment: 'Path to ID proof document'
  })
  id_proof_document: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'police_check_document',
    comment: 'Path to police check document'
  })
  police_check_document: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'authorization_letter_document',
    comment: 'Path to authorization letter from facility'
  })
  authorization_letter_document: string;

  @Column({ 
    type: 'boolean',
    nullable: false,
    name: 'portal_access_enabled',
    default: false,
    comment: 'Whether supervisor has portal access'
  })
  portal_access_enabled: boolean;

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
