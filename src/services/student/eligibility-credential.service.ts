import { getRepository, In } from 'typeorm';
import { Student } from '../../entities/student/student.entity';
import { EligibilityStatus } from '../../entities/student/eligibility-status.entity';
import { ContactDetails } from '../../entities/student/contact-details.entity';
import { User } from '../../entities/user/user.entity';
import EmailUtility from '../../utilities/email.utility';
import PasswordUtility from '../../utilities/password.utility';
import RoleService from '../role/role.service';
import logger from '../../configs/logger.config';

/**
 * Service for managing eligibility-based credential distribution
 */
class EligibilityCredentialService {

  /**
   * Check eligibility and send credentials to a specific student
   * 
   * IMPORTANT: This assumes user accounts are ALREADY CREATED during student creation.
   * This method will:
   * 1. Check if student is eligible
   * 2. Reset the password for their existing account
   * 3. Send new credentials via email
   * 
   * @param studentId - Student ID to check
   * @param options - Configuration options
   * @returns Object with success status and message
   */
  async checkAndSendCredentials(studentId: number, options?: {
    skipPasswordReset?: boolean; // If true, just sends notification without resetting password
  }): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Get student with eligibility status and contact details
      const studentRepo = getRepository(Student);
      const student = await studentRepo.findOne({
        where: { student_id: studentId },
        relations: ['eligibility_status', 'contact_details']
      });

      if (!student) {
        return { success: false, message: 'Student not found' };
      }

      // Check if student has contact details with email
      const contactDetails = student.contact_details?.[0];
      if (!contactDetails || !contactDetails.email) {
        return { success: false, message: 'Student email not found in contact details' };
      }

      // Check if student has eligibility status
      const eligibilityStatus = student.eligibility_status?.[0];
      if (!eligibilityStatus) {
        return { success: false, message: 'Eligibility status not found for student' };
      }

      // Check if student is eligible
      const isEligible = eligibilityStatus.overall_status === 'eligible' || 
                        eligibilityStatus.overall_status === 'override';

      if (!isEligible) {
        // Send eligibility status notification (not eligible)
        await EmailUtility.sendEligibilityStatusUpdate(
          contactDetails.email,
          `${student.first_name} ${student.last_name}`,
          eligibilityStatus.overall_status,
          eligibilityStatus.reason
        );

        return { 
          success: false, 
          message: `Student is not eligible. Status: ${eligibilityStatus.overall_status}`,
          data: {
            student_id: studentId,
            eligibility_status: eligibilityStatus.overall_status,
            email_sent: true
          }
        };
      }

      // Find existing user account (should always exist since created during student creation)
      const userRepository = getRepository(User);
      const existingUser = await userRepository.findOne({
        where: { studentID: studentId }
      });

      if (!existingUser) {
        return { 
          success: false, 
          message: 'User account not found. This student was created without a user account. Please create one first.',
          data: {
            student_id: studentId,
            suggestion: 'Contact admin to create user account for this student'
          }
        };
      }

      // User account exists - reset password and send credentials
      logger.info(`🔄 Student ${studentId} is eligible. Resetting password and sending credentials...`);

      let temporaryPassword: string;
      let passwordWasReset = false;

      if (options?.skipPasswordReset) {
        // Just send notification, don't reset password
        await EmailUtility.sendEligibilityStatusUpdate(
          contactDetails.email,
          `${student.first_name} ${student.last_name}`,
          'eligible',
          'You are now eligible for placement. Please use your existing login credentials to access the portal.'
        );

        return {
          success: true,
          message: 'Eligibility notification sent (password not reset)',
          data: {
            student_id: studentId,
            user_id: existingUser.id,
            login_id: existingUser.loginID,
            email_sent: true,
            password_reset: false,
            eligibility_status: eligibilityStatus.overall_status
          }
        };
      }

      // Generate new temporary password
      temporaryPassword = this.generateTemporaryPassword();
      const hashedPassword = await PasswordUtility.hashPassword(temporaryPassword);

      // Update existing user account - set status to 'active'
      existingUser.password = hashedPassword;
      existingUser.status = 'active';

      const savedUser = await userRepository.save(existingUser);
      passwordWasReset = true;

      logger.info(`✅ Password reset for student ${studentId}, user status set to 'active'`);

      // Update student status to 'placement_initiated'
      student.status = 'placement_initiated';
      await studentRepo.save(student);

      logger.info(`✅ Student ${studentId} status updated to 'placement_initiated'`);

      // Send login credentials email with new password
      const emailSent = await EmailUtility.sendLoginCredentials(
        contactDetails.email,
        `${student.first_name} ${student.last_name}`,
        contactDetails.email,
        temporaryPassword,
        process.env.APP_URL || 'http://localhost:5000'
      );

      if (!emailSent) {
        logger.warn(`⚠️ Password reset but email failed for student ${studentId}`);
      }

