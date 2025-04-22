// server/routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const { razorpay_key_id, razorpay_key_secret } = require('../config');
const Balance = require('../models/UpiBalance');
const Transaction = require('../models/Transaction');

// Route to fetch Razorpay keys (for testing)
router.get('/test-razorpay-keys', (req, res) => {
  res.json({ key: razorpay_key_id, secret: razorpay_key_secret });
});

// Route to simulate payment and update balance + log transaction
router.post('/make-payment', async (req, res) => {
  try {
    const { senderName, receiverUpiId, amount } = req.body;

    // Convert and log inputs
    const numericAmount = Number(amount);
    console.log("==== Received Payment Request ====");
    console.log("Sender Name:     ", senderName);
    console.log("Receiver UPI ID: ", receiverUpiId);
    console.log("Amount (raw):    ", amount);
    console.log("Amount (number): ", numericAmount);
    console.log("===================================");

    // Validate input
    if (!receiverUpiId || isNaN(numericAmount) || numericAmount <= 0) {
      console.warn("❌ Invalid input data received");
      return res.status(400).json({ success: false, message: "Invalid input data" });
    }

    // Simulated Razorpay success
    const paymentSuccess = true;

    // Update or create receiver balance
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
      console.log(`✅ Created new balance for ${receiverUpiId}`);
    }

    // Log the transaction
    const newTransaction = new Transaction({
      senderName,
      receiverUpiId,
      amount: numericAmount,
      paymentStatus: paymentSuccess ? 'success' : 'failed'
    });

    await newTransaction.save();
    console.log(`📝 Transaction logged for ₹${numericAmount}`);

    res.status(200).json({ success: true, message: 'Payment completed and balance updated.' });
  } catch (error) {
    console.error('❌ Payment error:', error);
    res.status(500).json({ success: false, message: 'Payment failed due to server error.' });
  }
});

module.exports = router;
