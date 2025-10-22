import React, { useState } from "react";
import { ArrowLeft, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { BrowserProvider, Contract, parseEther } from "ethers";
import axios from "axios";
import contractArtifact from "../abi/CryptPayMe.json";
import { getEthPriceInInr } from "../utils/getEthPrice";

const CONTRACT_ADDRESS = "0x549B48C233c115215F4dFfBD180853249E273498";
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const MakePayment = () => {
  const [amountInr, setAmountInr] = useState("");
  const [senderName, setSenderName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [status, setStatus] = useState("input"); // input, processing, success, error
  const [txHash, setTxHash] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const contractABI = contractArtifact.abi;

  const isValidName = (name) => /^[A-Za-z ]+$/.test(name.trim());
  const isValidAmount = (amount) =>
    /^[0-9]+(\.[0-9]+)?$/.test(amount) && parseFloat(amount) > 0;
  const isValidUpi = (upi) =>
    /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(upi.toLowerCase());

  const handlePayment = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    console.log("🚀 Starting payment process...");

    if (!senderName.trim()) {
      setErrorMessage("Sender's name is required.");
      setStatus("error");
      return;
    }
    if (!isValidName(senderName)) {
      setErrorMessage("Sender's name must contain only letters and spaces.");
      setStatus("error");
      return;
    }
    if (!amountInr || !isValidAmount(amountInr)) {
      setErrorMessage("Amount must be a positive number (e.g., 100.50).");
      setStatus("error");
      return;
    }
    if (!upiId.trim()) {
      setErrorMessage("UPI ID is required.");
      setStatus("error");
      return;
    }
    if (!isValidUpi(upiId)) {
      setErrorMessage(
        "Invalid UPI ID format (e.g., john@paytm or alice@okaxis). Use lowercase."
      );
      setStatus("error");
      return;
    }

    if (typeof window.ethereum === "undefined") {
      setErrorMessage(
        "MetaMask not detected. Please install MetaMask and refresh."
      );
      setStatus("error");
      return;
    }

    try {
      setStatus("processing");
      console.log("🔗 Requesting MetaMask accounts...");
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      console.log("👛 Wallet address:", userAddress);

      const contract = new Contract(CONTRACT_ADDRESS, contractABI, signer);
      console.log("📄 Contract ready at:", CONTRACT_ADDRESS);

      console.log("💰 Fetching ETH price...");
      const ethPriceInInr = await getEthPriceInInr();
      if (!ethPriceInInr || ethPriceInInr <= 0) {
        throw new Error("ETH price fetch failed or invalid (check internet/API).");
      }
      console.log(`💹 ETH Price: ₹${ethPriceInInr.toLocaleString()}`);

      const amountNum = parseFloat(amountInr);
      const ethAmount = (amountNum / ethPriceInInr).toFixed(8);
      console.log(`🔢 Calculated ETH: ${ethAmount} for ₹${amountNum}`);
      const parsedEth = parseEther(ethAmount);

      console.log("⚡ Sending blockchain transaction...");
      const tx = await contract.sendPayment(senderName, upiId, parsedEth, {
        value: parsedEth,
        gasLimit: 300000,
      });
      console.log("📤 Tx sent, waiting for confirmation... Hash:", tx.hash);

      const receipt = await tx.wait();
      console.log("✅ Tx confirmed! Block:", receipt.blockNumber);

      // Auth check
      const token = localStorage.getItem("cp_auth_token");
      const deviceId = localStorage.getItem("cp_device_id");
      console.log("🔑 Token exists:", !!token);
      console.log("🆔 Device ID:", deviceId);

      if (!token) {
        throw new Error(
          "No auth token. Go back to Dashboard and verify OTP to link your wallet."
        );
      }
      if (!deviceId) {
        throw new Error("No device ID. Refresh the page or check localStorage.");
      }

      console.log("📤 Sending data to backend...");
      const backendResponse = await axios.post(
        `${API_BASE}/api/make-payment`,
        {
          senderWallet: userAddress,
          amount: amountNum,
          senderName,
          receiverUpiId: upiId,
          txHash: tx.hash,
        },
        {
          headers: {
            Authorization: `Bearer ${token.trim()}`,
            "x-device-id": deviceId,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("📦 Headers sent:", {
        Authorization: `Bearer ${token?.substring(0, 15)}...`,
        "x-device-id": deviceId,
      });

      console.log("✅ Backend success:", backendResponse.data);
      setTxHash(tx.hash);
      setStatus("success");
      setAmountInr("");
      setSenderName("");
      setUpiId("");
    } catch (error) {
      console.error("❌ FULL ERROR DETAILS:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        stack: error.stack?.substring(0, 200),
      });

      let userError = "Payment failed. See console for details.";

      if (
        error.code === "INSUFFICIENT_FUNDS" ||
        error.message.includes("insufficient funds")
      ) {
        userError =
          "Insufficient ETH balance or gas fees. Fund your wallet and try again.";
      } else if (
        error.code === "USER_REJECTED_REQUEST" ||
        error.message.includes("user rejected")
      ) {
        userError =
          "Transaction rejected in MetaMask. Approve it to proceed.";
      } else if (
        error.message.includes("price") ||
        error.message.includes("fetch")
      ) {
        userError =
          "Failed to get ETH price. Check your connection and try again.";
      } else if (error.response?.status === 400) {
        userError = `Invalid input: ${
          error.response.data.message || "Check name, amount, or UPI ID."
        }`;
      } else if (error.response?.status === 403) {
        userError =
          "Wallet not linked to your account. Go to Dashboard, re-verify OTP, and link wallet.";
      } else if (error.response?.status === 401) {
        userError = "Session expired. Re-verify OTP in Dashboard.";
      } else if (error.response?.status === 500) {
        userError =
          "Server error (e.g., payout failed). Check Razorpay setup or server logs.";
      } else if (
        error.message.includes("contract") ||
        error.message.includes("revert")
      ) {
        userError =
          "Smart contract error. Verify contract address/ABI or network (use Ethereum Mainnet).";
      } else if (
        error.message.includes("token") ||
        error.message.includes("auth")
      ) {
        userError = "Authentication issue. Re-verify OTP in Dashboard.";
      }

      setErrorMessage(userError);
      setStatus("error");
    }
  };

  const handleRetry = () => {
    setStatus("input");
    setErrorMessage("");
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
              <h1 className="text-3xl font-bold mb-8">
                Make Payment (ETH → UPI)
              </h1>

              <form onSubmit={handlePayment}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Sender's Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-black/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00D4FF] text-white placeholder-gray-500"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Enter your name (letters only)"
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
                      min="0.01"
                      className="w-full bg-black/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00D4FF] text-white placeholder-gray-500"
                      value={amountInr}
                      onChange={(e) => setAmountInr(e.target.value)}
                      placeholder="e.g., 100.50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Receiver UPI ID
                    </label>
                    <input
                      type="text"
                      className="w-full bg-black/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00D4FF] text-white placeholder-gray-500"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g., john@paytm"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "processing"}
                    className="w-full bg-gradient-to-r from-[#00D4FF] to-[#00FF85] text-black font-bold py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    {status === "processing"
                      ? "Processing..."
                      : "Make Payment"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {status === "processing" && (
            <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00D4FF] mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
              <p className="text-gray-400">
                Please wait... (Check console for progress)
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-[#00FF85] mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-gray-400 mb-4">Transaction Hash:</p>
              <p className="text-green-300 font-mono break-all mb-8">{txHash}</p>
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-gradient-to-r from-[#00D4FF] to-[#00FF85] text-black font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity"
              >
                Back to Dashboard
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-red-400">
                Payment Failed
              </h2>
              <p className="text-gray-400 mb-6">{errorMessage}</p>
              <p className="text-xs text-gray-500 mb-4">
                Open browser console (F12) for full error details.
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

export default MakePayment;
