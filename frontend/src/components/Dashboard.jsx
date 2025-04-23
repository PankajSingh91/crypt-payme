import React, { useContext, useEffect, useState } from 'react';
import { Wallet, Send, Download, Home, Shield, History, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BlockchainContext } from '../context/BlockchainContext';

function Dashboard() {
  const { currentAccount, balance, connectWallet } = useContext(BlockchainContext);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (currentAccount) {
      setRecentTransactions([
        { id: 1, type: 'send', amount: '0.5 ETH', to: '0x1234...5678', date: '2024-03-15', status: 'completed' },
        { id: 2, type: 'receive', amount: '1 ETH', from: '0x8765...4321', date: '2024-03-14', status: 'completed' },
        { id: 3, type: 'send', amount: '0.1 ETH', to: '0x9876...1234', date: '2024-03-13', status: 'failed' }
      ]);
    }
  }, [currentAccount]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setIsConnecting(false);
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
                <Link
                  to="/make-payment"
                  className="backdrop-blur-lg bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-colors flex items-center"
                >
                  <Send className="w-8 h-8 text-[#00D4FF] mr-4" />
                  <div>
                    <h3 className="text-xl font-bold">Make Payment</h3>
                    <p className="text-gray-400">Transfer crypto to another wallet</p>
                  </div>
                  <ChevronRight className="ml-auto" />
                </Link>

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
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="bg-black/30 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        {tx.type === 'send' ? (
                          <Send className="w-6 h-6 text-[#00D4FF] mr-4" />
                        ) : (
                          <Download className="w-6 h-6 text-[#00FF85] mr-4" />
                        )}
                        <div>
                          <div className="font-bold">{tx.amount}</div>
                          <div className="text-sm text-gray-400">
                            {tx.type === 'send' ? `To: ${tx.to}` : `From: ${tx.from}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm ${
                          tx.status === 'completed' ? 'text-[#00FF85]' :
                          tx.status === 'pending' ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {tx.status}
                        </div>
                        <div className="text-sm text-gray-400">{tx.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
