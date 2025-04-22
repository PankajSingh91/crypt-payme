import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import navigation

const MakePayment = () => {
  const [amount, setAmount] = useState("");
  const [senderName, setSenderName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [message, setMessage] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false); // ✅ Add this

  const navigate = useNavigate(); // ✅ Initialize navigate

  const handlePayment = async () => {
    const numericAmount = parseFloat(amount);

    if (!senderName || !upiId || isNaN(numericAmount) || numericAmount <= 0) {
      setMessage("⚠️ Please fill out all fields with valid values.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/make-payment", {
        amount: numericAmount,
        senderName: senderName,
        receiverUpiId: upiId,
      });

      setMessage(`✅ ${response.data.message}`);
      setAmount("");
      setSenderName("");
      setUpiId("");
      setPaymentSuccess(true); // ✅ Show redirect button
    } catch (error) {
      console.error("Payment failed:", error);
      setMessage(
        `❌ ${error.response?.data?.message || "Something went wrong. Please try again."}`
      );
      setPaymentSuccess(false); // Hide redirect button if error
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Make Payment</h2>

      <div style={{ marginBottom: "10px" }}>
        <label>Amount (INR): </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Sender's Name: </label>
        <input
          type="text"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Receiver's UPI ID: </label>
        <input
          type="text"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
        />
      </div>

      <button onClick={handlePayment}>Submit Payment</button>

      {message && (
        <p style={{ marginTop: "10px", fontWeight: "bold" }}>{message}</p>
      )}

      {/* ✅ Show button after successful payment */}
      {paymentSuccess && (
        <button
          style={{ marginTop: "10px" }}
          onClick={() => navigate("/balances")}
        >
          Go to Balance Display
        </button>
      )}
    </div>
  );
};

export default MakePayment;
