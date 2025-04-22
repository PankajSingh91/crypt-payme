import React, { useState } from 'react';
import { ArrowLeft, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

function PaymentFlow() {
  const [step, setStep] = useState(1);
  const [paymentDetails, setPaymentDetails] = useState({
    senderName: '',
    amount: '',
    currency: 'BTC',
    recipient: '',
  });
  const [status, setStatus] = useState('input'); // input, processing, success, error

  const getNetworkFee = (currency) => {
    switch (currency) {
      case 'BTC':
        return 0.0001;
      case 'ETH':
        return 0.002;
      case 'USDT':
        return 0.5;
      case 'INR':
        return 5.0;
      default:
        return 0;
    }
  };

  const fee = getNetworkFee(paymentDetails.currency);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('processing');

    // Simulate API call with random success or failure
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% chance success
      setStatus(success ? 'success' : 'error');
    }, 2000);
  };

  const handleRetry = () => {
    setStatus('input');
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-['Space_Grotesk']">
      <div className="container mx-auto px-6 py-12">
        <Link to="/dashboard" className="flex items-center text-gray-400 hover:text-white mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>

        <div className="max-w-2xl mx-auto">
          {status === 'input' && (
            <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-8">
              <h1 className="text-3xl font-bold mb-8">Send Payment</h1>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Sender Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-black/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                      placeholder="Enter your name"
                      value={paymentDetails.senderName}
                      onChange={(e) =>
                        setPaymentDetails({ ...paymentDetails, senderName: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Amount
                    </label>
                    <div className="flex space-x-4">
                      <input
                        type="number"
                        className="flex-1 bg-black/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                        placeholder="0.00"
                        value={paymentDetails.amount}
                        onChange={(e) =>
                          setPaymentDetails({ ...paymentDetails, amount: e.target.value })
                        }
                      />
                      <select
                        className="bg-black/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                        value={paymentDetails.currency}
                        onChange={(e) =>
                          setPaymentDetails({ ...paymentDetails, currency: e.target.value })
                        }
                      >
                        <option value="BTC">BTC</option>
                        <option value="ETH">ETH</option>
                        <option value="USDT">USDT</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Recipient Address
                    </label>
                    <input
                      type="text"
                      className="w-full bg-black/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                      placeholder="Enter wallet address"
                      value={paymentDetails.recipient}
                      onChange={(e) =>
                        setPaymentDetails({ ...paymentDetails, recipient: e.target.value })
                      }
                    />
                  </div>

                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Network Fee</span>
                      <span>{fee} {paymentDetails.currency}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total Amount</span>
                      <span>
                        {paymentDetails.amount
                          ? (Number(paymentDetails.amount) + fee).toFixed(4)
                          : fee.toFixed(4)} {paymentDetails.currency}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#00D4FF] to-[#00FF85] text-black font-bold py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Send Payment
                  </button>
                </div>
              </form>
            </div>
          )}

          {status === 'processing' && (
            <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00D4FF] mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
              <p className="text-gray-400">Please wait while we process your transaction...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-[#00FF85] mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-gray-400 mb-8">Your transaction has been processed successfully.</p>
              <Link
                to="/dashboard"
                className="inline-block bg-gradient-to-r from-[#00D4FF] to-[#00FF85] text-black font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity"
              >
                Back to Dashboard
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-red-400">Payment Failed</h2>
              <p className="text-gray-400 mb-6">Something went wrong while processing your payment. Please try again.</p>
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
}

export default PaymentFlow;
