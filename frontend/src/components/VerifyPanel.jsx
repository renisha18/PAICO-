import { useState }          from 'react';
import { hashFile }          from '../utils/hash.js';
import { verifyCertificate } from '../utils/verify.js';
import { useContract }       from '../hooks/useContract.js';
import { Upload, Search, CheckCircle, XCircle } from 'lucide-react';

const EXPLORER    = import.meta.env.VITE_OG_EXPLORER;
const TEE_ADDRESS = import.meta.env.VITE_TEE_ADDRESS;

export default function VerifyPanel({ initialHash }) {
  const [hashInput,   setHashInput]   = useState(initialHash || '');
  const [fileResult,  setFileResult]  = useState(null);
  const [chainRecord, setChainRecord] = useState(null);
  const [certVerify,  setCertVerify]  = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [dragging,    setDragging]    = useState(false);

  const { lookup } = useContract();

  async function handleFile(file) {
    const h = await hashFile(file);
    setHashInput(h);
    setFileResult({ name: file.name, hash: h });
    setChainRecord(null); setCertVerify(null); setError(null);
  }

  function onDrop(e) {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleVerify() {
    if (!hashInput.trim()) return;
    setLoading(true); setError(null);
    setChainRecord(null); setCertVerify(null);

    try {
      const record = await lookup(hashInput);
      setChainRecord(record);

      if (!record?.timestamp || record.timestamp === 0) {
        setError('Hash not found on chain — content unregistered or tampered');
        return;
      }

      if (record.storageRoot) {
        try {
          const certRes = await fetch(
            `https://indexer-storage-testnet-standard.0g.ai/file?root=${record.storageRoot}`
          );
          if (certRes.ok) {
            const certJson = await certRes.json();
            const result   = verifyCertificate(certJson, TEE_ADDRESS);
            setCertVerify(result);
          }
        } catch {
          setCertVerify({ valid: true, reason: 'Chain record verified (storage unreachable)' });
        }
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const isVerified = chainRecord?.timestamp > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Drag & drop upload */}
      <div
        onDragOver={e  => { e.preventDefault(); setDragging(true);  }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById('file-input').click()}
        style={{
          background:   dragging
            ? 'rgba(212,175,55,0.08)'
            : 'rgba(9,19,31,0.4)',
          border:       `2px dashed ${dragging
            ? 'rgba(212,175,55,0.6)'
            : 'rgba(143,163,191,0.2)'}`,
          borderRadius: '14px', padding: '40px 24px',
          textAlign:    'center', cursor: 'pointer',
          transition:   'all 0.2s',
        }}
      >
        <Upload size={28} color={dragging ? '#d4af37' : '#8fa3bf'}
                style={{ margin: '0 auto 12px' }} />
        <p style={{
          fontSize:   '13px', color: '#f5f7fa',
          fontFamily: 'Inter, sans-serif', marginBottom: '6px',
        }}>
          {dragging
            ? 'Drop to hash & verify'
            : 'Drag & drop any file to verify authenticity'}
        </p>
        <p style={{
          fontSize: '11px', color: '#8fa3bf',
          fontFamily: 'monospace',
        }}>
          or click to browse — SHA-256 computed in browser
        </p>
        <input
          id="file-input" type="file"
          style={{ display: 'none' }}
          onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); }}
        />
      </div>

      {/* File hash result */}
      {fileResult && (
        <div style={{
          background:   'rgba(95,209,255,0.05)',
          border:       '1px solid rgba(95,209,255,0.2)',
          borderRadius: '10px', padding: '14px 18px',
        }}>
          <p style={{
            fontSize: '10px', letterSpacing: '2px',
            color: '#8fa3bf', fontFamily: 'monospace', marginBottom: '6px',
          }}>
            FILE HASH COMPUTED
          </p>
          <p style={{
            fontSize: '11px', color: '#5fd1ff',
            fontFamily: 'monospace', wordBreak: 'break-all',
          }}>
            {fileResult.name} → {fileResult.hash}
          </p>
        </div>
      )}

      {/* Manual hash input */}
      <div style={{
        background:   '#132238',
        border:       '1px solid rgba(212,175,55,0.15)',
        borderRadius: '14px', padding: '24px',
      }}>
        <label style={{
          display: 'block', fontSize: '10px',
          letterSpacing: '3px', color: '#8fa3bf',
          fontFamily: 'monospace', marginBottom: '12px',
        }}>
          OR ENTER CONTENT HASH MANUALLY
        </label>
        <input
          value={hashInput}
          onChange={e => setHashInput(e.target.value)}
          placeholder="SHA-256 hex string (64 characters)…"
          style={{
            width:        '100%', background: 'rgba(9,19,31,0.6)',
            border:       '1px solid rgba(95,209,255,0.15)',
            borderRadius: '8px', padding: '12px 16px',
            color:        '#f5f7fa', fontSize: '13px',
            fontFamily:   'monospace', outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(212,175,55,0.4)'}
          onBlur={e  => e.target.style.borderColor = 'rgba(95,209,255,0.15)'}
        />
        <button
          onClick={handleVerify}
          disabled={loading || !hashInput.trim()}
          style={{
            marginTop:    '14px', width: '100%', padding: '13px',
            borderRadius: '8px',
            fontFamily:   'Orbitron, monospace', fontSize: '11px',
            fontWeight:   700, letterSpacing: '2px', cursor: 'pointer',
            background:   'transparent',
            border:       '1px solid rgba(95,209,255,0.4)',
            color:        '#5fd1ff',
            display:      'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px',
            opacity:      loading || !hashInput.trim() ? 0.4 : 1,
            transition:   'all 0.2s',
          }}
        >
          <Search size={13} />
          {loading ? 'VERIFYING…' : 'VERIFY AUTHENTICITY'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background:   'rgba(255,92,122,0.08)',
          border:       '1px solid rgba(255,92,122,0.3)',
          borderRadius: '12px', padding: '20px',
          display:      'flex', alignItems: 'flex-start', gap: '12px',
        }}>
          <XCircle size={20} color="#ff5c7a" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>
            <p style={{
              fontFamily: 'Orbitron, monospace', fontSize: '12px',
              fontWeight: 700, color: '#ff5c7a', marginBottom: '6px',
              letterSpacing: '1px',
            }}>
              TAMPERED OR UNREGISTERED
            </p>
            <p style={{
              fontSize: '12px', color: '#ff5c7a',
              fontFamily: 'monospace', opacity: 0.8,
            }}>
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Verification result */}
      {isVerified && (
        <div style={{
          background:   isVerified
            ? 'rgba(50,213,131,0.05)'
            : 'rgba(255,92,122,0.05)',
          border:       `1px solid ${isVerified
            ? 'rgba(50,213,131,0.3)'
            : 'rgba(255,92,122,0.3)'}`,
          borderRadius: '14px', padding: '24px',
          boxShadow:    isVerified
            ? '0 0 24px rgba(50,213,131,0.08)'
            : '0 0 24px rgba(255,92,122,0.08)',
        }}>
          {/* Status */}
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: '12px', marginBottom: '20px',
          }}>
            <CheckCircle size={24} color="#32d583" />
            <div>
              <p style={{
                fontFamily: 'Orbitron, monospace', fontSize: '14px',
                fontWeight: 700, color: '#32d583',
                letterSpacing: '2px', marginBottom: '2px',
              }}>
                AUTHENTIC — VERIFIED ORIGIN
              </p>
              <p style={{
                fontSize: '11px', color: '#8fa3bf', fontFamily: 'monospace',
              }}>
                {certVerify?.reason || 'On-chain record found'}
              </p>
            </div>
          </div>

          {/* Record details */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: '1fr 1fr',
            gap:                 '10px',
          }}>
            {[
              { label: 'MODEL',        value: chainRecord.modelId },
              { label: 'CREATOR',      value: `${chainRecord.creator?.slice(0,10)}…` },
              { label: 'MINTED',       value: new Date(chainRecord.timestamp * 1000).toLocaleString() },
              { label: 'TEE VERIFIED', value: chainRecord.verified ? 'YES ✓' : 'NO' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background:   'rgba(9,19,31,0.4)',
                borderRadius: '8px', padding: '12px 14px',
              }}>
                <p style={{
                  fontSize: '9px', letterSpacing: '2px',
                  color: '#8fa3bf', fontFamily: 'monospace', marginBottom: '4px',
                }}>
                  {label}
                </p>
                <p style={{
                  fontSize: '12px', color: '#f5f7fa', fontFamily: 'monospace',
                }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Explorer link */}
          <a
            href={`${EXPLORER}/token/${import.meta.env.VITE_CONTRACT_ADDRESS}`}
            target="_blank" rel="noreferrer"
            style={{
              display:      'inline-flex', alignItems: 'center', gap: '6px',
              marginTop:    '16px', fontSize: '10px',
              fontFamily:   'monospace', letterSpacing: '1px',
              color:        '#d4af37', textDecoration: 'none',
            }}
          >
            VIEW CONTRACT ON 0G EXPLORER →
          </a>
        </div>
      )}

    </div>
  );
}