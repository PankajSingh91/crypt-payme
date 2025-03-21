import { useContext } from "react";
import { BlockchainContext } from "../context/BlockchainContext";

const ConnectWallet = () => {
  const { currentAccount, connectWallet } = useContext(BlockchainContext);

  return (
    <div>
      {currentAccount ? (
        <p>Connected: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}</p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};

export default ConnectWallet;
