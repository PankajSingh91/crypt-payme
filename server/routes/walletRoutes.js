// server/routes/walletRoutes.js
const express = require('express');
const router = express.Router();
const verify2fa = require('../middleware/verify2fa')(); // ensures req.user exists
const { addWalletToUser } = require('../services/2faClient');

/**
 * POST /wallets/add
 * body: { wallet }
 * Protected: requires verify2fa middleware (attaches req.user)
 */
router.post('/add', verify2fa, async (req, res) => {
  try {
    const wallet = req.body.wallet;
    if (!wallet) return res.status(400).json({ error: 'wallet required' });

    // Get email from req.user (attached by verify2fa middleware)
    const email = req.user?.email || req.user?.user?.email;
    if (!email) return res.status(401).json({ error: 'authenticated user not found' });

    // If your 2FA client expects a token or deviceId, include them.
    // Try to read cookie token or Authorization header if available
    const cookieName = process.env.AUTH_COOKIE_NAME || 'cp_auth';
    const tokenFromCookie = req.cookies ? req.cookies[cookieName] : undefined;
    const bearerToken = req.headers.authorization ? req.headers.authorization.split(' ')[1] : undefined;
    const token = tokenFromCookie || bearerToken;

    const deviceId = req.headers['x-device-id'];

    // IMPORTANT: call helper with an object matching the helper signature
    const resp = await addWalletToUser({ email, wallet, token, deviceId });

    // Expect microservice to return { ok: true, user: { email, wallets } } or similar
    const user = resp.user || resp;
    return res.json({ ok: true, user: { email: user.email, wallets: user.wallets } });
  } catch (err) {
    console.error('wallet add err', err?.response?.data || err?.message || err);
    // If axios error, try to surface microservice message
    const status = err?.response?.status || 500;
    const data = err?.response?.data || { error: 'failed to add wallet' };
    return res.status(status).json(data);
  }
});

module.exports = router;
