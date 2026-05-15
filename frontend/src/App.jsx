import { useState, useRef }  from 'react';
import { motion }            from 'framer-motion';
import HeroSection           from './components/HeroSection.jsx';
import ArchitectureFlow      from './components/ArchitectureFlow.jsx';
import WalletConnect         from './components/WalletConnect.jsx';
import GeneratePanel         from './components/GeneratePanel.jsx';
import VerifyPanel           from './components/VerifyPanel.jsx';

const pathParts    = window.location.pathname.split('/');
const isVerifyPage = pathParts[1] === 'verify';
const initialHash  = isVerifyPage ? pathParts[2] : null;

export default function App() {
  const [signer,  setSigner]  = useState(null);
  const [tab,     setTab]     = useState(isVerifyPage ? 'verify' : 'generate');
  const appRef = useRef(null);

  function scrollToApp() {
    appRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div style={{ background: '#09131f', minHeight: '100vh' }}>

      {/* ── NAVBAR ───────────────────────────────────────────────── */}
      <nav style={{
        position:       'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding:        '0 32px', height: '60px',
        display:        'flex', alignItems: 'center',
        justifyContent: 'space-between',
        background:     'rgba(9,19,31,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom:   '1px solid rgba(212,175,55,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontFamily: 'Orbitron, monospace', fontSize: '18px',
            fontWeight: 700, color: '#d4af37',
            letterSpacing: '3px',
          }}>
            PAICO
          </span>
          <span style={{
            fontSize: '10px', color: '#8fa3bf',
            fontFamily: 'monospace', letterSpacing: '1px',
          }}>
            Proof-Attested AI Content Origin
          </span>
        </div>
        <WalletConnect onConnected={(s) => setSigner(s)} />
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div style={{ paddingTop: '60px' }}>
        <HeroSection onGetStarted={scrollToApp} />
      </div>

      {/* ── ARCHITECTURE FLOW ────────────────────────────────────── */}
      <ArchitectureFlow />

      {/* ── DIVIDER ──────────────────────────────────────────────── */}
      <div style={{ padding: '0 32px' }}>
        <div style={{
          height:     '1px',
          background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.25), transparent)',
          maxWidth:   '900px', margin: '0 auto',
        }} />
      </div>

      {/* ── MAIN APP PANEL ───────────────────────────────────────── */}
      <main ref={appRef} style={{
        maxWidth: '760px', margin: '0 auto',
        padding:  '80px 24px 60px',
      }}>

        {/* Section label */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{
            fontSize: '10px', letterSpacing: '4px',
            color: '#8fa3bf', fontFamily: 'monospace', marginBottom: '8px',
          }}>
            PROVENANCE TERMINAL
          </p>
          <h2 style={{
            fontFamily: 'Orbitron, monospace', fontSize: '22px',
            fontWeight: 700, color: '#f5f7fa', letterSpacing: '2px',
          }}>
            GENERATE & VERIFY
          </h2>
        </div>

        {/* Wallet warning */}
        {!signer && (
          <div style={{
            background:   'rgba(212,175,55,0.05)',
            border:       '1px solid rgba(212,175,55,0.2)',
            borderRadius: '12px', padding: '20px 24px',
            textAlign:    'center', marginBottom: '32px',
          }}>
            <p style={{
              color: '#8fa3bf', fontSize: '13px',
              fontFamily: 'Inter, sans-serif', marginBottom: '4px',
            }}>
              Connect your wallet to generate attested content
            </p>
            <p style={{
              color: '#d4af37', fontSize: '11px',
              fontFamily: 'monospace', letterSpacing: '1px',
            }}>
              MetaMask → 0G Testnet required
            </p>
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display:      'flex',
          borderBottom: '1px solid rgba(212,175,55,0.15)',
          marginBottom: '32px',
        }}>
          {['generate', 'verify'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding:        '12px 28px',
                fontFamily:     'Orbitron, monospace',
                fontSize:       '11px', fontWeight: 700,
                letterSpacing:  '2px', cursor: 'pointer',
                background:     'transparent', border: 'none',
                borderBottom:   tab === t
                  ? '2px solid #d4af37'
                  : '2px solid transparent',
                color:          tab === t ? '#d4af37' : '#8fa3bf',
                transition:     'all 0.2s',
                marginBottom:   '-1px',
              }}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Panel */}
        {tab === 'generate'
          ? <GeneratePanel signer={signer} />
          : <VerifyPanel   initialHash={initialHash} />
        }

      </main>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer style={{
        borderTop:  '1px solid rgba(212,175,55,0.1)',
        padding:    '24px 32px',
        marginTop:  '40px',
      }}>
        <div style={{
          maxWidth:       '900px', margin: '0 auto',
          display:        'flex', flexWrap: 'wrap',
          justifyContent: 'space-between', alignItems: 'center',
          gap:            '12px',
        }}>
          {[
            'PAICO — 0G APAC Hackathon 2026',
            'Track 5 — Privacy & Sovereign Infrastructure',
            'Powered by 0G Storage · 0G Chain · TEE',
          ].map((text, i) => (
            <span key={i} style={{
              fontSize:    '10px',
              fontFamily:  'monospace',
              letterSpacing: '1px',
              color:       i === 1 ? '#d4af37' : '#8fa3bf',
            }}>
              {text}
            </span>
          ))}
        </div>
      </footer>

    </div>
  );
}