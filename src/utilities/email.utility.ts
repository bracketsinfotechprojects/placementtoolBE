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
   * Send login credentials to eligible students
   * @param to - Recipient email address
   * @param studentName - Student's full name
   * @param loginID - Login ID (email)
   * @param temporaryPassword - Temporary password
   * @param loginUrl - URL to login page
   */
  async sendLoginCredentials(
    to: string, 
    studentName: string, 
    loginID: string, 
    temporaryPassword: string,
    loginUrl: string = process.env.APP_URL || 'http://localhost:5000'
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"Placement Portal" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: '🎓 Your Placement Portal Login Credentials - You Are Eligible!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .success-badge { background-color: #10b981; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; font-weight: bold; }
              .credentials-box { background-color: #fff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .credential-item { margin: 15px 0; }
              .credential-label { font-weight: bold; color: #667eea; display: block; margin-bottom: 5px; }
              .credential-value { background-color: #f3f4f6; padding: 10px; border-radius: 5px; font-family: 'Courier New', monospace; font-size: 14px; word-break: break-all; }
              .login-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
              .login-button:hover { opacity: 0.9; }
              .warning-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .steps { background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; }
              .steps ol { padding-left: 20px; }
              .steps li { margin: 10px 0; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
              .emoji { font-size: 24px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="emoji">🎉</div>
                <h1>Congratulations, ${studentName}!</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px;">You are now eligible for placement</p>
              </div>
              
              <div class="content">
                <div class="success-badge">
                  ✅ ELIGIBILITY APPROVED
                </div>
                
                <p>Dear ${studentName},</p>
                
                <p>Great news! You have successfully met all the eligibility requirements for placement. Your account has been activated and you can now access the Placement Portal.</p>
                
                <div class="credentials-box">
                  <h3 style="margin-top: 0; color: #667eea;">🔐 Your Login Credentials</h3>
                  
                  <div class="credential-item">
                    <span class="credential-label">Login ID / Email:</span>
                    <div class="credential-value">${loginID}</div>
                  </div>
                  
                  <div class="credential-item">
                    <span class="credential-label">Temporary Password:</span>
                    <div class="credential-value">${temporaryPassword}</div>
                  </div>
                </div>
                
                <div style="text-align: center;">
                  <a href="${loginUrl}/login" class="login-button">
                    🚀 Login to Portal
                  </a>
                </div>
                
                <div class="warning-box">
                  <strong>⚠️ Important Security Notice:</strong>
                  <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                    <li>This is a <strong>temporary password</strong></li>
                    <li>You will be required to <strong>change your password</strong> on first login</li>
                    <li>Never share your credentials with anyone</li>
                    <li>Keep your password secure and confidential</li>
                  </ul>
                </div>
                
                <div class="steps">
                  <h3 style="margin-top: 0; color: #667eea;">📝 Next Steps:</h3>
                  <ol>
                    <li><strong>Login</strong> to the portal using the credentials above</li>
                    <li><strong>Change your password</strong> immediately after first login</li>
                    <li><strong>Complete your profile</strong> if any information is missing</li>
                    <li><strong>Browse available placements</strong> and apply</li>
                    <li><strong>Track your applications</strong> through the dashboard</li>
                  </ol>
                </div>
                
                <div style="background-color: #e0e7ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <strong>📞 Need Help?</strong><br>
                  If you have any questions or face any issues logging in, please contact our support team at 
                  <a href="mailto:${process.env.EMAIL_USER}" style="color: #667eea;">${process.env.EMAIL_USER}</a>
                </div>
                
                <p style="margin-top: 30px;">Best wishes for your placement journey!</p>
                <p><strong>The Placement Team</strong></p>
              </div>
              
              <div class="footer">
                <p>This is an automated email. Please do not reply directly to this message.</p>
                <p>&copy; ${new Date().getFullYear()} Placement Portal. All rights reserved.</p>
                <p style="margin-top: 10px; font-size: 11px; color: #999;">
                  Login URL: <a href="${loginUrl}/login" style="color: #667eea;">${loginUrl}/login</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`✅ Login credentials email sent to ${to}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`❌ Failed to send login credentials email to ${to}:`, error);
      return false;
    }
  }

  /**
   * Send eligibility status update notification
   * @param to - Recipient email address
   * @param studentName - Student's full name
   * @param status - Eligibility status (eligible, not_eligible, pending)
   * @param reason - Reason for status
   */
  async sendEligibilityStatusUpdate(
    to: string,
    studentName: string,
    status: 'eligible' | 'not_eligible' | 'pending' | 'override',
    reason?: string
  ): Promise<boolean> {
    try {
      const statusConfig = {
        eligible: {
          color: '#10b981',
          icon: '✅',
          title: 'Congratulations! You Are Eligible',
          message: 'You have successfully met all requirements for placement. Your login credentials will be sent in a separate email.'
        },
        not_eligible: {
          color: '#ef4444',
          icon: '❌',
          title: 'Eligibility Requirements Not Met',
          message: 'Unfortunately, you have not yet met all the requirements for placement eligibility. Please review the requirements below.'
        },
        pending: {
          color: '#f59e0b',
          icon: '⏳',
          title: 'Eligibility Status: Pending Review',
          message: 'Your eligibility is currently under review. We will notify you once the review is complete.'
        },
        override: {
          color: '#8b5cf6',
          icon: '🔓',
          title: 'Eligibility Override Applied',
          message: 'An eligibility override has been applied to your account. You may now proceed with placement.'
        }
      };

      const config = statusConfig[status];

      const mailOptions = {
        from: `"Placement Portal" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: `${config.icon} Eligibility Status Update - ${config.title}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: ${config.color}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .status-badge { background-color: ${config.color}; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; font-weight: bold; }
              .reason-box { background-color: #fff; border-left: 4px solid ${config.color}; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${config.icon} ${config.title}</h1>
              </div>
              <div class="content">
                <p>Dear ${studentName},</p>
                <div class="status-badge">STATUS: ${status.toUpperCase().replace('_', ' ')}</div>
                <p>${config.message}</p>
                ${reason ? `<div class="reason-box"><strong>Details:</strong><br>${reason}</div>` : ''}
                <p>If you have any questions, please contact our support team.</p>
                <p><strong>The Placement Team</strong></p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Placement Portal. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`✅ Eligibility status email sent to ${to}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`❌ Failed to send eligibility status email to ${to}:`, error);
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
