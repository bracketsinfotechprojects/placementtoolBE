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

@Entity('facility_rules', { orderBy: { rule_id: 'DESC' } })
@Index(['rule_id'])
@Index(['facility_id'])
export class FacilityRule extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int', name: 'rule_id' })
  rule_id: number;

  @Column({ 
    type: 'int',
    nullable: false,
    name: 'facility_id',
    comment: 'Foreign key to facility table'
  })
  facility_id: number;

  @Column({ 
    type: 'text', 
    nullable: true,
    name: 'obligations',
    comment: 'General obligations'
  })
  obligations: string;

  @Column({ 
    type: 'text', 
    nullable: true,
    name: 'obligations_univ',
    comment: 'University obligations'
  })
  obligations_univ: string;

  @Column({ 
    type: 'text', 
    nullable: true,
    name: 'obligations_student',
    comment: 'Student obligations'
  })
  obligations_student: string;

  @Column({ 
    type: 'text', 
    nullable: true,
    name: 'process_notes',
    comment: 'Process notes'
  })
  process_notes: string;

  @Column({ 
    type: 'text', 
    nullable: true,
    name: 'shift_rules',
    comment: 'Shift rules'
  })
  shift_rules: string;

  @Column({ 
    type: 'text', 
    nullable: true,
    name: 'attendance_policy',
    comment: 'Attendance policy'
  })
  attendance_policy: string;

  @Column({ 
    type: 'text', 
    nullable: true,
    name: 'dress_code',
    comment: 'Dress code'
  })
  dress_code: string;

  @Column({ 
    type: 'text', 
    nullable: true,
    name: 'behaviour_rules',
    comment: 'Behaviour rules'
  })
  behaviour_rules: string;

  @Column({ 
    type: 'text', 
    nullable: true,
    name: 'special_instr',
    comment: 'Special instructions'
  })
  special_instr: string;

  // Relations
  @ManyToOne(() => Facility, facility => facility.rules)
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  toJSON() {
    const { ...result } = this;
    return result;
  }
}
