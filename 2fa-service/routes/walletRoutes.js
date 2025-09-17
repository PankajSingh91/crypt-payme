// 2fa-service/routes/walletRoutes.js
const express = require('express');
const router = express.Router();
const authService = require('../services/authService');

/**
 * POST /api/wallets/add
 * body: { email, wallet }
 *
 * Optional: you can protect this route with a token header if you want.
 */
router.post('/add', async (req, res) => {
  try {
    const { email, wallet } = req.body;
    if (!email || !wallet) {
      return res.status(400).json({ error: 'email and wallet required' });
    }

    const user = await authService.addWalletToUser(email, wallet);
    return res.json({ ok: true, user: { email: user.email, wallets: user.wallets } });
  } catch (err) {
    console.error('wallets/add error', err?.message || err);
    return res.status(500).json({ error: 'failed to add wallet' });
  }
});

module.exports = router;
