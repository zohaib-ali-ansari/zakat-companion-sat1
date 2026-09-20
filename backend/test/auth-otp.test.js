const test = require('node:test');
const assert = require('node:assert/strict');

const { generateOtp, buildOtpEmailContent, buildResetLinkEmailContent } = require('../src/services/emailService');

test('generateOtp returns a 6-digit code', () => {
  const otp = generateOtp();
  assert.equal(typeof otp, 'string');
  assert.equal(otp.length, 6);
  assert.match(otp, /^\d{6}$/);
});

test('buildOtpEmailContent includes the code and purpose', () => {
  const content = buildOtpEmailContent({
    name: 'Ali',
    otp: '123456',
    purpose: 'register',
  });

  assert.match(content.subject, /OTP|verification/i);
  assert.match(content.text, /123456/);
  assert.match(content.html, /123456/);
  assert.match(content.text, /Ali/i);
});

test('buildResetLinkEmailContent includes a reset link instead of OTP', () => {
  const content = buildResetLinkEmailContent({
    name: 'Ali',
    resetLink: 'https://example.com/reset-password?token=abc123&email=ali@example.com',
  });

  assert.match(content.subject, /reset/i);
  assert.match(content.text, /reset/i);
  assert.match(content.text, /https:\/\/example.com\/reset-password\?token=abc123&email=ali@example.com/i);
  assert.match(content.html, /https:\/\/example.com\/reset-password\?token=abc123&email=ali@example.com/i);
  assert.match(content.text, /Ali/i);
});
