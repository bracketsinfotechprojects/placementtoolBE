import * as cron from 'node-cron';
import { getCustomRepository } from 'typeorm';
import { PasswordResetRepository } from '../repositories/password-reset.repository';
import logger from '../configs/logger.config';

/**
 * Cron job to clean up expired password reset OTPs
 * Runs every hour to delete expired OTP records from the database
 */
class PasswordResetCleanupJob {
    private cronExpression: string;
    private task: cron.ScheduledTask | null = null;

    constructor() {
        // Run every hour at minute 0
        // Format: minute hour day month weekday
        // "0 * * * *" = At minute 0 of every hour
        this.cronExpression = '0 * * * *';
    }

    /**
     * Start the cron job
     */
    start(): void {
        if (this.task) {
            logger.warn('⚠️  Password reset cleanup job is already running');
            return;
        }

        this.task = cron.schedule(this.cronExpression, async () => {
            await this.cleanupExpiredOTPs();
        });

        logger.info('✅ Password reset cleanup job started (runs every hour)');
        logger.info(`📅 Cron expression: ${this.cronExpression}`);
    }

    /**
     * Stop the cron job
     */
    stop(): void {
        if (this.task) {
            this.task.stop();
            this.task = null;
            logger.info('🛑 Password reset cleanup job stopped');
        }
    }

    /**
     * Run cleanup immediately (for testing)
     */
    async runNow(): Promise<number> {
        return await this.cleanupExpiredOTPs();
    }

    /**
     * Clean up expired OTP records
     */
    private async cleanupExpiredOTPs(): Promise<number> {
        try {
            logger.info('🧹 Starting password reset OTP cleanup...');

            const passwordResetRepo = getCustomRepository(PasswordResetRepository);
            const deletedCount = await passwordResetRepo.cleanupExpiredResets();

            if (deletedCount > 0) {
                logger.info(`✅ Cleaned up ${deletedCount} expired OTP record(s)`);
            } else {
                logger.info('✅ No expired OTP records to clean up');
            }

            return deletedCount;
        } catch (error) {
            logger.error('❌ Failed to clean up expired OTPs:', error);
            return 0;
        }
    }

    /**
     * Get job status
     */
    getStatus(): { running: boolean; cronExpression: string; description: string } {
        return {
            running: this.task !== null,
            cronExpression: this.cronExpression,
            description: 'Cleans up expired password reset OTPs every hour'
        };
    }
}

// Export singleton instance
export default new PasswordResetCleanupJob();
