// frontend/src/pages/Dashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Wallet, Send, Download, Home, Shield, History, ChevronRight, ArrowUpRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BlockchainContext } from '../context/BlockchainContext';
import OTPModal from "../components/OTPModal";

// Ensure axios will send cookies (HttpOnly cookie set by server)
axios.defaults.withCredentials = true;
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

function Dashboard() {
  const { currentAccount, balance, connectWallet } = useContext(BlockchainContext);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [otpVisible, setOtpVisible] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // generate / reuse device id
    let id = localStorage.getItem('cp_device_id');
    if (!id) {
      id = 'cp-' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('cp_device_id', id);
    }
    setDeviceId(id);
  }, []);

  useEffect(() => {
    if (currentAccount) {
      axios.get(`${API_BASE}/api/transactions`)
        .then((res) => {
          const latestThree = Array.isArray(res.data) ? res.data.slice(0, 3) : [];
          setRecentTransactions(latestThree);
        })
        .catch((err) => {
          console.error('Failed to load recent transactions:', err);
        });
    }
  }, [currentAccount]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error('Connection error:', error);
      alert('Wallet connection failed/denied.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Check current authentication with backend (2FA) - UPDATED with better headers and logging
  async function checkAuth() {
    try {
      const token = localStorage.getItem('cp_auth_token');
      const headers = {
        'x-device-id': deviceId,
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const config = {
        headers,
        withCredentials: true  // ✅ Ensure cookies are sent as fallback
      };
      console.log('checkAuth headers:', headers);  // ✅ Debug: Check in console

      const resp = await axios.get(`${API_BASE}/auth/whoami`, config);

      return resp.data.user || resp.data;
    } catch (err) {
      console.error('checkAuth failed:', err?.response?.status, err?.response?.data || err.message);
      return null;
    }
  }

  // Primary handler for Make Payment (intercepts link)
  const handleMakePaymentClick = async (e) => {
    e.preventDefault();
    // Ensure wallet connected
    if (!currentAccount) {
      await handleConnect();
      // if still not connected, abort
      if (!currentAccount) return;
    }

    // Check if user is authenticated and whether wallet is linked
    const profile = await checkAuth();
    const wallets = (profile && (profile.wallets || profile.user?.wallets)) || [];
    const normalizedWallets = wallets.map(w => (typeof w === 'string' ? w.toLowerCase() : ''));
    const addr = (currentAccount || '').toLowerCase();

    if (normalizedWallets.includes(addr)) {
      // wallet already linked and user authenticated
      navigate('/make-payment');
      return;
    }

    // Need OTP + link flow
    let emailToUse = email;
    if (!emailToUse || emailToUse.trim().length === 0) {
      // prompt user for email (keeps UI simple and inline to your design)
      const entered = prompt('Enter email to receive OTP (this will be linked to your wallet):');
      if (!entered) return alert('Email required to proceed.');
      emailToUse = entered.trim();
      setEmail(emailToUse);
    }

    // request OTP via CryptPayMe backend (which proxies to your 2FA microservice)
    try {
      await axios.post(`${API_BASE}/auth/request-otp`, { email: emailToUse }, { 
        headers: { 'x-device-id': deviceId },
        withCredentials: true  // ✅ Add for consistency (cookies if any)
      });
      setOtpVisible(true);
    } catch (err) {
      console.error('request-otp failed', err?.response?.data || err?.message);
      alert('Failed to request OTP. Try again.');
    }
  };

  // Called when OTP verified successfully (server returns profile). Link wallet then navigate. - UPDATED with auth headers
  const onOtpVerified = async (profile) => {
    setOtpVisible(false);
    // Attempt to add wallet (backend will proxy to 2FA wallets/add)
    try {
      const token = localStorage.getItem('cp_auth_token');  // ✅ Get the fresh token set by OTPModal
      await axios.post(`${API_BASE}/wallets/add`, { wallet: currentAccount }, { 
        headers: { 
          'x-device-id': deviceId,
          'Authorization': token ? `Bearer ${token}` : undefined  // ✅ ADD THIS: Send token as header (fallback to cookie)
        },
        withCredentials: true  // ✅ ADD THIS: Ensure cookies are sent as fallback
      });
      // On success, navigate to make-payment
      navigate('/make-payment');
    } catch (err) {
      console.error('wallets/add failed', err?.response?.data || err?.message);
      // Even if add failed (maybe already added), try to navigate
      navigate('/make-payment');
    }
  };

  // Quick whoami check button handler (optional)
  const handleCheckAuth = async () => {
    const p = await checkAuth();
    alert(p ? `Authenticated as ${p.email || p.user?.email || 'unknown'}` : 'Not authenticated');
  };

  // Logout (clear cookie via backend)
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('cp_auth_token');
      await axios.post(`${API_BASE}/auth/logout`, {}, { 
        headers: { 
          'x-device-id': deviceId,
          'Authorization': token ? `Bearer ${token}` : undefined 
        },
        withCredentials: true 
      });
      localStorage.removeItem('cp_auth_token');  // ✅ Clear local token on logout
      alert('Logged out.');
    } catch (err) {
      console.error('logout error', err);
      alert('Logout error');
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-['Space_Grotesk']">
      {/* Navigation Bar */}
      <nav className="backdrop-blur-md bg-black/30 fixed w-full z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="w-8 h-8 text-[#00D4FF]" />
            <span className="text-xl font-bold">CryptPayMe</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/security" className="hover:text-[#00D4FF]"><Shield className="w-6 h-6" /></Link>
            <Link to="/" className="hover:text-[#00D4FF]"><Home className="w-6 h-6" /></Link>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="pt-24 px-6">
        <div className="container mx-auto">
          {!currentAccount ? (
            <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-8 text-center">
              <Wallet className="w-12 h-12 text-[#00D4FF] mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-gray-400 mb-6">
                Connect MetaMask to access your crypto wallet and transactions
              </p>
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="bg-gradient-to-r from-[#00D4FF] to-[#00FF85] text-black font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-70"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          ) : (
            <>
              {/* Wallet Balance */}
              <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6">Wallet Balance</h2>
                <div className="bg-black/30 rounded-xl p-6">
                  <div className="text-gray-400 mb-2">Ethereum (ETH)</div>
                  <div className="text-3xl font-bold">{balance || '0.0000'} ETH</div>
                  <div className="text-sm text-gray-500 truncate mt-2">
                    Connected: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <button
                  onClick={handleMakePaymentClick}
                  className="backdrop-blur-lg bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-colors flex items-center"
                >
                  <Send className="w-8 h-8 text-[#00D4FF] mr-4" />
                  <div>
                    <h3 className="text-xl font-bold">Make Payment</h3>
                    <p className="text-gray-400">Pay crypto to UPI id in INR</p>
                  </div>
                  <ChevronRight className="ml-auto" />
                </button>

                <div className="backdrop-blur-lg bg-white/5 rounded-xl p-6 flex items-center">
                  <Download className="w-8 h-8 text-[#00FF85] mr-4" />
                  <div>
                    <h3 className="text-xl font-bold">Receive Payment</h3>
                    <p className="text-gray-400">
                      Your address: <span className="text-white">{currentAccount.slice(0, 8)}...</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* View Transaction Logs Button */}
              <div className="text-center mb-8">
                <Link to="/transactions">
                  <button className="bg-[#00D4FF] text-black font-semibold px-6 py-3 rounded-lg hover:bg-[#00c4e5] transition-colors">
                    View Transaction Logs
                  </button>
                </Link>
              </div>

              {/* Recent Transactions */}
              <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Recent Transactions</h2>
                  <History className="w-6 h-6 text-[#00D4FF]" />
                </div>
                <div className="space-y-4">
                  {recentTransactions.map((tx, idx) => (
                    <div key={idx} className="bg-black/30 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <ArrowUpRight className="w-6 h-6 text-[#00D4FF] mr-4" />
                        <div>
                          <div className="font-bold">₹{parseFloat(tx.amount).toFixed(2)}</div>
                          <div className="text-sm text-gray-400">
                            To: {tx.receiverUpiId}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm ${
                          tx.paymentStatus === 'success' ? 'text-[#00FF85]' :
                          tx.paymentStatus === 'pending' ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {tx.paymentStatus}
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Utilities: quick auth check / logout */}
              <div className="mt-6 flex gap-3">
                <button onClick={handleCheckAuth} className="px-3 py-2 bg-white/5 rounded">Check Auth</button>
                <button onClick={handleLogout} className="px-3 py-2 bg-white/5 rounded">Logout</button>
              </div>
            </>
          )}
        </div>
      </div>

      <OTPModal
        visible={otpVisible}
        email={email}
        deviceId={deviceId}
        wallet={currentAccount}
        onClose={() => setOtpVisible(false)}
        onVerified={onOtpVerified}
      />
    </div>
  );
}

export default Dashboard;
