'use strict';

const { sesClient, SESCommands, config: awsConfig } = require('../config/aws');
const logger = require('../utils/logger');

/**
 * Send a raw email via AWS SES.
 * @param {object} options
 * @param {string | string[]} options.to - Recipient email(s)
 * @param {string} options.subject
 * @param {string} options.htmlBody
 * @param {string} [options.textBody]
 * @param {string} [options.replyTo]
 * @returns {Promise<void>}
 */
const sendEmail = async ({ to, subject, htmlBody, textBody, replyTo }) => {
  const recipients = Array.isArray(to) ? to : [to];

  const command = new SESCommands.SendEmailCommand({
    Source: `${awsConfig.ses.fromName} <${awsConfig.ses.fromEmail}>`,
    Destination: {
      ToAddresses: recipients,
    },
    Message: {
      Subject: { Data: subject, Charset: 'UTF-8' },
      Body: {
        Html: { Data: htmlBody, Charset: 'UTF-8' },
        ...(textBody && { Text: { Data: textBody, Charset: 'UTF-8' } }),
      },
    },
    ...(replyTo && { ReplyToAddresses: [replyTo] }),
  });

  try {
    const result = await sesClient.send(command);
    logger.info(`[EmailService] Email sent to ${recipients.join(', ')} | MessageId: ${result.MessageId}`);
  } catch (err) {
    logger.error(`[EmailService] Failed to send email to ${recipients.join(', ')}: ${err.message}`);
    throw err;
  }
};

/**
 * Send a welcome email to a new user.
 * @param {object} user - { firstName, email }
 * @returns {Promise<void>}
 */
const sendWelcomeEmail = (user) =>
  sendEmail({
    to: user.email,
    subject: 'Welcome to Opsentra! 🎉',
    htmlBody: `
      <h1>Welcome, ${user.firstName}!</h1>
      <p>Thanks for joining Opsentra. We're glad to have you on board.</p>
      <p>Get started by logging into your account:</p>
      <a href="${process.env.FRONTEND_URL}/login" style="
        display:inline-block; padding:12px 24px;
        background:#4F46E5; color:#fff; border-radius:6px;
        text-decoration:none; font-weight:bold;">
        Login to Opsentra
      </a>
      <p>If you have any questions, just reply to this email.</p>
      <p>— The Opsentra Team</p>
    `,
    textBody: `Welcome, ${user.firstName}! Visit ${process.env.FRONTEND_URL}/login to get started.`,
  });

/**
 * Send a password reset email.
 * @param {object} user - { firstName, email }
 * @param {string} resetUrl - Full URL including token
 * @returns {Promise<void>}
 */
const sendPasswordResetEmail = (user, resetUrl) =>
  sendEmail({
    to: user.email,
    subject: 'Password Reset Request — Opsentra',
    htmlBody: `
      <h1>Hi, ${user.firstName}</h1>
      <p>You requested a password reset. Click the button below (valid for 1 hour):</p>
      <a href="${resetUrl}" style="
        display:inline-block; padding:12px 24px;
        background:#DC2626; color:#fff; border-radius:6px;
        text-decoration:none; font-weight:bold;">
        Reset Password
      </a>
      <p>If you didn't request this, ignore this email. Your password won't change.</p>
      <p>— The Opsentra Team</p>
    `,
    textBody: `Reset your password: ${resetUrl}`,
  });

module.exports = { sendEmail, sendWelcomeEmail, sendPasswordResetEmail };