      logger.info(`✅ Credentials sent to eligible student ${studentId} (${contactDetails.email})`);

      return {
        success: true,
        message: 'Password reset and credentials sent successfully. User status set to active, student status set to placement_initiated.',
        data: {
          student_id: studentId,
          user_id: savedUser.id,
          login_id: savedUser.loginID,
          user_status: savedUser.status,
          student_status: student.status,
          email_sent: emailSent,
          password_reset: passwordWasReset,
          eligibility_status: eligibilityStatus.overall_status
        }
      };

    } catch (error) {
      logger.error(`❌ Error in checkAndSendCredentials for student ${studentId}:`, error);
      return {
        success: false,
        message: `Error processing credentials: ${error.message}`
      };
    }
  }

  /**
   * Batch process: Check all eligible students and send credentials
   * @param options - Options for batch processing
   * @returns Summary of batch processing
   */
  async batchProcessEligibleStudents(options?: {
    limit?: number;
    skipExistingUsers?: boolean;
  }): Promise<{
    total_processed: number;
    credentials_sent: number;
    already_have_accounts: number;
    not_eligible: number;
    errors: number;
    details: any[];
  }> {
    try {
      const skipExisting = options?.skipExistingUsers !== false; // Default true
      const limit = options?.limit || 100;

      // Get all students with eligibility status
      const studentRepo = getRepository(Student);
      const queryBuilder = studentRepo.createQueryBuilder('student')
        .leftJoinAndSelect('student.eligibility_status', 'eligibility')
        .leftJoinAndSelect('student.contact_details', 'contact')
        .where('student.status = :status', { status: 'active' })
        .andWhere('eligibility.overall_status IN (:...statuses)', { 
          statuses: ['eligible', 'override'] 
        });

      const students = await queryBuilder.take(limit).getMany();

      // If skipExisting, filter out students with existing user accounts
      let studentsToProcess = students;
      if (skipExisting) {
        const userRepo = getRepository(User);
        const studentIds = students.map(s => s.student_id);
        const existingUsers = await userRepo.find({
          where: { studentID: In(studentIds) }
        });
        const existingStudentIds = new Set(existingUsers.map(u => u.studentID));
        studentsToProcess = students.filter(s => !existingStudentIds.has(s.student_id));
      }

      const results = {
        total_processed: 0,
        credentials_sent: 0,
        already_have_accounts: 0,
        not_eligible: 0,
        errors: 0,
        details: [] as any[]
      };

      logger.info(`🔄 Starting batch processing for ${studentsToProcess.length} eligible students...`);

      for (const student of studentsToProcess) {
        results.total_processed++;

        const result = await this.checkAndSendCredentials(student.student_id);

        if (result.success) {
          results.credentials_sent++;
        } else if (result.message.includes('already exists')) {
          results.already_have_accounts++;
        } else if (result.message.includes('not eligible')) {
          results.not_eligible++;
        } else {
          results.errors++;
        }

        results.details.push({
          student_id: student.student_id,
          name: `${student.first_name} ${student.last_name}`,
          ...result
        });
      }

      logger.info(`✅ Batch processing complete: ${results.credentials_sent} credentials sent, ${results.errors} errors`);

      return results;

    } catch (error) {
      logger.error('❌ Error in batchProcessEligibleStudents:', error);
      throw error;
    }
  }

  /**
   * Send eligibility status notification without creating account
   * @param studentId - Student ID
   * @returns Success status
   */
  async notifyEligibilityStatus(studentId: number): Promise<{ success: boolean; message: string }> {
    try {
      const studentRepo = getRepository(Student);
      const student = await studentRepo.findOne({
        where: { student_id: studentId },
        relations: ['eligibility_status', 'contact_details']
      });

      if (!student) {
        return { success: false, message: 'Student not found' };
      }

      const contactDetails = student.contact_details?.[0];
      if (!contactDetails || !contactDetails.email) {
        return { success: false, message: 'Student email not found' };
      }

      const eligibilityStatus = student.eligibility_status?.[0];
      if (!eligibilityStatus) {
        return { success: false, message: 'Eligibility status not found' };
      }

      const emailSent = await EmailUtility.sendEligibilityStatusUpdate(
        contactDetails.email,
        `${student.first_name} ${student.last_name}`,
        eligibilityStatus.overall_status,
        eligibilityStatus.reason || eligibilityStatus.comments
      );

      if (emailSent) {
        return { success: true, message: 'Eligibility status notification sent' };
      } else {
        return { success: false, message: 'Failed to send email notification' };
      }

    } catch (error) {
      logger.error(`❌ Error in notifyEligibilityStatus for student ${studentId}:`, error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Generate a secure temporary password
   * @returns Temporary password string
   */
  private generateTemporaryPassword(): string {
    const length = 12;
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';
    
    const allChars = uppercase + lowercase + numbers + special;
    
    let password = '';
    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

export default new EligibilityCredentialService();
