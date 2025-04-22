import { Link } from "react-router-dom";
import ConnectWallet from "./ConnectWallet";

const Home = () => {
  return (
    <div>
      <h1>Welcome to Crypt PayMe</h1>
      <ConnectWallet />
      <br />
      <Link to="/transactions">
        <button>View Transaction Logs</button>
      </Link>
    </div>
  );
};

export default Home;
