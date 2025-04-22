const axios = require('axios');
const UpiBalance = require('../models/UpiBalance');
const PaymentLog = require('../models/PaymentLog');

const RAZORPAY_BASE_URL = 'https://api.razorpay.com/v1';
const auth = {
  username: process.env.RAZORPAY_KEY_ID,
  password: process.env.RAZORPAY_KEY_SECRET
};

exports.makePayment = async (req, res) => {
  try {
    const { amountInRupees, senderName, receiverUpiId } = req.body;

    let contactId;

    // 🔍 1️⃣ Try to find existing contact by reference_id
    const searchRes = await axios.get(`${RAZORPAY_BASE_URL}/contacts`, {
      auth,
      params: {
        reference_id: receiverUpiId
      }
    });

    if (searchRes.data.items && searchRes.data.items.length > 0) {
      contactId = searchRes.data.items[0].id;
    } else {
      // 👤 2️⃣ Create new contact if not found
      const contactRes = await axios.post(`${RAZORPAY_BASE_URL}/contacts`, {
        name: senderName,
        email: "test@example.com",
        contact: "9876543210",
        type: "vendor",
        reference_id: receiverUpiId,
        notes: { created_by: "CryptPayMe" }
      }, { auth });

      contactId = contactRes.data.id;
    }

    // 💳 3️⃣ Create Fund Account
    const fundAccountRes = await axios.post(`${RAZORPAY_BASE_URL}/fund_accounts`, {
      contact_id: contactId,
      account_type: "vpa",
      vpa: { address: receiverUpiId }
    }, { auth });

    const fundAccountId = fundAccountRes.data.id;

    // 💸 4️⃣ Initiate Payout
    const payoutRes = await axios.post(`${RAZORPAY_BASE_URL}/payouts`, {
      account_number: "2323230010430956", // Razorpay test account
      fund_account_id: fundAccountId,
      amount: amountInRupees * 100,
      currency: "INR",
      mode: "UPI",
      purpose: "payout",
      queue_if_low_balance: true,
      reference_id: `txn_${Date.now()}`,
      narration: "CryptPayMe Payment"
    }, { auth });

    // 📘 5️⃣ Update MongoDB UPI Balance
    let balanceDoc = await UpiBalance.findOne({ upiId: receiverUpiId });
    if (!balanceDoc) {
      balanceDoc = new UpiBalance({ upiId: receiverUpiId, balance: 0 });
    }
    balanceDoc.balance += amountInRupees;
    await balanceDoc.save();

    // 📝 6️⃣ Save Payment Log
    const newLog = new PaymentLog({
      senderName,
      receiverUpiId,
      amount: amountInRupees,
      status: 'SUCCESS',
      date: new Date()
    });
    await newLog.save();

    res.json({ message: "✅ Payment completed and balance updated." });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: "❌ Payment failed", error: error.message });
  }
};
