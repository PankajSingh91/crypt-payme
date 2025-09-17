// frontend/src/components/OTPModal.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function OTPModal({ email, visible, onClose, onVerified, deviceId, wallet }) {
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const API = process.env.REACT_APP_API_BASE || '';

  useEffect(() => {
    let t;
    if (cooldown > 0) {
      t = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [cooldown]);

  async function sendOtp() {
    try {
      setSending(true);
      await axios.post(
        `${API}/auth/request-otp`,
        { email },
        { headers: { 'x-device-id': deviceId }, withCredentials: true }
      );
      setCooldown(60);
      alert('OTP sent to ' + email);
    } catch (e) {
      console.error('request-otp error', e?.response?.data || e?.message || e);
      alert('Failed to send OTP');
    } finally {
      setSending(false);
    }
  }

  async function verify() {
    if (!wallet) {
      alert("No wallet connected. Please connect your wallet before verifying.");
      return;
    }

    // normalize wallet address (lowercase)
    const walletAddress = String(wallet).toLowerCase();

    try {
      const resp = await axios.post(
        `${API}/auth/verify-otp`,
        { email, otp, walletAddress },                 // <-- send walletAddress
        { headers: { 'x-device-id': deviceId }, withCredentials: true }
      );
      onVerified && onVerified(resp.data.user);
    } catch (e) {
      console.error('verify-otp error', e?.response?.data || e?.message || e);
      const msg = e?.response?.data?.error || 'OTP invalid or expired. Try resend.';
      alert(msg);
    }
  }

  if (!visible) return null;
  return (
    <div
      className="otp-modal"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ background: '#fff', padding: 20, borderRadius: 8, width: 400 }}>
        <h3>OTP verification — {email}</h3>
        <div>
          <button onClick={sendOtp} disabled={cooldown > 0 || sending}>
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Send OTP'}
          </button>
        </div>
        <div style={{ marginTop: 10 }}>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
          />
          <button onClick={verify}>Verify</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
