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

@Entity('facility_documents_required', { orderBy: { doc_req_id: 'DESC' } })
@Index(['doc_req_id'])
@Index(['facility_id'])
export class FacilityDocumentRequired extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int', name: 'doc_req_id' })
  doc_req_id: number;

  @Column({ 
    type: 'int',
    nullable: false,
    name: 'facility_id',
    comment: 'Foreign key to facility table'
  })
  facility_id: number;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'document_name',
    comment: 'Document name'
  })
  document_name: string;

  @Column({ 
    type: 'int',
    nullable: true,
    name: 'notice_period_days',
    comment: 'Notice period in days'
  })
  notice_period_days: number;

  @Column({ 
    type: 'boolean',
    nullable: true,
    name: 'orientation_req',
    comment: 'Orientation required'
  })
  orientation_req: boolean;

  @Column({ 
    type: 'boolean',
    nullable: true,
    name: 'facilitator_req',
    comment: 'Facilitator required'
  })
  facilitator_req: boolean;

  // Relations
  @ManyToOne(() => Facility, facility => facility.documentsRequired)
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  toJSON() {
    const { ...result } = this;
    return result;
  }
}
