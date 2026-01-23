import cron from 'node-cron';
import EligibilityCredentialService from '../services/student/eligibility-credential.service';
import logger from '../configs/logger.config';

/**
 * Cron Job: Automated Eligibility-Based Credential Distribution
 * 
 * Schedule: Runs daily at 9:00 AM
 * Purpose: Automatically check eligible students and send login credentials
 * 
 * Configuration via environment variables:
 * - ENABLE_AUTO_CREDENTIAL_DISTRIBUTION: Set to 'true' to enable (default: false)
 * - CREDENTIAL_DISTRIBUTION_SCHEDULE: Cron schedule (default: '0 9 * * *' - 9 AM daily)
 * - CREDENTIAL_BATCH_LIMIT: Max students to process per run (default: 100)
 */

const ENABLE_AUTO_DISTRIBUTION = process.env.ENABLE_AUTO_CREDENTIAL_DISTRIBUTION === 'true';
const SCHEDULE = process.env.CREDENTIAL_DISTRIBUTION_SCHEDULE || '0 9 * * *'; // 9 AM daily
const BATCH_LIMIT = parseInt(process.env.CREDENTIAL_BATCH_LIMIT || '100');

const eligibilityCredentialDistributionJob = cron.schedule(
  SCHEDULE,
  async () => {
    try {
      logger.info('🔄 Starting automated eligibility credential distribution job...');

      const results = await EligibilityCredentialService.batchProcessEligibleStudents({
        limit: BATCH_LIMIT,
        skipExistingUsers: true
      });

      logger.info(`✅ Credential distribution job completed:
        - Total Processed: ${results.total_processed}
        - Credentials Sent: ${results.credentials_sent}
        - Already Have Accounts: ${results.already_have_accounts}
        - Not Eligible: ${results.not_eligible}
        - Errors: ${results.errors}
      `);

      // Log details if there were errors
      if (results.errors > 0) {
        const errorDetails = results.details.filter(d => !d.success);
        logger.warn('⚠️ Errors encountered:', JSON.stringify(errorDetails, null, 2));
      }

    } catch (error) {
      logger.error('❌ Error in eligibility credential distribution job:', error);
    }
  },
  {
    timezone: process.env.TZ || 'UTC'
  }
);

// Export job control functions
export default {
  /**
   * Start the cron job
   */
  start: () => {
    if (ENABLE_AUTO_DISTRIBUTION) {
      // Job is already created, just need to start it
      logger.info(`✅ Eligibility credential distribution job enabled (Schedule: ${SCHEDULE})`);
    } else {
      logger.info('ℹ️ Eligibility credential distribution job is DISABLED. Set ENABLE_AUTO_CREDENTIAL_DISTRIBUTION=true to enable.');
    }
  },

  /**
   * Stop the cron job
   */
  stop: () => {
    // Job will stop automatically when process ends
    logger.info('⏹️ Eligibility credential distribution job will stop with process');
  },

  /**
   * Get job status
   */
  getStatus: () => {
    return {
      enabled: ENABLE_AUTO_DISTRIBUTION,
      schedule: SCHEDULE,
      batchLimit: BATCH_LIMIT,
      timezone: process.env.TZ || 'UTC'
    };
  },

  /**
   * Run job manually (for testing)
   */
  runNow: async () => {
    logger.info('🔄 Running eligibility credential distribution job manually...');
    try {
      const results = await EligibilityCredentialService.batchProcessEligibleStudents({
        limit: BATCH_LIMIT,
        skipExistingUsers: true
      });
      logger.info('✅ Manual job execution completed:', results);
      return results;
    } catch (error) {
      logger.error('❌ Error in manual job execution:', error);
      throw error;
    }
  }
};
