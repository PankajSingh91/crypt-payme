const express = require('express');
const router = express.Router();
const { razorpay_key_id, razorpay_key_secret } = require('../config');
const Balance = require('../models/UpiBalance');
const Transaction = require('../models/Transaction');

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

    // Input Validation
    if (!senderName || !receiverUpiId || !txHash || isNaN(numericAmount) || numericAmount <= 0) {
      console.warn("❌ Invalid input data received");
      return res.status(400).json({ success: false, message: "Invalid input data" });
    }

    // Simulate Razorpay Success
    const paymentSuccess = true;

    // Update or Create Balance
    const existingBalance = await Balance.findOne({ upiId: receiverUpiId });

    if (existingBalance) {
      existingBalance.balance += numericAmount;
      await existingBalance.save();
      console.log(`✅ Updated existing balance for ${receiverUpiId}`);
    } else {
      const newBalance = new Balance({
        upiId: receiverUpiId,
        balance: numericAmount
      });
      await newBalance.save();
      console.log(`✅ Created new balance entry for ${receiverUpiId}`);
    }

    // Log the Transaction
    const newTransaction = new Transaction({
      senderName,
      receiverUpiId,
      amount: numericAmount,
      txHash,
      paymentStatus: paymentSuccess ? 'success' : 'failed'
    });

    await newTransaction.save();
    console.log(`📝 Transaction recorded for ₹${numericAmount}`);

    // Send success response
    return res.status(200).json({ success: true, message: "Payment and logging successful." });
  } catch (error) {
    console.error('❌ Error in /make-payment route:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during payment.' });
  }
});

module.exports = router;
