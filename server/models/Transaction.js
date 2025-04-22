const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  senderName: String,
  receiverUpiId: String,
  amount: Number,
  timestamp: { type: Date, default: Date.now },
  paymentStatus: String
});

module.exports = mongoose.model('Transaction', transactionSchema);
