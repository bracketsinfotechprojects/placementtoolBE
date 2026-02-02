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

@Entity('facility_agreements', { orderBy: { agreement_id: 'DESC' } })
@Index(['agreement_id'])
@Index(['facility_id'])
export class FacilityAgreement extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int', name: 'agreement_id' })
  agreement_id: number;

  @Column({ 
    type: 'int',
    nullable: false,
    name: 'facility_id',
    comment: 'Foreign key to facility table'
  })
  facility_id: number;

  @Column({ 
    type: 'boolean',
    nullable: true,
    name: 'sent_students',
    comment: 'Whether students have been sent'
  })
  sent_students: boolean;

  @Column({ 
    type: 'boolean',
    nullable: true,
    name: 'with_mou',
    comment: 'With MOU'
  })
  with_mou: boolean;

  @Column({ 
    type: 'boolean',
    nullable: true,
    name: 'no_mou_but_taken',
    comment: 'No MOU but taken'
  })
  no_mou_but_taken: boolean;

  @Column({ 
    type: 'boolean',
    nullable: true,
    name: 'mou_exists_no_spot',
    comment: 'MOU exists but no spot'
  })
  mou_exists_no_spot: boolean;

  @Column({ 
    type: 'int',
    nullable: true,
    name: 'total_students',
    comment: 'Total students'
  })
  total_students: number;

  @Column({ 
    type: 'date',
    nullable: true,
    name: 'last_placement',
    comment: 'Last placement date'
  })
  last_placement: Date;

  @Column({ 
    type: 'boolean',
    nullable: true,
    name: 'has_mou',
    comment: 'Has MOU'
  })
  has_mou: boolean;

  @Column({ 
    type: 'date',
    nullable: true,
    name: 'signed_on',
    comment: 'MOU signed date'
  })
  signed_on: Date;

  @Column({ 
    type: 'date',
    nullable: true,
    name: 'expiry_date',
    comment: 'MOU expiry date'
  })
  expiry_date: Date;

  @Column({ 
    type: 'varchar', 
    length: 100,
    nullable: true,
    name: 'company_name',
    comment: 'Company name (will be changed to JSON array)'
  })
  company_name: string | string[];

  @Column({ 
    type: 'boolean',
    nullable: true,
    name: 'payment_required',
    comment: 'Payment required'
  })
  payment_required: boolean;

  @Column({ 
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'amount_per_spot',
    comment: 'Amount per spot'
  })
  amount_per_spot: number;

  @Column({ 
    type: 'text', 
    nullable: true,
    name: 'payment_notes',
    comment: 'Payment notes'
  })
  payment_notes: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'mou_document',
    comment: 'MOU document path'
  })
  mou_document: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'insurance_doc',
    comment: 'Insurance document path'
  })
  insurance_doc: string;

  // Relations
  @ManyToOne(() => Facility, facility => facility.agreements)
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  toJSON() {
    const { ...result } = this;
    return result;
  }
}
