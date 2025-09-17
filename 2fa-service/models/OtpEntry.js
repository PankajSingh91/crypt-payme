// 2fa-service/models/OtpEntry.js
const mongoose = require('mongoose');

const otpEntrySchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 }
});

module.exports = mongoose.model('OtpEntry', otpEntrySchema);
