const express = require('express');
const router = express.Router();
const { razorpay_key_id, razorpay_key_secret } = require('../config');
const Transaction = require('../models/Transaction');
const { makePayment: razorpayPayout } = require('../controllers/paymentController');

// Test Razorpay Keys Route
router.get('/test-razorpay-keys', (req, res) => {
  res.json({ key: razorpay_key_id, secret: razorpay_key_secret });
});

// Main Payment Route
router.post('/make-payment', async (req, res) => {
  try {
    const { senderName, receiverUpiId, amount, txHash } = req.body;
    const numericAmount = Number(amount);

    console.log("==== Received Payment Request ====");
    console.log("Sender Name:     ", senderName);
    console.log("Receiver UPI ID: ", receiverUpiId);
    console.log("Amount (₹):      ", numericAmount);
    console.log("Tx Hash:         ", txHash || "No Tx Hash Received");
    console.log("===================================");

    if (!senderName || !receiverUpiId || !txHash || isNaN(numericAmount) || numericAmount <= 0) {
      console.warn("❌ Invalid input data received");
      return res.status(400).json({ success: false, message: "Invalid input data" });
    }

    // ✅ Call Razorpay payout function from controller (handles balance update and payout)
    await razorpayPayout({
      body: {
        amountInRupees: numericAmount,
        senderName,
        receiverUpiId
      }
    }, {
      json: () => {}, // dummy response to satisfy the controller
      status: () => ({ json: () => {} })
    });

    // ✅ Log the blockchain-side transaction (txHash)
    const newTransaction = new Transaction({
      senderName,
      receiverUpiId,
      amount: numericAmount,
      txHash,
      paymentStatus: 'success'
    });

    await newTransaction.save();
    console.log(`📝 Transaction recorded for ₹${numericAmount}`);

    return res.status(200).json({ success: true, message: "Payment, payout, and logging successful." });

  } catch (error) {
    console.error('❌ Error in /make-payment route:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during payment.' });
  }
});

module.exports = router;
