import { useState, useCallback } from 'react';
import { useContract } from '../hooks/useContract.js';
import ImageProvenanceCard from './ImageProvenanceCard.jsx';
import ProvenanceTimeline from './ProvenanceTimeline.jsx';
import { Camera, Loader, RotateCcw, Check } from 'lucide-react';

const BACKEND = import.meta.env.VITE_BACKEND_URL;

const PIPELINE_STEPS = [
  'Generating image via AI…',
  'Computing SHA-256 hash of image…',
  'Creating TEE attestation…',
  'Uploading to 0G Storage…',
  'Minting on 0G Chain…',
];

const EXAMPLES = [
  'A futuristic city at night, neon reflections',
  'Portrait of an AI entity, digital art',
  'Decentralized network visualization, abstract',
];

const CARD_BG = '#112240';
const BORDER = 'rgba(212, 175, 55, 0.15)';
const TEXT_PRIMARY = '#f8fafc';
const TEXT_MUTED = '#94a3b8';
const GOLD = '#d4af37';
const SUCCESS = '#22c55e';
const DANGER = '#ef4444';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export default function ImageGeneratePanel({ signer, onMintComplete }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [draft, setDraft] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [attesting, setAttesting] = useState(false);

  const { mint, txHash, tokenId } = useContract();

  const addEvent = useCallback((type, extra = {}) => {
    setTimelineEvents(prev => [...prev, { type, timestamp: Date.now(), ...extra }]);
  }, []);

  async function handleGenerate() {
    if (!prompt.trim() || !signer) return;

    setLoading(true);
    setError(null);
    setDraft(null);
    setResult(null);
    setTimelineEvents([]);
    setStepIdx(0);
    setImgLoaded(false);

    try {
      setStepIdx(0);
      const genRes = await fetch(`${BACKEND}/api/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!genRes.ok) {
        const body = await genRes.json().catch(() => ({}));
        throw new Error(body.error || `Image generate failed (${genRes.status})`);
      }
      const data = await genRes.json();

      for (let i = 1; i <= 4; i++) {
        setStepIdx(i);
        await sleep(180);
      }

      setDraft(data);
      setStepIdx(0);
    } catch (err) {
      setError(err.message || 'Image generation failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleAttest(d) {
    if (!d?.mintParams || !signer) return;

    setAttesting(true);
    setError(null);
    setTimelineEvents([]);
    setStepIdx(4);

    try {
      const { txHash: tx } = await mint(signer, d.mintParams);
      addEvent('generated');
      addEvent('hashed', { hash: d.mintParams.contentHash });
      addEvent('attested', { hash: d.mintParams.certificateHash });
      addEvent('uploaded');
      addEvent('minted', { txHash: tx });
      addEvent('verified');
      setResult(d);
      setDraft(null);
      setStepIdx(5);
      onMintComplete?.();
    } catch (err) {
      setError(err.message || 'Mint failed');
    } finally {
      setAttesting(false);
    }
  }

  function clearDraft() {
    setDraft(null);
    setError(null);
    setImgLoaded(false);
  }

  const showPipeline = loading || attesting;
  const pipelineSteps = PIPELINE_STEPS;

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
          IMAGE PROMPT
        </label>

        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate and attest…"
          rows={3}
          disabled={!!draft}
          style={{
            width: '100%',
            background: 'rgba(8, 17, 31, 0.6)',
            border: '1px solid rgba(212, 175, 55, 0.15)',
            borderRadius: '8px',
            padding: '14px 16px',
            color: TEXT_PRIMARY,
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.5,
            resize: 'none',
            outline: 'none',
          }}
          onFocus={e => { e.target.style.borderColor = 'rgba(212, 175, 55, 0.5)'; }}
          onBlur={e => { e.target.style.borderColor = 'rgba(212, 175, 55, 0.15)'; }}
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              type="button"
              onClick={() => setPrompt(ex)}
              disabled={!!draft}
              style={{
                fontSize: '10px',
                fontFamily: 'Inter, sans-serif',
                padding: '6px 10px',
                borderRadius: '20px',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                background: 'rgba(212, 175, 55, 0.06)',
                color: GOLD,
                cursor: 'pointer',
              }}
            >
              {ex.length > 42 ? `${ex.slice(0, 42)}…` : ex}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || attesting || !signer || !prompt.trim() || !!draft}
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
          }}
        >
          {loading ? (
            <>
              <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
              GENERATING…
            </>
          ) : (
            <>
              <Camera size={14} />
              GENERATE IMAGE
            </>
          )}
        </button>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>

      {showPipeline && (
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
            {pipelineSteps.map((step, i) => {
              const done = i < stepIdx;
              const active = i === stepIdx && stepIdx < 5;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: done ? SUCCESS : active ? 'rgba(212, 175, 55, 0.2)' : 'rgba(148, 163, 184, 0.1)',
                    border: `1px solid ${done ? SUCCESS : active ? GOLD : 'rgba(148, 163, 184, 0.2)'}`,
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
          <p style={{ color: DANGER, fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>
            ✗ {error}
          </p>
        </div>
      )}

      {draft && !result && (
        <div style={{
          background: CARD_BG,
          border: '2px dashed rgba(212, 175, 55, 0.45)',
          borderRadius: '14px',
          padding: '20px',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            fontSize: '9px',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '2px',
            color: GOLD,
            background: 'rgba(8, 17, 31, 0.9)',
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid rgba(212, 175, 55, 0.35)',
          }}>
            DRAFT — NOT YET ATTESTED
          </div>

          <div style={{ position: 'relative', marginTop: '8px' }}>
            {!imgLoaded && (
              <div style={{
                width: '100%',
                height: '200px',
                background: 'rgba(8, 17, 31, 0.6)',
                borderRadius: '8px',
                animation: 'pulse 1.2s infinite',
              }} />
            )}
            <img
              src={draft.content.imageUrl}
              alt="Generated preview"
              onLoad={() => setImgLoaded(true)}
              style={{
                width: '100%',
                maxHeight: '400px',
                objectFit: 'cover',
                borderRadius: '8px',
                display: imgLoaded ? 'block' : 'none',
              }}
            />
          </div>

          <div style={{
            marginTop: '16px',
            background: 'rgba(8, 17, 31, 0.5)',
            borderRadius: '8px',
            padding: '12px 14px',
          }}>
            <p style={{
              fontSize: '9px',
              letterSpacing: '2px',
              color: TEXT_MUTED,
              fontFamily: 'JetBrains Mono, monospace',
              marginBottom: '8px',
            }}>
              CONTENT HASH (SHA-256)
            </p>
            <p style={{
              fontSize: '11px',
              color: '#60a5fa',
              fontFamily: 'JetBrains Mono, monospace',
              wordBreak: 'break-all',
            }}>
              {draft.content.contentHash}
            </p>
            <p style={{ fontSize: '10px', color: TEXT_MUTED, marginTop: '8px', fontFamily: 'Inter, sans-serif' }}>
              Computed from raw image bytes — not the URL
            </p>
          </div>

          <div style={{
            marginTop: '12px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
          }}>
            <div style={{ background: 'rgba(8, 17, 31, 0.4)', borderRadius: '8px', padding: '10px' }}>
              <p style={{ fontSize: '9px', color: TEXT_MUTED, fontFamily: 'JetBrains Mono, monospace' }}>MODEL</p>
              <p style={{ fontSize: '11px', color: TEXT_PRIMARY, fontFamily: 'JetBrains Mono, monospace' }}>
                {draft.certificate.modelId}
              </p>
            </div>
            <div style={{ background: 'rgba(8, 17, 31, 0.4)', borderRadius: '8px', padding: '10px' }}>
              <p style={{ fontSize: '9px', color: TEXT_MUTED, fontFamily: 'JetBrains Mono, monospace' }}>TIMESTAMP</p>
              <p style={{ fontSize: '11px', color: TEXT_PRIMARY, fontFamily: 'JetBrains Mono, monospace' }}>
                {new Date(draft.certificate.timestamp * 1000).toLocaleString()}
              </p>
            </div>
            <div style={{ gridColumn: '1 / -1', background: 'rgba(8, 17, 31, 0.4)', borderRadius: '8px', padding: '10px' }}>
              <p style={{ fontSize: '9px', color: TEXT_MUTED, fontFamily: 'JetBrains Mono, monospace' }}>TEE</p>
              <p style={{ fontSize: '11px', color: TEXT_PRIMARY, fontFamily: 'JetBrains Mono, monospace' }}>
                {draft.certificate.teeAddress
                  ? `${draft.certificate.teeAddress.slice(0, 10)}…${draft.certificate.teeAddress.slice(-6)}`
                  : '—'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={clearDraft}
              disabled={attesting}
              style={{
                flex: 1,
                minWidth: '120px',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: 'rgba(148, 163, 184, 0.08)',
                color: TEXT_MUTED,
                fontFamily: 'Orbitron, monospace',
                fontSize: '10px',
                letterSpacing: '1px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <RotateCcw size={14} />
              REGENERATE
            </button>
            <button
              type="button"
              onClick={() => handleAttest(draft)}
              disabled={attesting || !signer}
              style={{
                flex: 2,
                minWidth: '180px',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #d4af37, #b8961e)',
                color: '#08111f',
                fontFamily: 'Orbitron, monospace',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '2px',
                cursor: attesting || !signer ? 'not-allowed' : 'pointer',
                opacity: attesting || !signer ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {attesting ? (
                <>
                  <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  ATTESTING…
                </>
              ) : (
                <>
                  <Check size={14} />
                  ATTEST THIS IMAGE
                </>
              )}
            </button>
          </div>

          <p style={{
            marginTop: '12px',
            fontSize: '10px',
            color: TEXT_MUTED,
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.5,
            textAlign: 'center',
          }}>
            Attesting uploads this image to 0G Storage and records its hash permanently on 0G Chain. This cannot be undone.
          </p>
        </div>
      )}

      {timelineEvents.length > 0 && (
        <ProvenanceTimeline events={timelineEvents} isLive={false} />
      )}

      {result && (
        <ImageProvenanceCard result={result} txHash={txHash} tokenId={tokenId} />
      )}
    </div>
  );
}
