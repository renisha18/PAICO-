import { useState }    from 'react';
import WalletConnect   from './components/WalletConnect.jsx';
import GeneratePanel   from './components/GeneratePanel.jsx';
import VerifyPanel     from './components/VerifyPanel.jsx';

// Check if URL is /verify/:hash
const pathParts    = window.location.pathname.split('/');
const isVerifyPage = pathParts[1] === 'verify';
const initialHash  = isVerifyPage ? pathParts[2] : null;

export default function App() {
  const [signer, setSigner] = useState(null);
  const [tab,    setTab]    = useState(isVerifyPage ? 'verify' : 'generate');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-mono">

      {/* Header */}
      <header className="border-b border-[#1a1a1a] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-accent font-bold text-lg tracking-widest glow">
              PAICO
            </h1>
            <p className="text-[#555] text-xs">
              Proof-Attested AI Content Origin
            </p>
          </div>
          <WalletConnect onConnected={(s) => setSigner(s)} />
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto flex">
          {['generate', 'verify'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-xs tracking-widest border-b-2 transition-colors ${
                tab === t
                  ? 'border-accent text-accent'
                  : 'border-transparent text-[#555] hover:text-[#999]'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        {!signer && tab === 'generate' && (
          <div className="cyber-card p-6 text-center mb-6">
            <p className="text-[#666] text-sm">Connect wallet to generate attested content</p>
          </div>
        )}

        {tab === 'generate'
          ? <GeneratePanel signer={signer} />
          : <VerifyPanel   initialHash={initialHash} />
        }
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] px-6 py-4 mt-16">
        <div className="max-w-3xl mx-auto flex justify-between text-xs text-[#444]">
          <span>PAICO — 0G APAC Hackathon 2026</span>
          <span>Track 5 — Privacy & Sovereign Infrastructure</span>
        </div>
      </footer>
    </div>
  );
}