import React, { useState } from "react";
import { BrowserProvider, Contract, parseEther } from "ethers";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import contractArtifact from "../abi/CryptPayMe.json"; // FIXED
import { getEthPriceInInr } from "../utils/getEthPrice";

const CONTRACT_ADDRESS = "0x549B48C233c115215F4dFfBD180853249E273498";

const MakePayment = () => {
  const [amountInr, setAmountInr] = useState("");
  const [senderName, setSenderName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [status, setStatus] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const contractABI = contractArtifact.abi; // ✅ FIXED

  const handlePayment = async () => {
    if (!amountInr || !senderName || !upiId) {
      setStatus("❌ Please fill out all fields correctly.");
      return;
    }

    if (typeof window.ethereum === "undefined") {
      setStatus("❌ MetaMask not found.");
      return;
    }

    try {
      setLoading(true);
      setStatus("⏳ Connecting to MetaMask...");

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, contractABI, signer); // ✅ FIXED

      const ethPriceInInr = await getEthPriceInInr();
      if (!ethPriceInInr) {
        setStatus("❌ Failed to fetch ETH price.");
        setLoading(false);
        return;
      }

      const ethAmount = (parseFloat(amountInr) / ethPriceInInr).toFixed(6);
      const parsedEth = parseEther(ethAmount.toString());

      const tx = await contract.sendPayment(senderName, upiId, parsedEth, {
        value: parsedEth,
      });

      setStatus("📤 Transaction sent. Waiting for confirmation...");
      await tx.wait();

      await axios.post("http://localhost:5000/api/make-payment", {
        amount: parseFloat(amountInr),
        senderName,
        receiverUpiId: upiId,
        txHash: tx.hash,
      });

      setStatus(`✅ Payment successful! Tx Hash: ${tx.hash}`);
      setAmountInr("");
      setSenderName("");
      setUpiId("");
      setPaymentSuccess(true);
    } catch (error) {
      console.error("❌ Error in transaction or backend:", error);
      setStatus("❌ Transaction failed or rejected. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-xl shadow-xl bg-white">
      <h2 className="text-xl font-bold mb-4">Make a Payment</h2>

      <input
        type="number"
        placeholder="Amount in Rupees (₹)"
        className="w-full p-2 mb-3 border rounded"
        value={amountInr}
        onChange={(e) => setAmountInr(e.target.value)}
      />

      <input
        type="text"
        placeholder="Sender's Name"
        className="w-full p-2 mb-3 border rounded"
        value={senderName}
        onChange={(e) => setSenderName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Receiver's UPI ID"
        className="w-full p-2 mb-3 border rounded"
        value={upiId}
        onChange={(e) => setUpiId(e.target.value)}
      />

      <button
        onClick={handlePayment}
        disabled={loading}
        className={`w-full py-2 px-4 rounded text-white ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>

      {status && (
        <p className="mt-4 text-sm font-semibold text-gray-700">{status}</p>
      )}

      {paymentSuccess && (
        <button
          onClick={() => navigate("/balances")}
          className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
        >
          Go to Balance Display
        </button>
      )}
    </div>
  );
};

export default MakePayment;
