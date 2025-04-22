import React, { createContext, useEffect, useState } from "react";

export const BlockchainContext = createContext();

export const BlockchainProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [balance, setBalance] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected!");
      return;
    }

  const disconnectWallet = () => {
      setCurrentAccount(null);
      setBalance(null);
    };
    

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length === 0) {
        alert("No accounts found.");
        return;
      }
      setCurrentAccount(accounts[0]);
      getBalance(accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert(`Error connecting wallet: ${error.message}`);
    }
  };

  const getBalance = async (account) => {
    try {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [account, "latest"],
      });
      setBalance(parseFloat(parseInt(balance, 16) / 1e18).toFixed(4));
    } catch (err) {
      console.error("Error getting balance:", err);
    }
  };

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setCurrentAccount(null);
        setBalance(null);
      } else {
        setCurrentAccount(accounts[0]);
        getBalance(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  return (
    <BlockchainContext.Provider
      value={{
        currentAccount,
        balance,
        connectWallet,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
};
