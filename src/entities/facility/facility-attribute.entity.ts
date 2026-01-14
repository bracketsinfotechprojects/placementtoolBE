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

export enum AttributeType {
  CATEGORY = 'Category',
  STATE = 'State'
}

@Entity('facility_attributes', { orderBy: { attribute_id: 'DESC' } })
@Index(['attribute_id'])
@Index(['facility_id'])
export class FacilityAttribute extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int', name: 'attribute_id' })
  attribute_id: number;

  @Column({ 
    type: 'int',
    nullable: false,
    name: 'facility_id',
    comment: 'Foreign key to facility table'
  })
  facility_id: number;

  @Column({ 
    type: 'enum',
    enum: AttributeType,
    nullable: false,
    name: 'attribute_type',
    comment: 'Type of attribute (Category or State)'
  })
  attribute_type: AttributeType;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: false,
    name: 'attribute_value',
    comment: 'Attribute value'
  })
  attribute_value: string;

  // Relations
  @ManyToOne(() => Facility, facility => facility.attributes)
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  toJSON() {
    const { ...result } = this;
    return result;
  }
}
