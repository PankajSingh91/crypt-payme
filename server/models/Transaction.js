const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  senderName: {
    type: String,
    required: true,
    trim: true,
  },
  receiverUpiId: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  txHash: {
    type: String,
    required: true,
    trim: true,
  },
  paymentStatus: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);
