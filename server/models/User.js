const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  walletAddress: { type: String, unique: true, required: true },
  email: { type: String, required: true },
  verified: { type: Boolean, default: false },
  otpVerifiedAt: { type: Date },
  deviceId: { type: String }, // ✅ Bind OTP session to device
});

module.exports = mongoose.model("User", userSchema);
