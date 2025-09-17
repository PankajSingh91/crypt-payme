// server/services/2faClient.js
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const OtpEntry = require('../models/OtpEntry');
const WalletUser = require('../models/WalletUser');

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m'; // short-lived
const REFRESH_EXPIRY = process.env.REFRESH_EXPIRY || '7d';
const OTP_TTL_MS = parseInt(process.env.OTP_TTL_MS || String(5 * 60 * 1000), 10); // default 5 minutes
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10);

// create transporter: prefer SMTP env, else create test account (ethereal)
async function createTransporter() {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
  } else {
    // dev/test fallback: ethereal
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
  }
}

/**
 * Send an email (returns info object). In dev with Ethereal, preview URL will be logged.
 */
async function sendEmail(to, subject, text) {
  const transporter = await createTransporter();
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.EMAIL_USER || 'no-reply@cryptpayme.local',
    to,
    subject,
    text
  });
  // If using Ethereal, print preview url
  if (nodemailer.getTestMessageUrl && info) {
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log('Preview URL (ethereal):', preview);
  }
  return info;
}

/**
 * requestOtp({ email, deviceId, userAgent })
 * - generates 6-digit OTP, stores hashed OTP in DB with TTL, sends email
 */
async function requestOtp({ email, deviceId, userAgent } = {}) {
  if (!email) {
    const err = new Error('email required');
    err.status = 400;
    throw err;
  }
  // Generate OTP (6 digits)
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  // Hash OTP with bcrypt
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  // Remove any previous OTP for this email
  await OtpEntry.deleteMany({ email });
  // Store new OTP
  await OtpEntry.create({ email, otpHash, expiresAt });
  // Send email (non-blocking optionally)
  try {
    await sendEmail(
      email,
      'Your Crypt PayMe OTP',
      `Your OTP is ${otp}. It expires in ${Math.round(OTP_TTL_MS / 60000)} minutes.`
    );
  } catch (e) {
    console.error('Failed to send OTP email:', e);
    // We still keep OTP in DB; but bubble up an error so caller knows sending failed
    const ex = new Error('failed to send email');
    ex.info = e;
    throw ex;
  }
  // For security, do not return OTP. Return ok.
  return { ok: true, message: 'OTP sent' };
}

/**
 * verifyOtp({ email, otp, deviceId, userAgent })
 * - verifies OTP, creates or finds WalletUser profile, returns auth tokens and user profile
 */
async function verifyOtp({ email, otp, deviceId, userAgent } = {}) {
  if (!email || !otp) {
    const err = new Error('email and otp required');
    err.status = 400;
    throw err;
  }
  const entry = await OtpEntry.findOne({ email });
  if (!entry) {
    const er = new Error('no otp requested or otp expired');
    er.status = 400;
    throw er;
  }
  if (entry.expiresAt < new Date()) {
    await OtpEntry.deleteOne({ _id: entry._id });
    const er = new Error('otp expired');
    er.status = 400;
    throw er;
  }
  // check attempts
  if (entry.attempts >= OTP_MAX_ATTEMPTS) {
    const er = new Error('too many attempts');
    er.status = 429;
    throw er;
  }
  const ok = await bcrypt.compare(String(otp), entry.otpHash);
  if (!ok) {
    entry.attempts = (entry.attempts || 0) + 1;
    await entry.save();
    const er = new Error('invalid otp');
    er.status = 400;
    throw er;
  }
  // Success — delete OTP record
  await OtpEntry.deleteOne({ _id: entry._id });
  // Create or find WalletUser profile
  let user = await WalletUser.findOne({ email: email.toLowerCase() });
  if (!user) {
    user = await WalletUser.create({ email: email.toLowerCase(), wallets: [] });
  }
  // Generate tokens
  const authToken = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  const refreshToken = crypto.randomBytes(32).toString('hex');
  // Optionally store refresh token somewhere (DB) if you want to support refresh flow.
  // For simplicity we return refreshToken but do not persist it in this example.
  return { authToken, refreshToken, user: { email: user.email, wallets: user.wallets || [] } };
}

/**
 * whoami({ token, deviceId })
 * - verifies token and returns profile (email + wallets)
 */
async function whoami({ token, deviceId } = {}) {
  try {
    if (!token) {
      const e = new Error('no token');
      e.status = 401;
      throw e;
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const email = decoded.email;
    const user = await WalletUser.findOne({ email });
    if (!user) {
      const e = new Error('user not found');
      e.status = 404;
      throw e;
    }
    return { user: { email: user.email, wallets: user.wallets } };
  } catch (err) {
    // normalize
    const e = new Error('invalid token');
    e.info = err;
    e.status = 401;
    throw e;
  }
}

/**
 * logout({ token, deviceId })
 * - not strictly required; placeholder which could revoke refresh tokens if implemented
 */
async function logout({ token, deviceId } = {}) {
  // In this simple implementation we don't persist refresh tokens so logout is noop
  return { ok: true };
}

/**
 * Helper: add wallet to user's wallets (used by your walletRoutes/add)
 */
async function addWalletToUser(email, wallet) {
  if (!email || !wallet) throw new Error('email and wallet required');
  const lower = String(wallet).toLowerCase();
  // upsert
  const user = await WalletUser.findOneAndUpdate(
    { email: email.toLowerCase() },
    { $addToSet: { wallets: lower } },
    { new: true, upsert: true }
  );
  return user;
}

module.exports = { requestOtp, verifyOtp, whoami, logout, addWalletToUser };
