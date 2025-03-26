import React from "react";
import { BlockchainProvider } from "./context/BlockchainContext";
import Home from "./components/Home";

const App = () => {
  return (
    <BlockchainProvider>
      <Home />
    </BlockchainProvider>
  );
};

export default App;
