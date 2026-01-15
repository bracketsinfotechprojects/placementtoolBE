import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    Index,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { User } from './user.entity';

@Entity('password_resets', { orderBy: { id: 'DESC' } })
@Index(['id'])
@Index(['user_id'])
@Index(['expiry'])
export class PasswordReset extends BaseEntity {

    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;

    @Column({
        type: 'int',
        nullable: false,
        name: 'user_id',
        comment: 'Foreign key to users table'
    })
    user_id: number;

    @Column({
        type: 'varchar',
        length: 10,
        nullable: false,
        name: 'otp',
        comment: 'One-time password for reset'
    })
    otp: string;

    @Column({
        type: 'datetime',
        nullable: false,
        name: 'expiry',
        comment: 'OTP expiration timestamp'
    })
    expiry: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    // Helper method to check if OTP is expired
    isExpired(): boolean {
        return new Date() > this.expiry;
    }

    // Helper method to check if OTP is valid
    isValid(providedOtp: string): boolean {
        return !this.isExpired() && this.otp === providedOtp;
    }
}
