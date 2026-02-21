"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTemplates = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("./logger");
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create transporter
        const transporter = nodemailer_1.default.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        // Email options
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'TechDev.inc <noreply@techdev.inc>',
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text || options.html.replace(/<[^>]*>/g, ''),
        };
        // Send email
        const info = yield transporter.sendMail(mailOptions);
        logger_1.logger.info('Email sent successfully', {
            messageId: info.messageId,
            to: options.to,
            subject: options.subject,
        });
    }
    catch (error) {
        logger_1.logger.error('Email sending failed:', error);
        throw new Error('Email sending failed');
    }
});
exports.sendEmail = sendEmail;
// Email templates
exports.emailTemplates = {
    welcome: (name, verificationUrl) => ({
        subject: 'Welcome to TechDev.inc!',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to TechDev.inc!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for registering with TechDev.inc. We're excited to have you on board!</p>
        <p>Please click the button below to verify your email address:</p>
        <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>The TechDev.inc Team</p>
      </div>
    `,
    }),
    passwordReset: (name, resetUrl) => ({
        subject: 'Password Reset Request',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Password Reset Request</h1>
        <p>Hi ${name},</p>
        <p>You requested a password reset for your TechDev.inc account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The TechDev.inc Team</p>
      </div>
    `,
    }),
    contactNotification: (contactData) => ({
        subject: 'New Contact Form Submission',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">New Contact Form Submission</h1>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${contactData.name}</p>
          <p><strong>Email:</strong> ${contactData.email}</p>
          <p><strong>Phone:</strong> ${contactData.phone || 'Not provided'}</p>
          <p><strong>Service:</strong> ${contactData.service}</p>
          <p><strong>Message:</strong></p>
          <p style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #2563eb;">${contactData.message}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `,
    }),
    contactConfirmation: (name, message) => ({
        subject: 'Thank you for contacting TechDev.inc',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Thank you for reaching out!</h1>
        <p>Hi ${name},</p>
        <p>We've received your message and will get back to you within 24 hours.</p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Your message:</strong></p>
          <p style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #2563eb;">${message}</p>
        </div>
        <p>In the meantime, feel free to explore our services and portfolio.</p>
        <p>Best regards,<br>The TechDev.inc Team</p>
      </div>
    `,
    }),
};
