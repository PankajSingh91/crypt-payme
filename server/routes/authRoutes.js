// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  requestOtp,
  verifyOtp,
  whoami,
  logout,
  addWalletToUser
} = require('../services/2faClient');
const User = require('../models/User');

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'cp_auth';

/**
 * POST /auth/request-otp
 * body: { email }
 */
router.post('/request-otp', async (req, res) => {
  try {
    const deviceId = req.headers['x-device-id'] || req.body.deviceId;
    const userAgent = req.get('User-Agent') || '';
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });

    await requestOtp({ email, deviceId, userAgent });
    return res.json({ ok: true, message: 'OTP sent' });
  } catch (err) {
    console.error('request-otp error', err?.response?.data || err.message);
    return res.status(500).json({ error: 'failed to request otp' });
  }
});

/**
 * POST /auth/verify-otp
 * body: { email, otp, walletAddress }  - walletAddress REQUIRED
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const deviceId = req.headers['x-device-id'] || req.body.deviceId;
    const userAgent = req.get('User-Agent') || '';
    const { email, otp, walletAddress } = req.body;

    // Strict: walletAddress is required for verification and linking
    if (!email || !otp || !walletAddress) {
      return res.status(400).json({ error: 'email, otp and walletAddress are required' });
    }

    // 1️⃣ Verify OTP with microservice
    const data = await verifyOtp({ email, otp, deviceId, userAgent });
    const authToken = data.authToken;
    const refreshToken = data.refreshToken;
    let remoteUser = data.user || {};

    // 2️⃣ Link the wallet on 2FA microservice (idempotent)
    try {
      const addResp = await addWalletToUser({
        email: remoteUser.email || email,
        wallet: walletAddress,
        token: authToken,
        deviceId
      });
      remoteUser = addResp.user || addResp || remoteUser;
    } catch (e) {
      console.error(
        'wallet linking after verify-otp failed',
        e?.response?.data || e?.message || e
      );
      return res.status(500).json({ error: 'failed to link wallet after OTP verification' });
    }

    // 3️⃣ Persist local User record (walletAddress required by schema)
    let dbUser = await User.findOne({ email });
    if (!dbUser) {
      dbUser = new User({
        email,
        walletAddress,
        otpVerifiedAt: new Date(),
        deviceId
      });
    } else {
      dbUser.walletAddress = walletAddress;
      dbUser.otpVerifiedAt = new Date();
      dbUser.deviceId = deviceId;
    }
    await dbUser.save();

    // 4️⃣ Set auth cookies
    if (authToken) {
      res.cookie(COOKIE_NAME, authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: parseInt(process.env.AUTH_COOKIE_MAXAGE || String(15 * 60 * 1000), 10)
      });
    }

    if (refreshToken) {
      res.cookie(`${COOKIE_NAME}_rt`, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: parseInt(process.env.REFRESH_COOKIE_MAXAGE || String(7 * 24 * 60 * 60 * 1000), 10)
      });
    }

    // ✅ 5️⃣ Return token for frontend to store in localStorage
    return res.json({
      ok: true,
      user: dbUser,
      token: authToken || null,
      refreshToken: refreshToken || null
    });
  } catch (err) {
    console.error('verify-otp err', err?.response?.data || err?.info || err?.message || err);
    if (err?.response?.data) return res.status(400).json(err.response.data);
    return res.status(400).json({ error: 'invalid or expired otp' });
  }
});

/**
 * GET /auth/whoami
 */
router.get('/whoami', async (req, res) => {
  try {
    const token = req.cookies[COOKIE_NAME] || req.headers.authorization?.split(' ')[1];
    const deviceId = req.headers['x-device-id'];
    if (!token) return res.status(401).json({ error: 'no auth' });

    const profile = await whoami({ token, deviceId });
    return res.json(profile);
  } catch (err) {
    console.error('whoami error', err?.response?.data || err.message);
    return res.status(401).json({ error: 'invalid token' });
  }
});

/**
 * POST /auth/logout
 */
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies[COOKIE_NAME] || req.headers.authorization?.split(' ')[1];
    const deviceId = req.headers['x-device-id'];
    if (token) await logout({ token, deviceId });

    res.clearCookie(COOKIE_NAME);
    res.clearCookie(`${COOKIE_NAME}_rt`);
    return res.json({ ok: true });
  } catch (err) {
    console.error('logout err', err);
    res.clearCookie(COOKIE_NAME);
    return res.json({ ok: true });
  }
});

module.exports = router;
