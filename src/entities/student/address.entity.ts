import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { Student } from './student.entity';

@Entity('addresses', { orderBy: { address_id: 'DESC' } })
@Index(['address_id'])
@Index(['student_id'])
export class Address {

  @PrimaryGeneratedColumn({ type: 'int', name: 'address_id' })
  address_id: number;

  @Column({ 
    type: 'int', 
    nullable: false,
    name: 'student_id',
    comment: 'Foreign key to students table'
  })
  student_id: number;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'line1',
    comment: 'Address line 1'
  })
  line1?: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    name: 'line2',
    comment: 'Address line 2'
  })
  line2?: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'suburb',
    comment: 'Suburb'
  })
  suburb?: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'city',
    comment: 'City'
  })
  city?: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'state',
    comment: 'State/Province'
  })
  state?: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    name: 'country',
    comment: 'Country'
  })
  country?: string;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: true,
    name: 'postal_code',
    comment: 'Postal/ZIP code'
  })
  postal_code?: string;

  @Column({
    type: 'enum',
    enum: ['current', 'permanent', 'temporary', 'mailing'],
    default: 'current',
    name: 'address_type',
    comment: 'Type of address'
  })
  address_type: 'current' | 'permanent' | 'temporary' | 'mailing';

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_primary',
    comment: 'Is this the primary address'
  })
  is_primary: boolean;

  // Relationship
  @ManyToOne(() => Student, student => student.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  // Helper methods
  getFullAddress(): string {
    const parts = [this.line1, this.line2, this.suburb, this.city, this.state, this.country, this.postal_code];
    return parts.filter(part => part).join(', ');
  }

  isPrimary(): boolean {
    return this.is_primary;
  }
}