import { ethers } from "ethers";
import { createContext, useEffect, useState } from "react";

export const BlockchainContext = createContext();

export const BlockchainProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState(null);

  // Function to connect MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) return alert("MetaMask not detected!");

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // Check if wallet is already connected on page load
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (!window.ethereum) return;
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length) setCurrentAccount(accounts[0]);
    };
    checkWalletConnection();
  }, []);

  return (
    <BlockchainContext.Provider value={{ currentAccount, connectWallet }}>
      {children}
    </BlockchainContext.Provider>
  );
};
