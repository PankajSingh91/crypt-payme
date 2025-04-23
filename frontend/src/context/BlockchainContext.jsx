import { ethers } from "ethers";
import { createContext, useEffect, useState } from "react";

export const BlockchainContext = createContext();

export const BlockchainProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [balance, setBalance] = useState(null);

  // Connect Wallet
  const connectWallet = async () => {
    if (!window.ethereum) return alert("MetaMask not detected!");

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
      getBalance(accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // Fetch ETH Balance
  const getBalance = async (account) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(account);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  // Check if Wallet is Already Connected
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (!window.ethereum) return;
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        getBalance(accounts[0]);
      }
    };
    checkWalletConnection();
  }, []);

  return (
    <BlockchainContext.Provider value={{ currentAccount, connectWallet, balance }}>
      {children}
    </BlockchainContext.Provider>
  );
};
