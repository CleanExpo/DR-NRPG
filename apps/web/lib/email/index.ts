/**
 * Email Module Index
 *
 * Exports all email-related functions for easy importing.
 */

// Re-export templates + the sendEmail adapter (delivers via ./mailtrap)
export {
  sendEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendLeadConfirmationEmail,
  sendNewsletterConfirmationEmail,
  sendNewsletterWelcomeEmail,
} from './resend';

// The single mail-sending module (Mailtrap, DR-964)
export {
  sendMail,
  sendMailOrThrow,
  isMailConfigured,
  getMailConfig,
  MailNotConfiguredError,
  MailSendError,
} from './mailtrap';
export type { MailMessage, MailResult, MailStream } from './mailtrap';

// Re-export templates
export {
  contractorApplicationReceived,
  adminNewApplication,
  applicationApproved,
  sendTemplateEmail,
} from './templates';

// Re-export billing emails
export {
  sendPaymentFailureEmail,
  sendPaymentSuccessEmail,
  sendTrialEndingEmail,
} from './billing';

// Re-export types
export type { EmailTemplate } from './templates';
export type { SendEmailOptions, SendEmailResult } from './resend';
