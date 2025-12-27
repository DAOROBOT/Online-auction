import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const BREVO_API_KEY = process.env.EMAIL_PASSWORD;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const FROM_EMAIL = process.env.EMAIL_USER || 'noreply@onlineauction.com';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Online Auction';

// Helper function to send email via Brevo HTTP API
const sendEmailViaAPI = async (to, subject, htmlContent) => {
  try {
    if (!to || to.trim() === '') {
      throw new Error('Recipient email address is required');
    }

    console.log(`Sending email to: ${to}, Subject: ${subject}`);

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        to: [{ email: to.trim() }],
        sender: { 
          name: FROM_NAME,
          email: FROM_EMAIL 
        },
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Brevo API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    console.log(`Email sent successfully to ${to}: ${data.messageId}`);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error('Error sending email via Brevo API:', error);
    throw error;
  }
};

// Send welcome email after registration
export const sendWelcomeEmail = async (to, username, verificationCode) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to Online Auction, ${username}!</h2>
      <p>Thank you for registering with us. We're excited to have you on board!</p>
      <p>To activate your account, please verify your email using the code below:</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
        <p style="font-size: 14px; margin: 0;">Your verification code:</p>
        <p style="font-size: 32px; font-weight: bold; color: #E0B84C; letter-spacing: 5px; margin: 10px 0;">${verificationCode}</p>
      </div>
      <p>Enter this code on the verification page to activate your account. The code will expire in 24 hours.</p>
      <p>Once verified, you can:</p>
      <ul>
        <li>Browse and bid on thousands of items</li>
        <li>Create your own auctions</li>
        <li>Track your bids and wins</li>
      </ul>
      <p>If you have any questions, feel free to contact our support team.</p>
      <p>Happy bidding!</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">This is an automated message, please do not reply.</p>
    </div>
  `;

  return sendEmailViaAPI(to, 'Welcome to Online Auction Platform! - Please Verify Your Email', htmlContent);
};

// Send login notification email
export const sendLoginNotification = async (to, username, loginDetails) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Login Detected</h2>
      <p>Hello ${username},</p>
      <p>We detected a new login to your account:</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>IP Address:</strong> ${loginDetails.ip || 'Unknown'}</p>
        <p><strong>Device:</strong> ${loginDetails.device || 'Unknown'}</p>
      </div>
      <p>If this was you, you can safely ignore this email.</p>
      <p>If you didn't log in, please secure your account immediately by changing your password.</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">This is an automated security message, please do not reply.</p>
    </div>
  `;

  return sendEmailViaAPI(to, 'New Login to Your Account', htmlContent);
};

// Send password reset email
export const sendPasswordResetEmail = async (to, username, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hello ${username},</p>
      <p>We received a request to reset your password. Click the button below to reset it:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="color: #007bff; word-break: break-all;">${resetUrl}</p>
      <p><strong>This link will expire in 1 hour.</strong></p>
      <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">This is an automated message, please do not reply.</p>
    </div>
  `;

  return sendEmailViaAPI(to, 'Password Reset Request', htmlContent);
};

// Send email verification
export const sendEmailVerification = async (to, username, verificationToken) => {
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Verify Your Email</h2>
      <p>Hello ${username},</p>
      <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="color: #28a745; word-break: break-all;">${verifyUrl}</p>
      <p><strong>This link will expire in 24 hours.</strong></p>
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">This is an automated message, please do not reply.</p>
    </div>
  `;

  return sendEmailViaAPI(to, 'Verify Your Email Address', htmlContent);
};

// Generic email sender
export const sendEmail = async (to, subject, html) => {
  return sendEmailViaAPI(to, subject, html);
};

export default {
  sendWelcomeEmail,
  sendLoginNotification,
  sendPasswordResetEmail,
  sendEmailVerification,
  sendEmail,
};