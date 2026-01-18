import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  Index,
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany,
  Unique
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { ContactDetails } from './contact-details.entity';
import { VisaDetails } from './visa-details.entity';
import { Address } from './address.entity';
import { EligibilityStatus } from './eligibility-status.entity';
import { StudentLifestyle } from './student-lifestyle.entity';
import { PlacementPreferences } from './placement-preferences.entity';
import { FacilityRecords } from './facility-records.entity';
import { AddressChangeRequest } from './address-change-request.entity';
import { JobStatusUpdate } from './job-status-update.entity';
import { SelfPlacement } from './self-placement.entity';

@Entity('students', { orderBy: { student_id: 'DESC' } })
@Index(['student_id'])
@Index(['first_name', 'last_name'])
@Index(['nationality'])
@Index(['student_type'])
@Index(['createdAt'])
export class Student extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int', name: 'student_id' })
  student_id: number;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: false,
    name: 'first_name',
    comment: 'Student first name'
  })
  first_name: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: false,
    name: 'last_name',
    comment: 'Student last name'
  })
  last_name: string;

  @Column({ 
    type: 'date', 
    nullable: false,
    name: 'dob',
    comment: 'Date of birth'
  })
  dob: Date;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: true,
    name: 'gender',
    comment: 'Student gender'
  })
  gender?: string;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: true,
    name: 'nationality',
    comment: 'Student nationality'
  })
  nationality?: string;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: true,
    name: 'student_type',
    comment: 'Type of student (domestic/international)'
  })
  student_type?: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'graduated', 'withdrawn'],
    default: 'active',
    name: 'status',
    comment: 'Student status'
  })
  status: 'active' | 'inactive' | 'graduated' | 'withdrawn';

  // Relationships
  @OneToMany(() => ContactDetails, contact => contact.student, { cascade: true })
  contact_details: ContactDetails[];

  @OneToMany(() => VisaDetails, visa => visa.student, { cascade: true })
  visa_details: VisaDetails[];

  @OneToMany(() => Address, address => address.student, { cascade: true })
  addresses: Address[];

  @OneToMany(() => EligibilityStatus, eligibility => eligibility.student, { cascade: true })
  eligibility_status: EligibilityStatus[];

  @OneToMany(() => StudentLifestyle, lifestyle => lifestyle.student, { cascade: true })
  student_lifestyle: StudentLifestyle[];

  @OneToMany(() => PlacementPreferences, preferences => preferences.student, { cascade: true })
  placement_preferences: PlacementPreferences[];

  @OneToMany(() => FacilityRecords, facility => facility.student, { cascade: true })
  facility_records: FacilityRecords[];

  @OneToMany(() => AddressChangeRequest, request => request.student, { cascade: true })
  address_change_requests: AddressChangeRequest[];

  @OneToMany(() => JobStatusUpdate, jobStatus => jobStatus.student, { cascade: true })
  job_status_updates: JobStatusUpdate[];

  @OneToMany(() => SelfPlacement, selfPlacement => selfPlacement.student, { cascade: true })
  self_placements: SelfPlacement[];

  // Virtual properties
  get fullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }

  get age(): number {
    if (!this.dob) return 0;
    const today = new Date();
    const birthDate = new Date(this.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // Helper methods
  isActive(): boolean {
    return this.status === 'active';
  }

  isInternational(): boolean {
    return this.student_type?.toLowerCase() === 'international';
  }

  toJSON() {
    const { ...result } = this;
    return result;
  }

  toSafeJSON() {
    // For public API responses
    const { status, createdAt, updatedAt, ...result } = this;
    return result;
  }
}