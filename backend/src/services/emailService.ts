import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    // Only create transporter if SMTP credentials are configured
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    
    if (smtpUser && smtpPass && smtpUser !== 'your-email@gmail.com') {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
      this.isConfigured = true;
      console.log('📧 Email service configured');
    } else {
      console.log('📧 Email service not configured (SMTP credentials missing) - emails will be skipped');
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    // Skip if email not configured
    if (!this.isConfigured || !this.transporter) {
      console.log(`📧 [SKIPPED] Email to ${options.to}: ${options.subject}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"${process.env.FROM_NAME || 'E-Commerce'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html
      });
      console.log(`📧 [SENT] Email to ${options.to}: ${options.subject}`);
    } catch (error) {
      console.error('Email sending failed:', error);
      // Don't throw - email failure shouldn't break the app
    }
  }

  async sendOrderConfirmation(userEmail: string, userName: string, orderNumber: string, orderTotal: number): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Confirmation</h2>
        <p>Dear ${userName},</p>
        <p>Thank you for your order! We're pleased to confirm that we've received your order.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Order Details</h3>
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Total Amount:</strong> $${orderTotal.toFixed(2)}</p>
        </div>
        
        <p>You will receive another email once your order has been shipped.</p>
        
        <p>Thank you for shopping with us!</p>
        <p>Best regards,<br>The E-Commerce Team</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: userEmail,
      subject: `Order Confirmation - ${orderNumber}`,
      html
    });
  }

  async sendOrderStatusUpdate(userEmail: string, userName: string, orderNumber: string, status: string, trackingNumber?: string): Promise<void> {
    let statusMessage = '';
    switch (status.toLowerCase()) {
      case 'processing':
        statusMessage = 'Your order is being processed and will be shipped soon.';
        break;
      case 'shipped':
        statusMessage = trackingNumber 
          ? `Your order has been shipped! Track your package with tracking number: ${trackingNumber}` 
          : 'Your order has been shipped!';
        break;
      case 'delivered':
        statusMessage = 'Your order has been delivered. We hope you enjoy your purchase!';
        break;
      case 'cancelled':
        statusMessage = 'Your order has been cancelled. If you have any questions, please contact support.';
        break;
      default:
        statusMessage = `Your order status has been updated to: ${status}`;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Status Update</h2>
        <p>Dear ${userName},</p>
        <p>We wanted to update you on your recent order:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Order ${orderNumber}</h3>
          <p><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
          ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
        </div>
        
        <p>${statusMessage}</p>
        
        <p>Thank you for shopping with us!</p>
        <p>Best regards,<br>The E-Commerce Team</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: userEmail,
      subject: `Order Update - ${orderNumber} (${status})`,
      html
    });
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to E-Commerce!</h2>
        <p>Dear ${userName},</p>
        <p>Welcome to our e-commerce platform! We're excited to have you as part of our community.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Get Started</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Browse our extensive product catalog</li>
            <li>Add items to your cart and checkout securely</li>
            <li>Track your orders and delivery status</li>
            <li>Leave reviews and ratings for products</li>
          </ul>
        </div>
        
        <p>If you have any questions, feel free to contact our support team.</p>
        
        <p>Happy shopping!</p>
        <p>Best regards,<br>The E-Commerce Team</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: userEmail,
      subject: 'Welcome to E-Commerce!',
      html
    });
  }
}

export default new EmailService();