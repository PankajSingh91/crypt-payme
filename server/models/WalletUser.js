// server/models/WalletUser.js
const mongoose = require('mongoose');

const WalletUserSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  wallets: { type: [String], default: [] }, // store lowercase addresses
  createdAt: { type: Date, default: Date.now }
});

WalletUserSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('WalletUser', WalletUserSchema);
