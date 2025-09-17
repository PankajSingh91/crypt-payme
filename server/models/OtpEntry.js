// server/models/OtpEntry.js
const mongoose = require('mongoose');

const OtpEntrySchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otpHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// optional TTL index — remove documents after expire + 1 day (backup)
OtpEntrySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

module.exports = mongoose.model('OtpEntry', OtpEntrySchema);
