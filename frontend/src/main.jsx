import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BlockchainProvider } from './context/BlockchainContext'; // ✅ import the provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BlockchainProvider> {/* ✅ wrap App with context provider */}
      <App />
    </BlockchainProvider>
  </React.StrictMode>
);
