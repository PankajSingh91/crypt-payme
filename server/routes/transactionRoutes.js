const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// GET /api/transactions - Fetch all transactions sorted by timestamp (latest first)
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ timestamp: -1 });

    const formattedTransactions = transactions.map(tx => ({
      senderName: tx.senderName,
      receiverUpiId: tx.receiverUpiId,
      amount: tx.amount,
      txHash: tx.txHash,
      paymentStatus: tx.paymentStatus,
      timestamp: tx.timestamp
    }));

    res.status(200).json(formattedTransactions);
  } catch (error) {
    console.error('❌ Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error while fetching transactions' });
  }
});

module.exports = router;
