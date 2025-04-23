import React from 'react';
import { Shield, Lock, Key, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

function Security() {
  return (
    <div className="min-h-screen bg-[#121212] text-white font-['Space_Grotesk']">
      <div className="container mx-auto px-6 py-12">
        <Link to="/dashboard" className="flex items-center text-gray-400 hover:text-white mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-12">Security & Privacy</h1>

          {/* 2FA Section */}
          <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-8 mb-8">
            <div className="flex items-start mb-6">
              <Key className="w-8 h-8 text-[#00D4FF] mr-4" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Two-Factor Authentication</h2>
                <p className="text-gray-400 mb-4">
                  Add an extra layer of security to your account with 2FA. We support authenticator apps and hardware security keys.
                </p>
                <button className="bg-gradient-to-r from-[#00D4FF] to-[#00FF85] text-black font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity">
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>

          {/* Encryption Details */}
          <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-8 mb-8">
            <div className="flex items-start mb-6">
              <Shield className="w-8 h-8 text-[#00FF85] mr-4" />
              <div>
                <h2 className="text-2xl font-bold mb-2">End-to-End Encryption</h2>
                <p className="text-gray-400 mb-4">
                  All transactions are protected with military-grade encryption. Your private keys never leave your device.
                </p>
                <div className="bg-black/30 rounded-lg p-4">
                  <h3 className="font-bold mb-2">Security Features:</h3>
                  <ul className="list-disc list-inside text-gray-400 space-y-2">
                    <li>AES-256 encryption for all data at rest</li>
                    <li>SSL/TLS encryption for all data in transit</li>
                    <li>Multi-signature wallet support</li>
                    <li>Regular security audits</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Unauthorized Deductions */}
          <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-8 mb-8">
            <div className="flex items-start mb-6">
              <Lock className="w-8 h-8 text-[#00D4FF] mr-4" />
              <div>
                <h2 className="text-2xl font-bold mb-2">No Unauthorized Deductions</h2>
                <p className="text-gray-400 mb-4">
                  Our smart contracts ensure that no funds can be deducted without your explicit approval.
                </p>
                <div className="bg-black/30 rounded-lg p-4">
                  <h3 className="font-bold mb-2">Protection Measures:</h3>
                  <ul className="list-disc list-inside text-gray-400 space-y-2">
                    <li>Transaction signing required for all transfers</li>
                    <li>Spending limits and daily caps</li>
                    <li>Real-time transaction monitoring</li>
                    <li>Instant freeze capability</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                {
                  question: "How are my private keys stored?",
                  answer: "Private keys are encrypted and stored locally on your device. We never have access to your private keys."
                },
                {
                  question: "What happens if I lose my 2FA device?",
                  answer: "You can use backup codes provided during 2FA setup to regain access to your account."
                },
                {
                  question: "How do refunds work?",
                  answer: "Our smart contracts include an automated refund mechanism that can be triggered within 24 hours of a transaction."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-black/30 rounded-lg p-6">
                  <h3 className="font-bold mb-2 flex items-center">
                    <AlertCircle className="w-5 h-5 text-[#00D4FF] mr-2" />
                    {faq.question}
                  </h3>
                  <p className="text-gray-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Security;