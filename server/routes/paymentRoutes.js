// server/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { razorpay_key_id, razorpay_key_secret } = require('../config');
const Transaction = require('../models/Transaction');
const { makePayment: razorpayPayout } = require('../controllers/paymentController');
const verify2fa = require('../middleware/verify2fa')();

/**
 * Test Razorpay Keys Route
 */
router.get('/test-razorpay-keys', (req, res) => {
  res.json({ key: razorpay_key_id, secret: razorpay_key_secret });
});

/**
 * Main Payment Route
 * Protected by verify2fa middleware
 *
 * Expected body:
 * {
 *   senderWallet: "0xabc...",      // required and must belong to authenticated user
 *   senderName: "Alice",
 *   receiverUpiId: "bob@upi",
 *   amount: 100,
 *   txHash: "0x..."                // blockchain tx hash (required in current implementation)
 * }
 */
router.post('/make-payment', verify2fa, async (req, res) => {
  try {
    const { senderWallet, senderName, receiverUpiId, amount, txHash } = req.body;
    const numericAmount = Number(amount);

    console.log("==== Received Payment Request ====");
    console.log("Auth user (req.user):", !!req.user);
    console.log("Sender Wallet (body):", senderWallet);
    console.log("Sender Name:", senderName);
    console.log("Receiver UPI ID:", receiverUpiId);
    console.log("Amount (₹):", numericAmount);
    console.log("Tx Hash:", txHash || "No Tx Hash Received");
    console.log("===================================");

    // Basic validation of inputs
    if (!senderWallet) {
      console.warn("❌ senderWallet is required");
      return res.status(400).json({ success: false, message: "senderWallet is required" });
    }
    if (!senderName || !receiverUpiId || !txHash || isNaN(numericAmount) || numericAmount <= 0) {
      console.warn("❌ Invalid input data received");
      return res.status(400).json({ success: false, message: "Invalid input data" });
    }

    // Ensure req.user exists (set by verify2fa middleware)
    if (!req.user) {
      console.warn("❌ Authenticated user not found on request (verify2fa may have failed)");
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // Extract wallets array from req.user while being defensive about shape
    // 2FA service might return profile in different shapes like { wallets: [...] } or { user: { wallets: [...] } }
    const possibleWallets =
      (Array.isArray(req.user.wallets) && req.user.wallets) ||
      (req.user.user && Array.isArray(req.user.user.wallets) && req.user.user.wallets) ||
      [];

    const normalizedUserWallets = possibleWallets.map(w => (typeof w === 'string' ? w.toLowerCase() : ''));

    if (!normalizedUserWallets.includes(String(senderWallet).toLowerCase())) {
      console.warn(`❌ Unauthorized wallet. Sender wallet ${senderWallet} is not linked to authenticated user.`);
      return res.status(403).json({ success: false, message: "Wallet not authorized for this user" });
    }

    // ✅ Call Razorpay payout function from controller (handles balance update and payout)
    // The original controller expects (req, res). We'll provide a simple mock response object
    // so that the controller's internal calls to res.status(...).json(...) won't crash.
    const mockRes = {
      status(code) {
        this._status = code;
        return this;
      },
      json(payload) {
        this._json = payload;
        return this;
      },
      // some controllers may call res.send; include a no-op
      send(payload) {
        this._send = payload;
        return this;
      }
    };

    try {
      await razorpayPayout(
        {
          body: {
            amountInRupees: numericAmount,
            senderName,
            receiverUpiId,
            senderWallet,
            txHash
          }
        },
        mockRes
      );
      // Optionally inspect mockRes._status/_json for payout result if needed
    } catch (payoutErr) {
      console.error('❌ Error during razorpayPayout:', payoutErr?.response?.data || payoutErr.message || payoutErr);
      // If payout fails, respond with failure (do not write successful transaction entry)
      return res.status(500).json({ success: false, message: "Payout failed", error: String(payoutErr) });
    }

    // ✅ Log the blockchain-side transaction (txHash)
    const newTransaction = new Transaction({
      senderName,
      senderWallet,
      receiverUpiId,
      amount: numericAmount,
      txHash,
      paymentStatus: 'success',
      createdAt: new Date()
    });

    await newTransaction.save();
    console.log(`📝 Transaction recorded for ₹${numericAmount} (txHash: ${txHash})`);

    return res.status(200).json({ success: true, message: "Payment, payout, and logging successful." });

  } catch (error) {
    console.error('❌ Error in /make-payment route:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during payment.' });
  }
});

module.exports = router;
