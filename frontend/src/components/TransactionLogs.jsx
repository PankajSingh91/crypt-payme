import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ArrowLeft, FileText, Loader2, CheckCircle2, XCircle, Clock,
  Wallet, Shield, Home, AlertCircle, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

const TransactionLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/transactions')
      .then(res => {
        setLogs(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch transactions:', err);
        setError('Failed to load transactions. Please try again.');
        setLoading(false);
      });
  }, []);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-[#00FF85]" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const explorerBaseURL = "https://sepolia.etherscan.io/tx/";

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-['Space_Grotesk']">
      <nav className="backdrop-blur-md bg-black/30 fixed w-full z-50 border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="w-8 h-8 text-[#00D4FF]" />
            <span className="text-xl font-bold">CryptPayMe</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/security" className="hover:text-[#00D4FF] transition-colors"><Shield className="w-6 h-6" /></Link>
            <Link to="/" className="hover:text-[#00D4FF] transition-colors"><Home className="w-6 h-6" /></Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6">
        <div className="container mx-auto">
          <Link to="/" className="flex items-center text-gray-400 hover:text-white mb-8 transition">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>

          <div className="backdrop-blur-lg bg-[#1a1a1a] rounded-2xl p-8 shadow-lg border border-white/10">
            <div className="flex items-center mb-6">
              <FileText className="w-8 h-8 text-[#00D4FF] mr-3" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00D4FF] to-[#00FF85] text-transparent bg-clip-text">
                Transaction Logs
              </h1>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="w-10 h-10 text-[#00D4FF] animate-spin" />
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-400">Error</h3>
                  <p className="text-gray-400">{error}</p>
                </div>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-gray-500 font-medium">
                No transactions found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-gray-400">
                      <th className="py-3 px-4 font-semibold">Sender</th>
                      <th className="py-3 px-4 font-semibold">Receiver UPI</th>
                      <th className="py-3 px-4 font-semibold text-right">Amount</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Date</th>
                      <th className="py-3 px-4 font-semibold text-right">Tx Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="py-4 px-4">{log.senderName}</td>
                        <td className="py-4 px-4 font-mono text-sm text-[#00D4FF]">{log.receiverUpiId}</td>
                        <td className="py-4 px-4 text-right font-semibold">₹{log.amount.toFixed(2)}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            {getStatusIcon(log.paymentStatus)}
                            <span className="ml-2 capitalize">{log.paymentStatus}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right text-gray-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {log.txHash ? (
                            <a
                              href={`${explorerBaseURL}${log.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#00D4FF] hover:underline flex items-center justify-end space-x-1 font-mono"
                            >
                              <span className="truncate max-w-[100px]">{log.txHash.slice(0, 10)}...</span>
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          ) : (
                            <span className="text-gray-600 italic">No Tx</span>
                          )}
                        </td>
                      </tr>
                    ))}
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

export default TransactionLogs;
