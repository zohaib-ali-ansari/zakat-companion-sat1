const nodemailer = require('nodemailer');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateResetToken = () => {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
};

const buildOtpEmailContent = ({ name, otp, purpose }) => {
  const subject =
    purpose === 'reset'
      ? 'Your Zakat Companion password reset OTP'
      : 'Your Zakat Companion email verification OTP';

  const text = `Hello ${name || 'User'},\n\nYour OTP for ${
    purpose === 'reset' ? 'password reset' : 'email verification'
  } is: ${otp}\n\nThis code is valid for 10 minutes.\n\nThanks,\nZakat Companion Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background: #f9fafb;">
      <h2 style="margin: 0 0 12px; color: #0f172a;">Zakat Companion</h2>
      <p style="margin: 0 0 16px; color: #334155;">Hello ${name || 'User'},</p>
      <p style="margin: 0 0 20px; color: #334155;">
        Your OTP for ${purpose === 'reset' ? 'password reset' : 'email verification'} is:
      </p>
      <div style="padding: 16px 20px; background: #ffffff; border-radius: 12px; border: 1px solid #dbeafe; text-align: center; letter-spacing: 4px; font-size: 28px; font-weight: 700; color: #1d4ed8;">
        ${otp}
      </div>
      <p style="margin: 20px 0 0; color: #475569;">This code is valid for 10 minutes.</p>
      <p style="margin: 16px 0 0; color: #475569;">Thanks,<br />Zakat Companion Team</p>
    </div>
  `;

  return { subject, text, html };
};

const buildResetLinkEmailContent = ({ name, resetLink }) => {
  const subject = 'Reset your Zakat Companion password';
  const text = `Hello ${name || 'User'},\n\nWe received a request to reset your password.\n\nClick the link below to reset it:\n${resetLink}\n\nThis link is valid for 10 minutes.\n\nIf you did not request this, you can ignore this email.\n\nThanks,\nZakat Companion Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background: #f9fafb;">
      <h2 style="margin: 0 0 12px; color: #0f172a;">Zakat Companion</h2>
      <p style="margin: 0 0 16px; color: #334155;">Hello ${name || 'User'},</p>
      <p style="margin: 0 0 20px; color: #334155;">We received a request to reset your password.</p>
      <p style="margin: 0 0 20px; color: #334155;">
        <a href="${resetLink}" style="color: #1d4ed8; font-weight: 700;">Reset your password</a>
      </p>
      <p style="margin: 0 0 16px; color: #475569;">This link is valid for 10 minutes.</p>
      <p style="margin: 0; color: #475569;">If you did not request this, you can ignore this email.</p>
      <p style="margin: 16px 0 0; color: #475569;">Thanks,<br />Zakat Companion Team</p>
    </div>
  `;

  return { subject, text, html };
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendOtpEmail = async ({ email, name, otp, purpose, resetLink }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP credentials missing. Email not sent.');
    return {
      success: false,
      message: 'Email not configured. Set SMTP_USER and SMTP_PASS in environment variables.',
    };
  }

  const content = purpose === 'reset' && resetLink
    ? buildResetLinkEmailContent({ name, resetLink })
    : buildOtpEmailContent({ name, otp, purpose });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: content.subject,
    text: content.text,
    html: content.html,
  });

  return { success: true, message: purpose === 'reset' ? 'Reset link sent successfully' : 'OTP email sent successfully' };
};

module.exports = {
  generateOtp,
  generateResetToken,
  buildOtpEmailContent,
  buildResetLinkEmailContent,
  sendOtpEmail,
};
