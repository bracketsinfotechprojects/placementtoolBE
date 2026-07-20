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
   * Send workshop slot booking confirmation with full slot details
   * @param to - Recipient email address
   * @param studentName - Student's full name
   * @param slot - Workshop (CourseSlots) details for the booked slot
   */
  async sendWorkshopSlotBookingConfirmation(
    to: string,
    studentName: string,
    slot: {
      course_name?: string;
      course_date?: string | Date;
      day_of_week?: string;
      reporting_time?: string;
      expected_end_time?: string;
      total_duration?: string;
      mode?: string[] | string;
      training_location?: string;
      address?: string;
      city?: string;
      google_maps_link?: string;
      dress_code?: string;
      items_to_bring?: string[] | string;
      mobile_phone_policy?: string;
      documents_required?: string[] | string;
      pre_course_requirement?: string[] | string;
      restrictions?: string;
    }
  ): Promise<boolean> {
    try {
      const formatList = (value?: string[] | string) => {
        if (!value) return '-';
        return Array.isArray(value) ? value.join(', ') : value;
      };

      const formattedDate = slot.course_date
        ? new Date(slot.course_date).toLocaleDateString('en-AU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : '-';

      const detailRow = (label: string, value?: string) =>
        value
          ? `<div class="detail-item"><span class="detail-label">${label}:</span> <span class="detail-value">${value}</span></div>`
          : '';

      const mailOptions = {
        from: `"Placement Portal" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: `✅ Workshop Slot Booked - ${slot.course_name || 'Workshop'}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { margin: 0; font-size: 24px; }
              .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .details-box { background-color: #fff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .detail-item { margin: 10px 0; }
              .detail-label { font-weight: bold; color: #667eea; }
              .detail-value { color: #333; }
              .map-button { display: inline-block; background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 20px; margin-top: 10px; font-weight: bold; }
              .restrictions-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Workshop Slot Booked Successfully</h1>
              </div>
              <div class="content">
                <p>Dear ${studentName},</p>
                <p>Your workshop slot has been booked successfully. Please find the details below:</p>

                <div class="details-box">
                  <h3 style="margin-top: 0; color: #667eea;">📋 Workshop Details</h3>
                  ${detailRow('Course Name', slot.course_name)}
                  ${detailRow('Date', formattedDate)}
                  ${detailRow('Day', slot.day_of_week)}
                  ${detailRow('Reporting Time', slot.reporting_time)}
                  ${detailRow('End Time', slot.expected_end_time)}
                  ${detailRow('Duration', slot.total_duration)}
                  ${detailRow('Mode', formatList(slot.mode))}
                </div>

                <div class="details-box">
                  <h3 style="margin-top: 0; color: #667eea;">📍 Venue Details</h3>
                  ${detailRow('Training Location', slot.training_location)}
                  ${detailRow('Address', slot.address)}
                  ${detailRow('City', slot.city)}
                  ${
                    slot.google_maps_link
                      ? `<a href="${slot.google_maps_link}" class="map-button" target="_blank" rel="noopener noreferrer">🗺️ View on Google Maps</a>`
                      : ''
                  }
                </div>

                <div class="details-box">
                  <h3 style="margin-top: 0; color: #667eea;">📌 What to Bring / Prepare</h3>
                  ${detailRow('Dress Code', slot.dress_code)}
                  ${detailRow('Items to Bring', formatList(slot.items_to_bring))}
                  ${detailRow('Documents Required', formatList(slot.documents_required))}
                  ${detailRow('Pre-Course Requirement', formatList(slot.pre_course_requirement))}
                  ${detailRow('Mobile Phone Policy', slot.mobile_phone_policy)}
                </div>

                ${
                  slot.restrictions
                    ? `<div class="restrictions-box"><strong>⚠️ Restrictions:</strong><br>${slot.restrictions}</div>`
                    : ''
                }

                <p>Please arrive on time and bring all the required documents and items listed above.</p>
                <p><strong>The Placement Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply directly to this message.</p>
                <p>&copy; ${new Date().getFullYear()} Placement Portal. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`✅ Workshop slot booking confirmation email sent to ${to}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`❌ Failed to send workshop slot booking confirmation email to ${to}:`, error);
      return false;
    }
  }

  /**
   * Send workshop attendance status notification to a student
   * @param to - Recipient email address
   * @param studentName - Student's full name
   * @param attendanceStatus - Attendance status marked by the trainer
   * @param courseName - Name of the workshop/course
   * @param courseDate - Date the workshop was held
   */
  async sendAttendanceStatusEmail(
    to: string,
    studentName: string,
    attendanceStatus: string,
    courseName: string,
    courseDate?: string | Date
  ): Promise<boolean> {
    try {
      const isPresent = attendanceStatus === 'present';
      const statusLabel = attendanceStatus.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const color = isPresent ? '#10b981' : '#ef4444';
      const icon = isPresent ? '✅' : '❌';

      const formattedDate = courseDate
        ? new Date(courseDate).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })
        : '';

      const mailOptions = {
        from: `"Placement Portal" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: `${icon} Attendance Update - ${courseName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: ${color}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .status-badge { background-color: ${color}; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; font-weight: bold; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${icon} Attendance Marked: ${statusLabel}</h1>
              </div>
              <div class="content">
                <p>Dear ${studentName},</p>
                <div class="status-badge">STATUS: ${statusLabel.toUpperCase()}</div>
                <p>Your attendance for <strong>${courseName}</strong>${formattedDate ? ` on <strong>${formattedDate}</strong>` : ''} has been marked as <strong>${statusLabel}</strong> by your trainer.</p>
                ${isPresent ? '<p>Your class completion checklist item has been updated accordingly.</p>' : '<p>If you believe this is incorrect, please contact your trainer or the placement team.</p>'}
                <p><strong>The Placement Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply directly to this message.</p>
                <p>&copy; ${new Date().getFullYear()} Placement Portal. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`✅ Attendance status email sent to ${to}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`❌ Failed to send attendance status email to ${to}:`, error);
      return false;
    }
  }

  /**
   * Send a certificate to a student as an email attachment
   * @param to - Recipient email address
   * @param studentName - Student's full name
   * @param certificateName - Name/title describing the certificate (e.g. course name)
   * @param filePath - Absolute path to the certificate file on disk
   * @param fileName - Filename to use for the attachment
   */
  async sendCertificateEmail(
    to: string,
    studentName: string,
    certificateName: string,
    filePath: string,
    fileName: string
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"Placement Portal" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: `🎓 Your Certificate - ${certificateName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎓 Certificate Issued</h1>
              </div>
              <div class="content">
                <p>Dear ${studentName},</p>
                <p>Congratulations! Your certificate for <strong>${certificateName}</strong> has been issued and is attached to this email.</p>
                <p>Please keep a copy for your records.</p>
                <p><strong>The Placement Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply directly to this message.</p>
                <p>&copy; ${new Date().getFullYear()} Placement Portal. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        attachments: [
          {
            filename: fileName,
            path: filePath
          }
        ]
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`✅ Certificate email sent to ${to}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`❌ Failed to send certificate email to ${to}:`, error);
      return false;
    }
  }

  /**
   * Notify a student that they've booked a facility placement slot
   * @param to - Recipient email address
   * @param studentName - Student's full name
   * @param facilityName - Name of the facility booked
   */
  async sendPlacementSlotBookedStudentEmail(
    to: string,
    studentName: string,
    facilityName: string
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"Placement Portal" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: `✅ Facility Slot Booked - ${facilityName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .status-box { background-color: #fff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Facility Slot Booked</h1>
              </div>
              <div class="content">
                <p>Dear ${studentName},</p>
                <p>You have successfully booked a placement slot at <strong>${facilityName}</strong>.</p>
                <div class="status-box">
                  Your booking is now pending review by the facility. Once the facility approves your booking, you will receive your <strong>offer letter</strong> via email.
                </div>
                <p>You can track the status of your booking from the Placement Portal.</p>
                <p><strong>The Placement Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply directly to this message.</p>
                <p>&copy; ${new Date().getFullYear()} Placement Portal. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`✅ Placement slot booking email sent to student ${to}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`❌ Failed to send placement slot booking email to student ${to}:`, error);
      return false;
    }
  }

  /**
   * Notify a facility that a student has booked one of its placement slots
   * @param to - Recipient email address
   * @param facilityName - Facility's name
   * @param studentName - Name of the student who booked the slot
   */
  async sendPlacementSlotBookedFacilityEmail(
    to: string,
    facilityName: string,
    studentName: string
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"Placement Portal" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: `📋 New Student Booking - Action Required`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .status-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📋 New Student Booking</h1>
              </div>
              <div class="content">
                <p>Dear ${facilityName},</p>
                <p><strong>${studentName}</strong> has booked a placement slot at your facility.</p>
                <div class="status-box">
                  Please log in to the Placement Portal and check the <strong>Booked Students</strong> section for this slot to review and <strong>approve or reject</strong> this student.
                </div>
                <p><strong>The Placement Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply directly to this message.</p>
                <p>&copy; ${new Date().getFullYear()} Placement Portal. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`✅ Placement slot booking email sent to facility ${to}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`❌ Failed to send placement slot booking email to facility ${to}:`, error);
      return false;
    }
  }

  /**
   * Send an offer-letter style email to a student once the facility approves their placement
   * @param to - Recipient email address
   * @param studentName - Student's full name
   * @param details - Placement details to include in the offer letter
   */
  async sendOfferLetterEmail(
    to: string,
    studentName: string,
    details: {
      facilityName?: string;
      placementType?: string;
      startDate?: string | Date;
      endDate?: string | Date;
      shiftTimings?: string;
      workingDays?: string[];
      totalHoursRequired?: number;
      courseApplicable?: string[];
    }
  ): Promise<boolean> {
    try {
      const formatDate = (value?: string | Date) =>
        value
          ? new Date(value).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })
          : '-';

      const detailRow = (label: string, value?: string) =>
        value
          ? `<div class="detail-item"><span class="detail-label">${label}:</span> <span class="detail-value">${value}</span></div>`
          : '';

      const mailOptions = {
        from: `"Placement Portal" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: `🎉 Offer Letter - ${details.facilityName || 'Internship Placement'}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .success-badge { background-color: #10b981; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; font-weight: bold; }
              .details-box { background-color: #fff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .detail-item { margin: 10px 0; }
              .detail-label { font-weight: bold; color: #667eea; }
              .detail-value { color: #333; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Congratulations, ${studentName}!</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px;">Your placement has been approved</p>
              </div>
              <div class="content">
                <div class="success-badge">✅ OFFER CONFIRMED</div>
                <p>Dear ${studentName},</p>
                <p>We are pleased to inform you that <strong>${details.facilityName || 'the facility'}</strong> has approved your internship placement. Please find your offer details below:</p>

                <div class="details-box">
                  <h3 style="margin-top: 0; color: #667eea;">📋 Offer Details</h3>
                  ${detailRow('Facility', details.facilityName)}
                  ${detailRow('Placement Type', details.placementType)}
                  ${detailRow('Start Date', formatDate(details.startDate))}
                  ${detailRow('End Date', formatDate(details.endDate))}
                  ${detailRow('Shift Timings', details.shiftTimings)}
                  ${detailRow('Working Days', Array.isArray(details.workingDays) ? details.workingDays.join(', ') : undefined)}
                  ${detailRow('Total Hours Required', details.totalHoursRequired ? String(details.totalHoursRequired) : undefined)}
                  ${detailRow('Course Applicable', Array.isArray(details.courseApplicable) ? details.courseApplicable.join(', ') : undefined)}
                </div>

                <p>Please report as per the schedule above and carry all the required documents. You can view the full placement details from the Placement Portal.</p>
                <p>Congratulations once again, and best wishes for your internship!</p>
                <p><strong>The Placement Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply directly to this message.</p>
                <p>&copy; ${new Date().getFullYear()} Placement Portal. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`✅ Offer letter email sent to ${to}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`❌ Failed to send offer letter email to ${to}:`, error);
      return false;
    }
  }

  /**
   * Notify a student that the facility has rejected their placement, including the reason
   * @param to - Recipient email address
   * @param studentName - Student's full name
   * @param facilityName - Facility's name
   * @param reason - Reason for rejection provided by the facility
   */
  async sendPlacementRejectionEmail(
    to: string,
    studentName: string,
    facilityName: string,
    reason?: string
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"Placement Portal" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: `Placement Update - ${facilityName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .status-badge { background-color: #ef4444; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; font-weight: bold; }
              .reason-box { background-color: #fff; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>❌ Placement Not Approved</h1>
              </div>
              <div class="content">
                <p>Dear ${studentName},</p>
                <div class="status-badge">STATUS: REJECTED</div>
                <p>We regret to inform you that <strong>${facilityName}</strong> has rejected your placement booking.</p>
                ${reason ? `<div class="reason-box"><strong>Reason:</strong><br>${reason}</div>` : ''}
                <p>Please check the Placement Portal to book another available slot, or contact your placement coordinator for assistance.</p>
                <p><strong>The Placement Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply directly to this message.</p>
                <p>&copy; ${new Date().getFullYear()} Placement Portal. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`✅ Placement rejection email sent to ${to}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`❌ Failed to send placement rejection email to ${to}:`, error);
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
