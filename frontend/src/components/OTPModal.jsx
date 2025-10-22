// frontend/src/components/OTPModal.js
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function OTPModal({
  email,
  visible,
  onClose,
  onVerified,
  deviceId,
  wallet,
}) {
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const API = process.env.REACT_APP_API_BASE || "";

  // Countdown timer for resend button
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Request OTP from backend
  async function sendOtp() {
    if (!email) return alert("Please provide a valid email address.");
    try {
      setSending(true);
      await axios.post(
        `${API}/auth/request-otp`,
        { email },
        { headers: { "x-device-id": deviceId }, withCredentials: true }
      );
      setCooldown(60);
      alert(`OTP sent to ${email}`);
    } catch (err) {
      console.error("request-otp error", err?.response?.data || err);
      alert(err?.response?.data?.error || "Failed to send OTP. Try again.");
    } finally {
      setSending(false);
    }
  }

  // Verify OTP and store auth token
  async function verifyOtp() {
    if (!wallet) {
      alert("No wallet connected. Please connect your wallet before verifying.");
      return;
    }
    if (!otp.trim()) {
      alert("Please enter the OTP.");
      return;
    }

    const walletAddress = String(wallet).toLowerCase();
    try {
      setVerifying(true);
      const resp = await axios.post(
        `${API}/auth/verify-otp`,
        { email, otp, walletAddress },
        { headers: { "x-device-id": deviceId }, withCredentials: true }
      );

      // ✅ Save token locally for authenticated requests
      if (resp?.data?.token) {
        localStorage.setItem("cp_auth_token", resp.data.token);
      }

      alert("✅ OTP verified successfully!");
      onVerified && onVerified(resp.data.user);
      onClose && onClose();
    } catch (err) {
      console.error("verify-otp error", err?.response?.data || err);
      const msg = err?.response?.data?.error || "OTP invalid or expired. Try again.";
      alert(msg);
    } finally {
      setVerifying(false);
    }
  }

  if (!visible) return null;

  const modalStyle = {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.5)",
    zIndex: 9999,
    fontFamily: "'Space Grotesk', sans-serif",
  };

  const innerModalStyle = {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: 24,
    borderRadius: 12,
    width: 380,
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    color: "white",
  };

  const titleStyle = {
    marginBottom: 12,
    color: "white",
    fontWeight: "bold",
  };

  const emailStyle = {
    marginBottom: 16,
    color: "rgba(255,255,255,0.8)",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(0,0,0,0.3)",
    color: "white",
    marginBottom: 12,
    fontSize: 16,
    textAlign: "center",
    letterSpacing: 2,
  };

  const buttonContainerStyle = {
    display: "flex",
    gap: 10,
  };

  const sendButtonStyle = {
    background: "linear-gradient(to right, #00D4FF, #00FF85)",
    color: "black",
    padding: "8px 14px",
    borderRadius: 6,
    border: "none",
    cursor: sending || cooldown > 0 ? "not-allowed" : "pointer",
    fontWeight: "bold",
    transition: "opacity 0.2s",
    opacity: sending || cooldown > 0 ? 0.7 : 1,
  };

  const verifyButtonStyle = {
    flex: 1,
    background: "#00FF85",
    color: "black",
    padding: "10px",
    borderRadius: 6,
    border: "none",
    cursor: verifying ? "not-allowed" : "pointer",
    fontWeight: "bold",
    transition: "opacity 0.2s",
    opacity: verifying ? 0.7 : 1,
  };

  const cancelButtonStyle = {
    flex: 1,
    background: "rgba(255,255,255,0.1)",
    color: "white",
    padding: "10px",
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.2)",
    cursor: "pointer",
    transition: "background 0.2s",
  };

  return (
    <div style={modalStyle}>
      <div style={innerModalStyle}>
        <h3 style={titleStyle}>2FA Verification</h3>
        <p style={emailStyle}>Email: <b>{email}</b></p>

        <button
          onClick={sendOtp}
          disabled={cooldown > 0 || sending}
          style={sendButtonStyle}
        >
          {sending
            ? "Sending..."
            : cooldown > 0
            ? `Resend in ${cooldown}s`
            : "Send OTP"}
        </button>

        <div style={{ marginTop: 20 }}>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            maxLength={6}
            style={inputStyle}
          />

          <div style={buttonContainerStyle}>
            <button
              onClick={verifyOtp}
              disabled={verifying}
              style={verifyButtonStyle}
            >
              {verifying ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              onClick={onClose}
              style={cancelButtonStyle}
              onMouseOver={(e) => {
                e.target.style.background = "rgba(255,255,255,0.2)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "rgba(255,255,255,0.1)";
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
