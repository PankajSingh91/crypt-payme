// frontend/components/TransactionLogs.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TransactionLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/transactions')
      .then(res => setLogs(res.data))
      .catch(err => console.error('Failed to fetch transactions:', err));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>🧾 Transaction Logs</h2>
      {logs.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead style={{ backgroundColor: '#f0f0f0' }}>
            <tr>
              <th>Sender</th>
              <th>Receiver UPI</th>
              <th>Amount (₹)</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td>{log.senderName}</td>
                <td>{log.receiverUpiId}</td>
                <td>₹{log.amount}</td>
                <td>{log.paymentStatus}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TransactionLogs;
