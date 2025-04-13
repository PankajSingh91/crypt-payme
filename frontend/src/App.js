import React from "react";
import { BlockchainProvider } from "./context/BlockchainContext";
import { Routes, Route } from "react-router-dom";
import ConnectWallet from "./components/ConnectWallet";
import MakePayment from "./components/MakePayment";

const App = () => {
  return (
    <BlockchainProvider>
      <Routes>
        <Route path="/" element={<ConnectWallet />} />
        <Route path="/make-payment" element={<MakePayment />} />
      </Routes>
    </BlockchainProvider>
  );
};

export default App;
