const express = require('express');
const router = express.Router();
const UpiBalance = require('../models/UpiBalance');

// Route: GET /api/balances
router.get('/', async (req, res) => {
  try {
    const balances = await UpiBalance.find({});
    res.json(balances);
  } catch (error) {
    console.error('Error fetching balances:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
