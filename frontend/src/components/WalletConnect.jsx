import { useState } from 'react';
import { ethers }   from 'ethers';

const CHAIN_ID     = parseInt(import.meta.env.VITE_CHAIN_ID);
const OG_RPC       = import.meta.env.VITE_OG_RPC_URL;

export default function WalletConnect({ onConnected }) {
  const [address, setAddress] = useState(null);
  const [error,   setError]   = useState(null);

  async function connect() {
    setError(null);
    try {
      if (!window.ethereum) throw new Error('MetaMask not found');

      const provider = new ethers.BrowserProvider(window.ethereum);

      // Switch to 0G Chain — adds the network if user doesn't have it
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
        });
      } catch (switchErr) {
        // Error code 4902 = chain not added yet
        if (switchErr.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId:         `0x${CHAIN_ID.toString(16)}`,
              chainName:       '0G Testnet',
              rpcUrls:         [OG_RPC],
              nativeCurrency:  { name: '0G', symbol: 'OG', decimals: 18 },
              blockExplorerUrls: ['https://chainscan-galileo.0g.ai'],
            }],
          });
        } else throw switchErr;
      }

      const signer = await provider.getSigner();
      const addr   = await signer.getAddress();
      setAddress(addr);
      onConnected(signer, addr);

    } catch (err) {
      setError(err.message);
    }
  }

  if (address) return (
    <div className="cyber-card px-4 py-2 flex items-center gap-2">
      <span className="status-dot bg-accent"></span>
      <span className="text-accent font-mono text-sm">
        {address.slice(0, 6)}…{address.slice(-4)}
      </span>
    </div>
  );

  return (
    <div>
      <button
        onClick={connect}
        className="border border-accent text-accent px-6 py-2 rounded
                   hover:bg-accent hover:text-black transition-colors
                   font-mono text-sm"
      >
        CONNECT WALLET
      </button>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
}