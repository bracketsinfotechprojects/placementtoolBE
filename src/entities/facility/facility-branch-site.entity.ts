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

@Entity('facility_branch_site', { orderBy: { branch_id: 'DESC' } })
@Index(['branch_id'])
@Index(['facility_id'])
export class FacilityBranchSite extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int', name: 'branch_id' })
  branch_id: number;

  @Column({ 
    type: 'int',
    nullable: false,
    name: 'facility_id',
    comment: 'Foreign key to facility table'
  })
  facility_id: number;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: true,
    name: 'site_code',
    comment: 'Site code'
  })
  site_code: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'full_address',
    comment: 'Full address'
  })
  full_address: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'suburb',
    comment: 'Suburb'
  })
  suburb: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'city',
    comment: 'City'
  })
  city: string;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: true,
    name: 'state',
    comment: 'State'
  })
  state: string;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: true,
    name: 'postcode',
    comment: 'Postcode'
  })
  postcode: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'site_type',
    comment: 'Site type'
  })
  site_type: string;

  @Column({ 
    type: 'boolean',
    nullable: false,
    name: 'palliative_care',
    comment: 'Palliative care available',
    default: false
  })
  palliative_care: boolean;

  @Column({ 
    type: 'boolean',
    nullable: false,
    name: 'dementia_care',
    comment: 'Dementia care available',
    default: false
  })
  dementia_care: boolean;

  @Column({ 
    type: 'int',
    nullable: true,
    name: 'num_beds',
    comment: 'Number of beds'
  })
  num_beds: number;

  @Column({ 
    type: 'text', 
    nullable: true,
    name: 'gender_rules',
    comment: 'Gender rules'
  })
  gender_rules: string;

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
    name: 'contact_role',
    comment: 'Contact role'
  })
  contact_role: string;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: true,
    name: 'contact_phone',
    comment: 'Contact phone'
  })
  contact_phone: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'contact_email',
    comment: 'Contact email'
  })
  contact_email: string;

  @Column({ 
    type: 'text', 
    nullable: true,
    name: 'contact_comments',
    comment: 'Contact comments'
  })
  contact_comments: string;

  // Relations
  @ManyToOne(() => Facility, facility => facility.branches)
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  toJSON() {
    const { ...result } = this;
    return result;
  }
}
