import { useState } from 'react';
import { ethers }   from 'ethers';
import { Wallet }   from 'lucide-react';

const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID);
const OG_RPC   = import.meta.env.VITE_OG_RPC_URL;

export default function WalletConnect({ onConnected }) {
  const [address, setAddress] = useState(null);
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  async function connect() {
    setError(null);
    setLoading(true);
    try {
      if (!window.ethereum) throw new Error('MetaMask not found');

      const provider = new ethers.BrowserProvider(window.ethereum);

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
        });
      } catch (switchErr) {
        if (switchErr.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId:           `0x${CHAIN_ID.toString(16)}`,
              chainName:         '0G Testnet',
              rpcUrls:           [OG_RPC],
              nativeCurrency:    { name: '0G', symbol: 'OG', decimals: 18 },
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
    } finally {
      setLoading(false);
    }
  }

  if (address) return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
         style={{
           background: 'rgba(212,175,55,0.1)',
           border:     '1px solid rgba(212,175,55,0.25)',
         }}>
      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
      <span className="font-mono text-xs" style={{ color: '#d4af37' }}>
        {address.slice(0, 6)}…{address.slice(-4)}
      </span>
    </div>
  );

  return (
    <div>
      <button
        onClick={connect}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg
                   font-display text-xs font-bold tracking-wider
                   transition-all duration-200 disabled:opacity-50"
        style={{
          background:  'linear-gradient(135deg, #d4af37, #b8961e)',
          color:       '#09131f',
          boxShadow:   '0 0 16px rgba(212,175,55,0.25)',
        }}
      >
        <Wallet size={14} />
        {loading ? 'CONNECTING…' : 'CONNECT WALLET'}
      </button>
      {error && (
        <p className="text-xs mt-1" style={{ color: '#ff5c7a' }}>
          {error}
        </p>
      )}
    </div>
  );
}
