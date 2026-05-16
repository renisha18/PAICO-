import { useState } from 'react';
import { useContract } from '../hooks/useContract.js';
import ProvenanceCard from './ProvenanceCard.jsx';
import ProvenanceTimeline from './ProvenanceTimeline.jsx';
import { Zap, Loader } from 'lucide-react';

const BACKEND = import.meta.env.VITE_BACKEND_URL;

const PIPELINE_STEPS = [
  'Sending to AI inference…',
  'Computing SHA-256 hash…',
  'Creating TEE attestation…',
  'Uploading to 0G Storage…',
  'Minting on 0G Chain…',
];

const CARD_BG = '#112240';
const BORDER = 'rgba(212, 175, 55, 0.15)';
const TEXT_PRIMARY = '#f8fafc';
const TEXT_MUTED = '#94a3b8';
const GOLD = '#d4af37';
const SUCCESS = '#22c55e';
const DANGER = '#ef4444';

export default function GeneratePanel({ signer, onMintComplete }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);

  const { mint, txHash, tokenId } = useContract();

  function addEvent(type, extra = {}) {
    setTimelineEvents(prev => [
      ...prev,
      { type, timestamp: Date.now(), ...extra },
    ]);
  }

  async function handleGenerate() {
    if (!prompt.trim() || !signer) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setStepIdx(0);
    setTimelineEvents([]);

    try {
      setStepIdx(0);
      const genRes = await fetch(`${BACKEND}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!genRes.ok) {
        const body = await genRes.json().catch(() => ({}));
        throw new Error(body.error || `Generate failed (${genRes.status})`);
      }
      const data = await genRes.json();

      setStepIdx(1);
      addEvent('generated');

      setStepIdx(2);
      addEvent('hashed', { hash: data.mintParams.contentHash });

      setStepIdx(3);
      addEvent('attested', { hash: data.mintParams.certificateHash });

      setStepIdx(4);
      addEvent('uploaded');

      const { txHash: tx } = await mint(signer, data.mintParams);
      addEvent('minted', { txHash: tx });

      addEvent('verified');
      setStepIdx(5);
      setResult(data);
      onMintComplete?.();
    } catch (err) {
      setError(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      <div style={{
        background: CARD_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: '14px',
        padding: '24px',
      }}>
        <label style={{
          display: 'block',
          fontSize: '10px',
          letterSpacing: '3px',
          color: TEXT_MUTED,
          fontFamily: 'JetBrains Mono, monospace',
          marginBottom: '12px',
        }}>
          PROMPT
        </label>

        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Describe what you want the AI to generate…"
          rows={4}
          style={{
            width: '100%',
            background: 'rgba(8, 17, 31, 0.6)',
            border: '1px solid rgba(212, 175, 55, 0.15)',
            borderRadius: '8px',
            padding: '14px 16px',
            color: TEXT_PRIMARY,
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.6,
            resize: 'none',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => { e.target.style.borderColor = 'rgba(212, 175, 55, 0.5)'; }}
          onBlur={e => { e.target.style.borderColor = 'rgba(212, 175, 55, 0.15)'; }}
        />

        <button
          onClick={handleGenerate}
          disabled={loading || !signer || !prompt.trim()}
          style={{
            marginTop: '16px',
            width: '100%',
            padding: '14px',
            borderRadius: '8px',
            fontFamily: 'Orbitron, monospace',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '2px',
            cursor: loading || !signer || !prompt.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !signer || !prompt.trim() ? 0.4 : 1,
            background: 'linear-gradient(135deg, #d4af37, #b8961e)',
            color: '#08111f',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 0 24px rgba(212, 175, 55, 0.25)',
            transition: 'opacity 0.2s',
          }}
        >
          {loading ? (
            <>
              <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
              PROCESSING…
            </>
          ) : (
            <>
              <Zap size={14} />
              GENERATE + ATTEST
            </>
          )}
        </button>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>

      {loading && (
        <div style={{
          background: CARD_BG,
          border: '1px solid rgba(96, 165, 250, 0.15)',
          borderRadius: '14px',
          padding: '20px 24px',
        }}>
          <p style={{
            fontSize: '10px',
            letterSpacing: '3px',
            color: TEXT_MUTED,
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: '16px',
          }}>
            PIPELINE STATUS
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {PIPELINE_STEPS.map((step, i) => {
              const done = i < stepIdx;
              const active = i === stepIdx;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: done
                      ? SUCCESS
                      : active
                        ? 'rgba(212, 175, 55, 0.2)'
                        : 'rgba(148, 163, 184, 0.1)',
                    border: `1px solid ${
                      done ? SUCCESS : active ? GOLD : 'rgba(148, 163, 184, 0.2)'
                    }`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: done ? '#08111f' : 'transparent',
                  }}>
                    {done ? '✓' : active ? (
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: GOLD,
                        animation: 'pulse 1s infinite',
                      }} />
                    ) : null}
                  </div>
                  <span style={{
                    fontSize: '12px',
                    fontFamily: 'JetBrains Mono, monospace',
                    color: done ? SUCCESS : active ? GOLD : TEXT_MUTED,
                  }}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '16px 20px',
        }}>
          <p style={{
            color: DANGER,
            fontSize: '13px',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            ✗ {error}
          </p>
        </div>
      )}

      {timelineEvents.length > 0 && (
        <ProvenanceTimeline events={timelineEvents} isLive={loading} />
      )}

      {result && (
        <ProvenanceCard
          result={result}
          txHash={txHash}
          tokenId={tokenId}
        />
      )}

    </div>
  );
}
