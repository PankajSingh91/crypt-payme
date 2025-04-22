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
        // Ensure response is an array
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
    <div className="min-h-screen bg-[#121212] text-white font-['Space_Grotesk']">
      <nav className="backdrop-blur-md bg-black/30 fixed w-full z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="w-8 h-8 text-[#00D4FF]" />
            <span className="text-xl font-bold">CryptPayMe</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/security" className="hover:text-[#00D4FF]"><Shield className="w-6 h-6" /></Link>
            <Link to="/dashboard" className="hover:text-[#00D4FF]"><Home className="w-6 h-6" /></Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6">
        <div className="container mx-auto">
          <Link to="/dashboard" className="flex items-center text-gray-400 hover:text-white mb-8">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>

          <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-8">
            <div className="flex items-center mb-6">
              <FileText className="w-8 h-8 text-[#00D4FF] mr-3" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00D4FF] to-[#00FF85] text-transparent bg-clip-text">
                Transaction Logs
              </h1>
            </div>

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
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No transactions found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 text-left">
                      <th className="py-4 px-4 text-gray-400 font-medium">Sender</th>
                      <th className="py-4 px-4 text-gray-400 font-medium">Receiver UPI</th>
                      <th className="py-4 px-4 text-gray-400 font-medium text-right">Amount</th>
                      <th className="py-4 px-4 text-gray-400 font-medium">Status</th>
                      <th className="py-4 px-4 text-gray-400 font-medium text-right">Date</th>
                      <th className="py-4 px-4 text-gray-400 font-medium text-right">Tx Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-4 px-4">{log.senderName}</td>
                        <td className="py-4 px-4 font-mono">{log.receiverUpiId}</td>
                        <td className="py-4 px-4 text-right font-medium">₹{log.amount.toFixed(2)}</td>
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
                              <span className="truncate max-w-[100px]">
                                {log.txHash.slice(0, 10)}...
                              </span>
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          ) : (
                            <span className="text-gray-500 text-right">No Tx</span>
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
