import React from "react";
import { BlockchainProvider } from "./context/BlockchainContext";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home"; // ✅ Use your updated Home component
import MakePayment from "./components/MakePayment";
import TransactionLogs from "./components/TransactionLogs";
import BalanceDisplay from "./components/BalanceDisplay";
import Dashboard from "./components/Dashboard";
import Security from './components/Security';

const App = () => {
  return (
    <BlockchainProvider>
      <Routes>
        <Route path="/" element={<Home />} /> {/* ← Changed this line */}
        <Route path="/make-payment" element={<MakePayment />} />
        <Route path="/transactions" element={<TransactionLogs />} />
        <Route path="/balances" element={<BalanceDisplay />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/security" element={<Security />} />
      </Routes>
    </BlockchainProvider>
  );
};

export default App;
