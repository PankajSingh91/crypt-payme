import { useContext } from "react";
import { BlockchainContext } from "../context/BlockchainContext";

const ConnectWallet = () => {
  const { currentAccount, connectWallet, balance } = useContext(BlockchainContext);

  return (
    <div>
      {currentAccount ? (
        <div>
          <p>Connected: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}</p>
          <p>Balance: {balance ? `${balance} ETH` : "Fetching..."}</p>
        </div>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};

export default ConnectWallet;
