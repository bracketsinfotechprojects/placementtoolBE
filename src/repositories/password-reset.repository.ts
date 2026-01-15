import { EntityRepository, Repository } from 'typeorm';
import { PasswordReset } from '../entities/user/password-reset.entity';

@EntityRepository(PasswordReset)
export class PasswordResetRepository extends Repository<PasswordReset> {
  
  /**
   * Find active (non-expired) password reset by user ID and OTP
   */
  async findActiveResetByUserAndOtp(userId: number, otp: string): Promise<PasswordReset | undefined> {
    return this.createQueryBuilder('pr')
      .where('pr.user_id = :userId', { userId })
      .andWhere('pr.otp = :otp', { otp })
      .andWhere('pr.expiry > :now', { now: new Date() })
      .andWhere('pr.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('pr.createdAt', 'DESC')
      .getOne();
  }

  /**
   * Find latest password reset for a user
   */
  async findLatestByUserId(userId: number): Promise<PasswordReset | undefined> {
    return this.createQueryBuilder('pr')
      .where('pr.user_id = :userId', { userId })
      .andWhere('pr.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('pr.createdAt', 'DESC')
      .getOne();
  }

  /**
   * Delete all password resets for a user (hard delete)
   */
  async deleteAllByUserId(userId: number): Promise<void> {
    await this.createQueryBuilder()
      .delete()
      .from(PasswordReset)
      .where('user_id = :userId', { userId })
      .execute();
  }

  /**
   * Clean up expired password resets (hard delete)
   */
  async cleanupExpiredResets(): Promise<number> {
    const result = await this.createQueryBuilder()
      .delete()
      .from(PasswordReset)
      .where('expiry < :now', { now: new Date() })
      .execute();
    
    return result.affected || 0;
  }
}
