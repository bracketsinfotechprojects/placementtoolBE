import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  Index,
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
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
    type: 'varchar',
    length: 20,
    nullable: false,
    name: 'status',
    comment: 'User status (active, inactive, etc.)',
    default: 'active'
  })
  status: string;

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
