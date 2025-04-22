const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// GET /api/transactions - Fetch all transaction logs
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ timestamp: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
