import { useState } from 'react';
import { ethers }   from 'ethers';

const CHAIN_ID = 16602;
const OG_RPC   = import.meta.env.VITE_OG_RPC_URL;

export default function WalletConnect({ onConnected }) {
  const [address, setAddress] = useState(null);
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  async function connect() {
    setError(null);
    setLoading(true);
    try {
      if (!window.ethereum) throw new Error('MetaMask not installed');

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
              chainId:        `0x${CHAIN_ID.toString(16)}`,
              chainName:      '0G Testnet',
              rpcUrls:        [OG_RPC],
              nativeCurrency: { name: '0G', symbol: 'OG', decimals: 18 },
            }],
          });
        } else {
          throw switchErr;
        }
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

  if (address) {
    return (
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '8px',
        padding:      '8px 14px',
        borderRadius: '8px',
        background:   'rgba(34, 197, 94, 0.08)',
        border:       '1px solid rgba(34, 197, 94, 0.25)',
      }}>
        <div style={{
          width:        '7px',
          height:       '7px',
          borderRadius: '50%',
          background:   '#22c55e',
          boxShadow:    '0 0 6px #22c55e',
          flexShrink:   0,
          animation:    'pulse-dot 2s infinite',
        }} />
        <span style={{
          fontFamily:    'JetBrains Mono, monospace',
          fontSize:      '12px',
          color:         '#f8fafc',
          letterSpacing: '0.5px',
        }}>
          {address.slice(0, 6)}…{address.slice(-4)}
        </span>
        <style>{`
          @keyframes pulse-dot {
            0%, 100% { opacity: 1; box-shadow: 0 0 6px #22c55e; }
            50%       { opacity: 0.6; box-shadow: 0 0 12px #22c55e; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <button
        onClick={connect}
        disabled={loading}
        style={{
          display:       'flex',
          alignItems:    'center',
          gap:           '8px',
          padding:       '9px 18px',
          borderRadius:  '8px',
          fontFamily:    'Orbitron, monospace',
          fontSize:      '11px',
          fontWeight:    700,
          letterSpacing: '2px',
          cursor:        loading ? 'not-allowed' : 'pointer',
          opacity:       loading ? 0.6 : 1,
          background:    loading
            ? 'rgba(212, 175, 55, 0.4)'
            : 'linear-gradient(135deg, #d4af37, #b8961e)',
          color:         '#08111f',
          border:        'none',
          boxShadow:     '0 0 16px rgba(212, 175, 55, 0.25)',
          transition:    'all 0.2s',
          whiteSpace:    'nowrap',
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M16 12h.01" />
        </svg>
        {loading ? 'CONNECTING…' : 'CONNECT WALLET'}
      </button>

      {error && (
        <p style={{
          marginTop:  '6px',
          fontSize:   '11px',
          fontFamily: 'JetBrains Mono, monospace',
          color:      '#ef4444',
          maxWidth:   '220px',
          textAlign:  'right',
          lineHeight: 1.4,
        }}>
          {error.length > 60 ? error.slice(0, 60) + '…' : error}
        </p>
      )}
    </div>
  );
}
