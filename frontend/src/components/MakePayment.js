import { useState } from "react";

const MakePayment = () => {
  const [amount, setAmount] = useState(""); // Amount in INR
  const [senderName, setSenderName] = useState(""); // Sender's Name
  const [upiId, setUpiId] = useState(""); // Receiver's UPI ID

  const handlePayment = () => {
    // Logic to handle the payment
    // Here you can call your smart contract to transfer ETH to the recipient
    console.log("Payment Details:", { amount, senderName, upiId });
    // You would also call your contract interaction function here
  };

  return (
    <div>
      <h2>Make Payment</h2>
      <div>
        <label>Amount (INR): </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div>
        <label>Sender's Name: </label>
        <input
          type="text"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
        />
      </div>
      <div>
        <label>Receiver's UPI ID: </label>
        <input
          type="text"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
        />
      </div>
      <button onClick={handlePayment}>Submit Payment</button>
    </div>
  );
};

export default MakePayment;
