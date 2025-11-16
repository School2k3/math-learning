import nodemailer from 'nodemailer';
import { config } from 'dotenv';

// Load environment variables
config();

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail', // Default to gmail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use app password if 2FA is enabled
  },
});

// Verify email connection on startup
transporter.verify((error) => {
  if (error) {
    console.error('Email service error:', error);
  } else {
    console.log('Email service is ready to send messages');
  }
});

/**
 * Interface for email options
 */
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email
 * @param options Email options including recipient, subject, and HTML content
 * @returns Promise that resolves when the email is sent
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const { to, subject, html } = options;

    await transporter.sendMail({
      from: `"Math Learning" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send OTP verification email to user
 * @param email Recipient email
 * @param otp OTP code
 * @returns Promise that resolves when the email is sent
 */
export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
  const subject = 'Your Math Learning Verification Code';
  
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5; text-align: center;">Math Learning</h2>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
        <h3 style="margin-top: 0;">Email Verification</h3>
        <p>Hello,</p>
        <p>Thank you for registering with Math Learning. To complete your registration, please use the following verification code:</p>
        <div style="background-color: #ffffff; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0;">
          <h2 style="letter-spacing: 5px; font-size: 28px; margin: 0; color: #4f46e5;">${otp}</h2>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this verification, please ignore this email.</p>
        <p>Best regards,<br>The Math Learning Team</p>
      </div>
      <p style="text-align: center; font-size: 12px; color: #6b7280; margin-top: 20px;">
        &copy; ${new Date().getFullYear()} Math Learning. All rights reserved.
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
  });
};