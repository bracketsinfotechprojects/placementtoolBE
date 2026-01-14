import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  Index,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Facility } from './facility.entity';

export enum DealWithType {
  HEAD_OFFICE = 'Head Office',
  BRANCH = 'Branch',
  BOTH = 'Both'
}

@Entity('facility_organization_structure', { orderBy: { org_struct_id: 'DESC' } })
@Index(['org_struct_id'])
@Index(['facility_id'])
export class FacilityOrganizationStructure extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int', name: 'org_struct_id' })
  org_struct_id: number;

  @Column({ 
    type: 'int',
    nullable: false,
    name: 'facility_id',
    comment: 'Foreign key to facility table'
  })
  facility_id: number;

  @Column({ 
    type: 'enum',
    enum: DealWithType,
    nullable: false,
    name: 'deal_with',
    comment: 'Deal with type (Head Office, Branch, or Both)'
  })
  deal_with: DealWithType;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'head_office_addr',
    comment: 'Head office address'
  })
  head_office_addr: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'contact_name',
    comment: 'Contact name'
  })
  contact_name: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'designation',
    comment: 'Designation'
  })
  designation: string;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: true,
    name: 'phone',
    comment: 'Phone number'
  })
  phone: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'email',
    comment: 'Email address'
  })
  email: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'alternate_contact',
    comment: 'Alternate contact'
  })
  alternate_contact: string;

  @Column({ 
    type: 'text', 
    nullable: true,
    name: 'notes',
    comment: 'Additional notes'
  })
  notes: string;

  // Relations
  @ManyToOne(() => Facility, facility => facility.organizationStructures)
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  toJSON() {
    const { ...result } = this;
    return result;
  }
}
