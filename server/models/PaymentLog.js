const mongoose = require('mongoose');

const paymentLogSchema = new mongoose.Schema({
  senderName: String,
  receiverUpiId: String,
  amount: Number,
  status: String,
  date: { type: Date, default: Date.now } // 👈 auto-set date
});

module.exports = mongoose.model('PaymentLog', paymentLogSchema);
