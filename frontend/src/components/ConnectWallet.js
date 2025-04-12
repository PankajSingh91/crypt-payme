import { useContext, useState } from "react";
import { BlockchainContext } from "../context/BlockchainContext";
import { useNavigate } from "react-router-dom";

const ConnectWallet = () => {
  const { currentAccount, connectWallet, balance } = useContext(BlockchainContext);
  const navigate = useNavigate(); // Hook to navigate to another page
  const [buttonText, setButtonText] = useState("Connect Wallet");

  const handleConnectWallet = async () => {
    await connectWallet(); // Call connectWallet from context to connect wallet
    setButtonText("Make Payment"); // Change button text to 'Make Payment'
  };

  const handleMakePayment = () => {
    navigate("/make-payment"); // Navigate to Make Payment page
  };

  return (
    <div>
      {currentAccount ? (
        <div>
          <p>Connected: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}</p>
          <p>Balance: {balance ? `${balance} ETH` : "Fetching..."}</p>
          <button onClick={handleMakePayment}>{buttonText}</button>
        </div>
      ) : (
        <button onClick={handleConnectWallet}>{buttonText}</button>
      )}
    </div>
  );
};

export default ConnectWallet;
