import React, { useState } from "react";
import { ArrowLeft, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { BrowserProvider, Contract, parseEther } from "ethers";
import axios from "axios";
import contractArtifact from "../abi/CryptPayMe.json";
import { getEthPriceInInr } from "../utils/getEthPrice";

const CONTRACT_ADDRESS = "0x549B48C233c115215F4dFfBD180853249E273498";

const PaymentFlow = () => {
  const [paymentDetails, setPaymentDetails] = useState({
    senderName: "",
    amount: "",
    upi: "",
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("input");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const contractABI = contractArtifact.abi;

  const validateInputs = () => {
    const newErrors = {};
    if (!/^[A-Za-z\s]+$/.test(paymentDetails.senderName)) {
      newErrors.senderName = "Name must contain only alphabets.";
    }
    if (!/^\d+(\.\d{1,2})?$/.test(paymentDetails.amount)) {
      newErrors.amount = "Enter a valid number.";
    }
    if (!paymentDetails.upi.includes("@")) {
      newErrors.upi = "UPI ID must contain '@'.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!validateInputs()) return;

    if (typeof window.ethereum === "undefined") {
      setStatus("error");
      return;
    }

    try {
      setStatus("processing");
      setLoading(true);

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, contractABI, signer);

      const ethPriceInInr = await getEthPriceInInr();
      if (!ethPriceInInr) {
        setStatus("error");
        setLoading(false);
        return;
      }

      const ethAmount = (
        parseFloat(paymentDetails.amount) / ethPriceInInr
      ).toFixed(6);
      const parsedEth = parseEther(ethAmount.toString());

      const tx = await contract.sendPayment(
        paymentDetails.senderName,
        paymentDetails.upi,
        parsedEth,
        { value: parsedEth }
      );

      await tx.wait();

      await axios.post("http://localhost:5000/api/make-payment", {
        amount: parseFloat(paymentDetails.amount),
        senderName: paymentDetails.senderName,
        receiverUpiId: paymentDetails.upi,
        txHash: tx.hash,
      });

      setStatus("success");
    } catch (err) {
      console.error("❌ Error:", err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setStatus("input");
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-['Space_Grotesk']">
      <div className="container mx-auto px-6 py-12">
        <Link
          to="/dashboard"
          className="flex items-center text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>

        <div className="max-w-2xl mx-auto">
          {status === "input" && (
            <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-8">
              <h1 className="text-3xl font-bold mb-8">Send Payment</h1>

              <form onSubmit={handlePayment} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Sender Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-black/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                    placeholder="Enter your name"
                    value={paymentDetails.senderName}
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        senderName: e.target.value,
                      })
                    }
                  />
                  {errors.senderName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.senderName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Amount (INR)
                  </label>
                  <input
                    type="text"
                    className="w-full bg-black/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                    placeholder="Amount in ₹"
                    value={paymentDetails.amount}
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        amount: e.target.value,
                      })
                    }
                  />
                  {errors.amount && (
                    <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Receiver UPI ID
                  </label>
                  <input
                    type="text"
                    className="w-full bg-black/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                    placeholder="example@upi"
                    value={paymentDetails.upi}
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        upi: e.target.value,
                      })
                    }
                  />
                  {errors.upi && (
                    <p className="text-red-500 text-sm mt-1">{errors.upi}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#00D4FF] to-[#00FF85] text-black font-bold py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {loading ? "Processing..." : "Send Payment"}
                </button>
              </form>
            </div>
          )}

          {status === "processing" && (
            <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00D4FF] mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
              <p className="text-gray-400">
                Please wait while we process your transaction...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-[#00FF85] mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-gray-400 mb-8">
                Your transaction has been processed successfully.
              </p>
              <button
                onClick={() => navigate("/balances")}
                className="inline-block bg-gradient-to-r from-[#00D4FF] to-[#00FF85] text-black font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity"
              >
                Go to Balance Display
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-red-400">
                Payment Failed
              </h2>
              <p className="text-gray-400 mb-6">
                Something went wrong while processing your payment. Please try
                again.
              </p>
              <button
                onClick={handleRetry}
                className="inline-block bg-gradient-to-r from-red-400 to-pink-500 text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentFlow;
