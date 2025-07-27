import React, { useState } from "react";
import { ArrowLeft, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { BrowserProvider, Contract, parseEther } from "ethers";
import axios from "axios";
import contractArtifact from "../abi/CryptPayMe.json";
import { getEthPriceInInr } from "../utils/getEthPrice";

const CONTRACT_ADDRESS = "0x549B48C233c115215F4dFfBD180853249E273498";

const MakePayment = () => {
  const [amountInr, setAmountInr] = useState("");
  const [senderName, setSenderName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [status, setStatus] = useState("input"); // input, processing, success, error
  const [txHash, setTxHash] = useState("");

  const navigate = useNavigate();
  const contractABI = contractArtifact.abi;

  const isValidName = (name) => /^[A-Za-z ]+$/.test(name.trim());
  const isValidAmount = (amount) => /^[0-9]+(\.[0-9]+)?$/.test(amount);
  const isValidUpi = (upi) => /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(upi);

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!isValidName(senderName) || !isValidAmount(amountInr) || !isValidUpi(upiId)) {
      setStatus("error");
      return;
    }

    if (typeof window.ethereum === "undefined") {
      setStatus("error");
      return;
    }

    try {
      setStatus("processing");
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, contractABI, signer);

      const ethPriceInInr = await getEthPriceInInr();
      if (!ethPriceInInr) {
        setStatus("error");
        return;
      }

      const ethAmount = (parseFloat(amountInr) / ethPriceInInr).toFixed(6);
      const parsedEth = parseEther(ethAmount.toString());

      const tx = await contract.sendPayment(senderName, upiId, parsedEth, {
        value: parsedEth,
      });

      await tx.wait();

      await axios.post("http://localhost:5000/api/make-payment", {
        amount: parseFloat(amountInr),
        senderName,
        receiverUpiId: upiId,
        txHash: tx.hash,
      });

      setTxHash(tx.hash);
      setStatus("success");
      setAmountInr("");
      setSenderName("");
      setUpiId("");
    } catch (error) {
      console.error("❌ Error in transaction or backend:", error);
      setStatus("error");
    }
  };

  const handleRetry = () => {
    setStatus("input");
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-['Space_Grotesk']">
      <div className="container mx-auto px-6 py-12">
        <Link to="/dashboard" className="flex items-center text-gray-400 hover:text-white mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>

        <div className="max-w-2xl mx-auto">
          {status === "input" && (
            <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-8">
              <h1 className="text-3xl font-bold mb-8">Make Payment (ETH → UPI)</h1>

              <form onSubmit={handlePayment}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Sender's Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-black/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Amount (INR)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full bg-black/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                      value={amountInr}
                      onChange={(e) => setAmountInr(e.target.value)}
                      placeholder="Amount in ₹"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Receiver UPI ID
                    </label>
                    <input
                      type="text"
                      className="w-full bg-black/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="example@upi"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#00D4FF] to-[#00FF85] text-black font-bold py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Make Payment
                  </button>
                </div>
              </form>
            </div>
          )}

          {status === "processing" && (
            <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00D4FF] mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
              <p className="text-gray-400">Please wait while we process your transaction...</p>
            </div>
          )}

          {status === "success" && (
            <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-[#00FF85] mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-gray-400 mb-4">Transaction Hash:</p>
              <p className="text-green-300 font-mono break-all mb-8">{txHash}</p>
              <button
                onClick={() => navigate("/balances")}
                className="bg-gradient-to-r from-[#00D4FF] to-[#00FF85] text-black font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity"
              >
                Go to Balance Display
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-red-400">Payment Failed</h2>
              <p className="text-gray-400 mb-6">Something went wrong. Please check your inputs or try again.</p>
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

export default MakePayment;
