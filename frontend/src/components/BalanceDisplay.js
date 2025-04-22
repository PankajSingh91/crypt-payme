import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BalanceDisplay = () => {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get('http://localhost:5000/api/balances')
      .then(res => {
        setBalances(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching balances:', err);
        setError("Failed to fetch balances");
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "0 auto" }}>
      <h2>💰 UPI Balances</h2>

      {loading ? (
        <p>Loading balances...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ border: "1px solid #ccc", padding: "10px" }}>UPI ID</th>
              <th style={{ border: "1px solid #ccc", padding: "10px" }}>Current Balance (₹)</th>
            </tr>
          </thead>
          <tbody>
            {balances.length > 0 ? (
              balances.map((bal) => (
                <tr key={bal.upiId}>
                  <td style={{ border: "1px solid #ddd", padding: "10px" }}>{bal.upiId}</td>
                  <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                    ₹{bal.balance.toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" style={{ textAlign: "center", padding: "10px" }}>
                  No balances found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BalanceDisplay;
