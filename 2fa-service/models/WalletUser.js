// 2fa-service/models/WalletUser.js
const mongoose = require('mongoose');

const walletUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  wallets: [{ type: String }]
});

module.exports = mongoose.model('WalletUser', walletUserSchema);
