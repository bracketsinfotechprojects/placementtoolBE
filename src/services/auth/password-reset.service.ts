import { getRepository, getCustomRepository } from 'typeorm';

// Entities
import { User } from '../../entities/user/user.entity';
import { PasswordReset } from '../../entities/user/password-reset.entity';

// Repositories
import { PasswordResetRepository } from '../../repositories/password-reset.repository';

// Utilities
import PasswordUtility from '../../utilities/password.utility';
import EmailUtility from '../../utilities/email.utility';

// Errors
import { StringError } from '../../errors/string.error';

/**
 * Generate a random 6-digit OTP
 */
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Request password reset - Generate OTP and save to database
 * @param loginID - User's login ID (email/username)
 * @returns OTP (in production, this should be sent via email/SMS)
 */
const requestPasswordReset = async (loginID: string): Promise<{ message: string; otp?: string }> => {
  try {
    console.log('🔐 Password reset requested for:', loginID);

    // Find user by loginID
    const userRepo = getRepository(User);
    const user = await userRepo.findOne({
      where: { loginID, isDeleted: false }
    });

    if (!user) {
      console.log('❌ User not found:', loginID);
      throw new StringError('User not found');
    }

    // Check if user is active
    if (user.status !== 'active') {
      console.log('❌ User account is not active:', loginID);
      throw new StringError('User account is not active');
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Set expiry to 5 minutes from now
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 5);

    // Save password reset record
    const passwordResetRepo = getCustomRepository(PasswordResetRepository);
    
    // Invalidate any existing resets for this user
    await passwordResetRepo.deleteAllByUserId(user.id);

    // Create new reset record
    const passwordReset = new PasswordReset();
    passwordReset.user_id = user.id;
    passwordReset.otp = otp;
    passwordReset.expiry = expiry;
    
    await passwordResetRepo.save(passwordReset);

    console.log('✅ Password reset OTP generated for user:', loginID);

    // Send OTP via email
    const emailSent = await EmailUtility.sendPasswordResetOTP(loginID, otp, 5);
    
    if (!emailSent) {
      console.warn('⚠️  Failed to send OTP email, but OTP was generated');
    }

    // Return response (OTP only in dev mode for testing)
    return {
      message: 'Password reset OTP has been sent to your registered email',
      otp: process.env.NODE_ENV === 'production' ? undefined : otp // Only return in dev mode
    };
  } catch (error) {
    console.error('❌ Password reset request failed:', error.message);
    throw error;
  }
};

/**
 * Verify OTP
 * @param loginID - User's login ID
 * @param otp - OTP to verify
 * @returns Success message
 */
const verifyOTP = async (loginID: string, otp: string): Promise<{ message: string; valid: boolean }> => {
  try {
    console.log('🔍 Verifying OTP for:', loginID);

    // Find user by loginID
    const userRepo = getRepository(User);
    const user = await userRepo.findOne({
      where: { loginID, isDeleted: false }
    });

    if (!user) {
      console.log('❌ User not found:', loginID);
      throw new StringError('Invalid credentials');
    }

    // Find active password reset
    const passwordResetRepo = getCustomRepository(PasswordResetRepository);
    const passwordReset = await passwordResetRepo.findActiveResetByUserAndOtp(user.id, otp);

    if (!passwordReset) {
      console.log('❌ Invalid or expired OTP for user:', loginID);
      throw new StringError('Invalid or expired OTP');
    }

    // Verify OTP
    if (!passwordReset.isValid(otp)) {
      console.log('❌ OTP validation failed for user:', loginID);
      throw new StringError('Invalid or expired OTP');
    }

    console.log('✅ OTP verified successfully for user:', loginID);
    return {
      message: 'OTP verified successfully',
      valid: true
    };
  } catch (error) {
    console.error('❌ OTP verification failed:', error.message);
    throw error;
  }
};

/**
 * Reset password with OTP
 * @param loginID - User's login ID
 * @param otp - OTP for verification
 * @param newPassword - New password
 * @returns Success message
 */
const resetPassword = async (loginID: string, otp: string, newPassword: string): Promise<{ message: string }> => {
  try {
    console.log('🔐 Resetting password for:', loginID);

    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      throw new StringError('Password must be at least 8 characters long');
    }

    // Find user by loginID
    const userRepo = getRepository(User);
    const user = await userRepo.findOne({
      where: { loginID, isDeleted: false }
    });

    if (!user) {
      console.log('❌ User not found:', loginID);
      throw new StringError('Invalid credentials');
    }

    // Find and verify active password reset
    const passwordResetRepo = getCustomRepository(PasswordResetRepository);
    const passwordReset = await passwordResetRepo.findActiveResetByUserAndOtp(user.id, otp);

    if (!passwordReset || !passwordReset.isValid(otp)) {
      console.log('❌ Invalid or expired OTP for user:', loginID);
      throw new StringError('Invalid or expired OTP');
    }

    // Hash new password
    const hashedPassword = await PasswordUtility.hashPassword(newPassword);

    // Update user password
    user.password = hashedPassword;
    await userRepo.save(user);

    // Immediately invalidate all password resets for this user (soft delete)
    await passwordResetRepo.deleteAllByUserId(user.id);
    
    console.log('✅ Password reset successful and OTP deleted for user:', loginID);
    return {
      message: 'Password has been reset successfully'
    };
  } catch (error) {
    console.error('❌ Password reset failed:', error.message);
    throw error;
  }
};

export default {
  requestPasswordReset,
  verifyOTP,
  resetPassword
};
