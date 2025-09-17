// 2fa-service/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  requestOtp,
  verifyOtp,
  whoami,
  logout
} = require('../services/authService.js');

// Request OTP
router.post('/request-otp', async (req, res) => {
  try {
    const { email, deviceId, userAgent } = req.body;
    const result = await requestOtp({ email, deviceId, userAgent });
    res.json(result);
  } catch (err) {
    console.error('request-otp error:', err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, deviceId, userAgent } = req.body;
    const result = await verifyOtp({ email, otp, deviceId, userAgent });
    res.json(result);
  } catch (err) {
    console.error('verify-otp error:', err.message);
    res.status(err.status || 400).json({ error: err.message });
  }
});

// WhoAmI
router.get('/whoami', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const result = await whoami({ token });
    res.json(result);
  } catch (err) {
    console.error('whoami error:', err.message);
    res.status(err.status || 401).json({ error: err.message });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const result = await logout({ token });
    res.json(result);
  } catch (err) {
    console.error('logout error:', err.message);
    res.json({ ok: true });
  }
});

module.exports = router;
