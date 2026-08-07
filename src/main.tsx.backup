import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import { Buffer } from 'buffer';

// FIX: Make Buffer available globally
globalThis.Buffer = Buffer;

const NETWORK = WalletAdapterNetwork.Mainnet;
// Use your Helius API Key for a faster, more stable connection
const HELIUS_API_KEY = 'bf49a7f3-709f-4ba6-aae2-e33ebb62977a';
const endpoint = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>,
);
