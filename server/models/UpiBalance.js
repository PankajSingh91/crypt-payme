const mongoose = require('mongoose');

const upiBalanceSchema = new mongoose.Schema({
  upiId: { type: String, required: true, unique: true },
  balance: { type: Number, required: true }
});

module.exports = mongoose.model('UpiBalance', upiBalanceSchema);
