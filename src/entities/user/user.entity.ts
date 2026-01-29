import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  Index,
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import PasswordUtility from '../../utilities/password.utility';

// Import Role entity when it exists
// import { Role } from './role.entity';

@Entity('users', { orderBy: { id: 'DESC' } })
@Index(['id'])
@Index(['loginID'], { unique: true })
@Index(['roleID'])
@Index(['status'])
export class User extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: false,
    name: 'loginID',
    comment: 'User login identifier',
    unique: true
  })
  loginID: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: false,
    name: 'password',
    comment: 'Encrypted user password'
  })
  password: string;

  @Column({ 
    type: 'int',
    nullable: false,
    name: 'roleID',
    comment: 'Foreign key to roles table'
  })
  roleID: number;

  @Column({ 
    type: 'int',
    nullable: true,
    name: 'studentID',
    comment: 'Foreign key to students table (for student users)'
  })
  studentID: number;

  @Column({ 
    type: 'int',
    nullable: true,
    name: 'facilityID',
    comment: 'Foreign key to facilities table (for facility users with roleID = 2)'
  })
  facilityID: number;

  @Column({ 
    type: 'int',
    nullable: true,
    name: 'supervisorID',
    comment: 'Foreign key to supervisors table (for supervisor users with roleID = 3)'
  })
  supervisorID: number;

  @Column({ 
    type: 'int',
    nullable: true,
    name: 'placementExecutiveID',
    comment: 'Foreign key to placement_executives table (for placement executive users with roleID = 4)'
  })
  placementExecutiveID: number;

  @Column({ 
    type: 'int',
    nullable: true,
    name: 'trainerID',
    comment: 'Foreign key to trainers table (for trainer users with roleID = 5)'
  })
  trainerID: number;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
    name: 'status',
    comment: 'User status (active, inactive, etc.)',
    default: 'active'
  })
  status: string;

  @Column({
    type: 'boolean',
    nullable: false,
    name: 'isDeleted',
    comment: 'Soft delete flag',
    default: false
  })
  isDeleted: boolean;

  // Validation hooks
  @BeforeInsert()
  @BeforeUpdate()
  validateRoleLinks() {
    // Role-specific validation
    const roleValidations: Array<{ roleID: number; field: keyof User; name: string }> = [
      { roleID: 6, field: 'studentID', name: 'Student' },
      { roleID: 2, field: 'facilityID', name: 'Facility' },
      { roleID: 3, field: 'supervisorID', name: 'Supervisor' },
      { roleID: 4, field: 'placementExecutiveID', name: 'Placement Executive' },
      { roleID: 5, field: 'trainerID', name: 'Trainer' }
    ];

    for (const validation of roleValidations) {
      const fieldValue = this[validation.field] as number | null | undefined;
      
      // If field is provided (not null and not undefined), ensure user has the correct role
      if (fieldValue !== null && fieldValue !== undefined) {
        if (this.roleID !== validation.roleID) {
          throw new Error(`${validation.field} can only be set for users with ${validation.name} role (roleID = ${validation.roleID})`);
        }
      }
      
      // If user has this role, the field should be provided (not null and not undefined)
      if (this.roleID === validation.roleID && (fieldValue === null || fieldValue === undefined)) {
        throw new Error(`${validation.name} role users must have a ${validation.field}`);
      }
    }
  }

  // Helper methods
  isActive(): boolean {
    return this.status === 'active';
  }

  isAdmin(): boolean {
    // This would need to be updated based on how you want to check admin role
    // For now, we'll assume roleID 1 is admin, or you could add a roleName lookup
    return this.roleID === 1; // Assuming roleID 1 = Admin
  }

  isStudent(): boolean {
    // Assuming roleID for Student role
    return this.roleID === 6; // Based on the roles insertion order
  }

  // Password verification method
  async verifyPassword(password: string): Promise<boolean> {
    return await PasswordUtility.verifyPassword(password, this.password);
  }

  // Static method to hash password
  static async hashPassword(password: string): Promise<string> {
    return await PasswordUtility.hashPassword(password);
  }

  toSafeJSON() {
    // For public API responses - exclude password
    const { password, ...result } = this;
    return result;
  }

  toJSON() {
    const { ...result } = this;
    return result;
  }
}
