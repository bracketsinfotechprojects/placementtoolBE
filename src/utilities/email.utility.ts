import nodemailer from 'nodemailer';
import logger from '../configs/logger.config';

/**
 * Email Utility for sending emails using Nodemailer
 */
class EmailUtility {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  /**
   * Send OTP email for password reset
   * @param to - Recipient email address
   * @param otp - One-time password
   * @param expiryMinutes - OTP expiry time in minutes
   */
  async sendPasswordResetOTP(to: string, otp: string, expiryMinutes: number = 5): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"CRM Support" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: 'Password Reset OTP',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
              .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
              .otp-box { background-color: #fff; border: 2px dashed #4CAF50; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
              .otp-code { font-size: 32px; font-weight: bold; color: #4CAF50; letter-spacing: 5px; }
              .warning { color: #ff6b6b; font-size: 14px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Request</h1>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>You have requested to reset your password. Please use the following One-Time Password (OTP) to complete the process:</p>
                
                <div class="otp-box">
                  <div class="otp-code">${otp}</div>
                </div>
                
                <p><strong>Important:</strong></p>
                <ul>
                  <li>This OTP is valid for <strong>${expiryMinutes} minutes</strong> only</li>
                  <li>Do not share this OTP with anyone</li>
                  <li>If you didn't request this, please ignore this email</li>
                </ul>
                
                <div class="warning">
                  ⚠️ For security reasons, this OTP will expire in ${expiryMinutes} minutes.
                </div>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply.</p>
                <p>&copy; ${new Date().getFullYear()} CRM System. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`✅ Password reset OTP email sent to ${to}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`❌ Failed to send password reset OTP email to ${to}:`, error);
      return false;
    }
  }

  /**
   * Send a generic email
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param html - Email HTML content
   */
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"CRM Support" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        html: html
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`✅ Email sent to ${to}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`❌ Failed to send email to ${to}:`, error);
      return false;
    }
  }

  /**
   * Verify email configuration
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('✅ Email service is ready');
      return true;
    } catch (error) {
      logger.error('❌ Email service verification failed:', error);
      return false;
    }
  }
}

export default new EmailUtility();
