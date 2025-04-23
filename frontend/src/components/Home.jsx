import React, { useEffect, useState } from 'react';
import { Shield, Wallet, RefreshCw, ArrowRight, ChevronDown, Lock, Zap, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const [cryptoRates, setCryptoRates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,tether&vs_currencies=inr&include_24hr_change=true'
        );
        const data = await res.json();
        const formatted = [
          {
            name: 'Bitcoin',
            price: `₹${data.bitcoin.inr.toLocaleString()}`,
            change: `${data.bitcoin.inr_24h_change.toFixed(2)}%`,
          },
          {
            name: 'Ethereum',
            price: `₹${data.ethereum.inr.toLocaleString()}`,
            change: `${data.ethereum.inr_24h_change.toFixed(2)}%`,
          },
          {
            name: 'Solana',
            price: `₹${data.solana.inr.toLocaleString()}`,
            change: `${data.solana.inr_24h_change.toFixed(2)}%`,
          },
          {
            name: 'USDT',
            price: `₹${data.tether.inr.toLocaleString()}`,
            change: `${data.tether.inr_24h_change.toFixed(2)}%`,
          }
        ];
        setCryptoRates(formatted);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch crypto rates:', err);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white font-['Space_Grotesk']">
      {/* Navigation */}
      <nav className="backdrop-blur-md bg-black/30 fixed w-full z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="w-8 h-8 text-[#00D4FF]" />
            <span className="text-xl font-bold">CryptPayMe</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="hover:text-[#00D4FF] transition-colors">Features</a>
            <a href="#security" className="hover:text-[#00D4FF] transition-colors">Security</a>
            <a href="#rates" className="hover:text-[#00D4FF] transition-colors">Rates</a>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-[#00D4FF] to-[#00FF85] text-black font-bold py-2 px-6 rounded-full hover:opacity-90 transition-opacity"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#00D4FF] to-[#00FF85] text-transparent bg-clip-text">
              Secure & Fast Crypto Payments
            </h1>
            <p className="text-gray-400 text-xl mb-8">
              Experience the future of payments with end-to-end encryption and lightning-fast transactions
            </p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-[#00D4FF] to-[#00FF85] text-black font-bold py-3 px-8 rounded-full text-lg hover:opacity-90 transition-opacity flex items-center mx-auto"
            >
              Get Started <ArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-black/30">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose CryptPayMe?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[{
              icon: <Shield className="w-12 h-12 text-[#00D4FF]" />,
              title: "End-to-End Encryption",
              description: "Your transactions are protected with military-grade encryption"
            },
            {
              icon: <Lock className="w-12 h-12 text-[#00FF85]" />,
              title: "No Unauthorized Deductions",
              description: "Complete control over your funds with secure smart contracts"
            },
            {
              icon: <RefreshCw className="w-12 h-12 text-[#00D4FF]" />,
              title: "Instant Refunds",
              description: "Automated refund mechanism for peace of mind"
            }].map((feature, index) => (
              <div key={index} className="backdrop-blur-lg bg-white/5 rounded-2xl p-8 hover:bg-white/10 transition-colors">
                {feature.icon}
                <h3 className="text-xl font-bold mt-4 mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Rates Section */}
      <section id="rates" className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Live Crypto Rates (INR)</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full text-center text-gray-400">Loading rates...</div>
            ) : (
              cryptoRates.map((crypto, index) => (
                <div key={index} className="backdrop-blur-lg bg-white/5 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold">{crypto.name}</h3>
                    <RefreshCcw className="w-4 h-4 text-[#00D4FF]" />
                  </div>
                  <div className="text-2xl font-bold mb-2">{crypto.price}</div>
                  <div className={`font-medium ${parseFloat(crypto.change) >= 0 ? 'text-[#00FF85]' : 'text-red-500'}`}>
                    {crypto.change}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 px-6 bg-black/30">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8">Bank-Grade Security</h2>
            <p className="text-gray-400 text-lg mb-12">
              Your security is our top priority. We use advanced encryption and secure protocols to protect your transactions.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="backdrop-blur-lg bg-white/5 rounded-xl p-8">
                <Zap className="w-12 h-12 text-[#00D4FF] mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
                <p className="text-gray-400">Transactions completed in seconds, not minutes</p>
              </div>
              <div className="backdrop-blur-lg bg-white/5 rounded-xl p-8">
                <Shield className="w-12 h-12 text-[#00FF85] mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Fully Protected</h3>
                <p className="text-gray-400">Multi-signature security and 2FA authentication</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 py-12 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-8 md:mb-0">
              <Wallet className="w-6 h-6 text-[#00D4FF]" />
              <span className="text-lg font-bold">CryptPayMe</span>
            </div>
            <div className="flex space-x-8">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;