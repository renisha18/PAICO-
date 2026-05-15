import { useState }    from 'react';
import { useContract } from '../hooks/useContract.js';
import ProvenanceCard  from './ProvenanceCard.jsx';
import { Zap, Loader } from 'lucide-react';

const BACKEND = import.meta.env.VITE_BACKEND_URL;

const PIPELINE_STEPS = [
  'Sending to inference API…',
  'Hashing content (SHA-256)…',
  'Creating TEE attestation…',
  'Uploading to 0G Storage…',
  'Minting on 0G Chain…',
];

export default function GeneratePanel({ signer }) {
  const [prompt,  setPrompt]  = useState('');
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);

  const { mint, txHash, tokenId } = useContract();

  async function handleGenerate() {
    if (!prompt.trim() || !signer) return;
    setLoading(true); setError(null);
    setResult(null);  setStepIdx(0);

    try {
      setStepIdx(0);
      const genRes = await fetch(`${BACKEND}/api/generate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ prompt }),
      });
      if (!genRes.ok) throw new Error((await genRes.json()).error);
      const data = await genRes.json();

      setStepIdx(4);
      await mint(signer, data.mintParams);

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Input card */}
      <div style={{
        background:   '#132238',
        border:       '1px solid rgba(212,175,55,0.15)',
        borderRadius: '14px',
        padding:      '24px',
      }}>
        <label style={{
          display:       'block', fontSize: '10px',
          letterSpacing: '3px', color: '#8fa3bf',
          fontFamily:    'monospace', marginBottom: '12px',
        }}>
          PROMPT
        </label>

        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Describe what you want the AI to generate…"
          rows={4}
          style={{
            width:        '100%', background: 'rgba(9,19,31,0.6)',
            border:       '1px solid rgba(95,209,255,0.15)',
            borderRadius: '8px', padding: '14px 16px',
            color:        '#f5f7fa', fontSize: '14px',
            fontFamily:   'Inter, sans-serif',
            lineHeight:   1.6, resize: 'none',
            outline:      'none',
            transition:   'border-color 0.2s',
          }}
          onFocus={e  => e.target.style.borderColor = 'rgba(212,175,55,0.4)'}
          onBlur={e   => e.target.style.borderColor = 'rgba(95,209,255,0.15)'}
        />

        <button
          onClick={handleGenerate}
          disabled={loading || !signer || !prompt.trim()}
          style={{
            marginTop:    '16px', width: '100%',
            padding:      '14px', borderRadius: '8px',
            fontFamily:   'Orbitron, monospace', fontSize: '12px',
            fontWeight:   700, letterSpacing: '2px',
            cursor:       loading || !signer || !prompt.trim()
                            ? 'not-allowed' : 'pointer',
            opacity:      loading || !signer || !prompt.trim() ? 0.4 : 1,
            background:   'linear-gradient(135deg, #d4af37, #b8961e)',
            color:        '#09131f', border: 'none',
            display:      'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px',
            boxShadow:    '0 0 24px rgba(212,175,55,0.25)',
            transition:   'opacity 0.2s',
          }}
        >
          {loading
            ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> PROCESSING…</>
            : <><Zap    size={14} /> GENERATE + ATTEST</>
          }
        </button>

        {/* Spin animation */}
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>

      {/* Pipeline progress */}
      {loading && (
        <div style={{
          background:   '#132238',
          border:       '1px solid rgba(95,209,255,0.15)',
          borderRadius: '14px', padding: '20px 24px',
        }}>
          <p style={{
            fontSize: '10px', letterSpacing: '3px',
            color: '#8fa3bf', fontFamily: 'monospace',
            marginBottom: '16px',
          }}>
            PIPELINE STATUS
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {PIPELINE_STEPS.map((step, i) => {
              const done    = i < stepIdx;
              const active  = i === stepIdx;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                  <div style={{
                    width:        '20px', height: '20px',
                    borderRadius: '50%', flexShrink: 0,
                    background:   done   ? '#32d583'
                                : active ? 'rgba(212,175,55,0.2)'
                                :          'rgba(143,163,191,0.1)',
                    border:       `1px solid ${
                      done   ? '#32d583'
                      : active ? '#d4af37'
                      :          'rgba(143,163,191,0.2)'
                    }`,
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    fontSize:       '10px',
                  }}>
                    {done ? '✓' : active ? (
                      <div style={{
                        width: '6px', height: '6px',
                        borderRadius: '50%',
                        background: '#d4af37',
                        animation: 'pulse 1s infinite',
                      }} />
                    ) : null}
                  </div>
                  <span style={{
                    fontSize:   '12px',
                    fontFamily: 'monospace',
                    color:      done   ? '#32d583'
                              : active ? '#d4af37'
                              :          '#8fa3bf',
                  }}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background:   'rgba(255,92,122,0.08)',
          border:       '1px solid rgba(255,92,122,0.3)',
          borderRadius: '12px', padding: '16px 20px',
        }}>
          <p style={{
            color: '#ff5c7a', fontSize: '13px', fontFamily: 'monospace',
          }}>
            ✗ {error}
          </p>
        </div>
      )}

      {/* Result */}
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