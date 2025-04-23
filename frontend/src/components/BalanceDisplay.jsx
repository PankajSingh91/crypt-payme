import React, { useEffect, useState } from 'react'; 
import axios from 'axios';
import { ArrowLeft, Wallet, Loader2, AlertCircle, Shield, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const BalanceDisplay = () => {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/balances");
        setBalances(response.data);
      } catch (err) {
        console.error('Error fetching balances:', err);
        setError("Failed to fetch balances. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchBalances();
  }, []);
  
  
  
      

  return (
    <div className="min-h-screen bg-[#121212] text-white font-['Space_Grotesk']">
      {/* Navigation Bar */}
      <nav className="backdrop-blur-md bg-black/30 fixed w-full z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="w-8 h-8 text-[#00D4FF]" />
            <span className="text-xl font-bold text-white">CryptPayMe</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/security" className="hover:text-[#00D4FF] transition-colors duration-200">
              <Shield className="w-6 h-6" />
            </Link>
            <Link to="/" className="hover:text-[#00D4FF] transition-colors duration-200">
              <Home className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 px-6">
        <div className="container mx-auto">
          <Link to="/dashboard" className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>

          <div className="backdrop-blur-lg bg-gradient-to-br from-[#1F1F1F] to-[#2C2C2C] border border-white/10 rounded-2xl p-8 shadow-xl">
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#00D4FF] to-[#00FF85] text-transparent bg-clip-text">
              UPI Balances
            </h1>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-[#00D4FF] animate-spin" />
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-400">Error</h3>
                  <p className="text-gray-400">{error}</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-sm">
                      <th className="py-4 px-4 text-[#00D4FF]">UPI ID</th>
                      <th className="py-4 px-4 text-right text-[#00D4FF]">Current Balance (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balances.length > 0 ? (
                      balances.map((bal) => (
                        <tr key={bal.upiId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4 text-white">{bal.upiId}</td>
                          <td className="py-4 px-4 text-right font-medium text-[#00FF85]">
                            ₹{bal.balance.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="py-8 text-center text-gray-400">
                          No balances found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceDisplay;