import { useState, useRef, useEffect }  from 'react';
import { motion }    from 'framer-motion';
import { hashFile }  from '../utils/hash.js';
import {
  Upload, CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';

function diffHashes(hashA, hashB) {
  return hashA.split('').map((char, i) => ({
    char,
    changed: char !== hashB[i],
  }));
}

function FileDropZone({ label, onFile, file, hash, color, previewUrl }) {
  const [dragging, setDragging] = useState(false);
  const isImage = file?.type?.startsWith('image/');

  function handleDrop(e) {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }

  return (
    <div style={{ flex: 1 }}>
      <p style={{
        fontSize:      '10px', letterSpacing: '3px',
        color:         color, fontFamily: 'monospace',
        marginBottom:  '10px', fontWeight: 700,
      }}>
        {label}
      </p>

      <div
        onDragOver={e  => { e.preventDefault(); setDragging(true);  }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById(`drop-${label}`).click()}
        style={{
          background:   dragging
            ? `${color}10`
            : file ? 'rgba(8,17,31,0.6)' : 'rgba(8,17,31,0.3)',
          border:       `2px dashed ${dragging ? color : file
            ? `${color}60`
            : 'rgba(143,163,191,0.2)'}`,
          borderRadius: '10px', padding: '24px 16px',
          textAlign:    'center', cursor: 'pointer',
          transition:   'all 0.2s', minHeight: '100px',
          display:      'flex', flexDirection: 'column',
          alignItems:   'center', justifyContent: 'center', gap: '8px',
        }}
      >
        <Upload size={20} color={file ? color : '#94a3b8'} />
        <p style={{
          fontSize:   '12px', fontFamily: 'Inter, sans-serif',
          color:      file ? '#f8fafc' : '#94a3b8',
          wordBreak:  'break-all',
        }}>
          {file ? file.name : 'Drop file here'}
        </p>
        {isImage && previewUrl && (
          <img
            src={previewUrl}
            alt=""
            style={{
              width: '100%',
              maxHeight: '160px',
              objectFit: 'contain',
              borderRadius: '6px',
              marginTop: '4px',
            }}
          />
        )}
        <input
          id={`drop-${label}`} type="file"
          style={{ display: 'none' }}
          onChange={e => { if (e.target.files[0]) onFile(e.target.files[0]); }}
        />
      </div>

      {hash && (
        <div style={{
          marginTop:    '10px',
          background:   'rgba(8,17,31,0.5)',
          borderRadius: '8px', padding: '10px 12px',
        }}>
          <p style={{
            fontSize:   '9px', letterSpacing: '2px',
            color:      '#94a3b8', fontFamily: 'monospace', marginBottom: '5px',
          }}>
            SHA-256
          </p>
          <p style={{
            fontSize:    '10px', fontFamily: 'monospace',
            color:       color, wordBreak: 'break-all',
            lineHeight:  1.6, letterSpacing: '0.5px',
          }}>
            {hash}
          </p>
        </div>
      )}
    </div>
  );
}

export default function TamperComparison() {
  const [origFile,  setOrigFile]  = useState(null);
  const [modFile,   setModFile]   = useState(null);
  const [origHash,  setOrigHash]  = useState('');
  const [modHash,   setModHash]   = useState('');
  const [origPreview, setOrigPreview] = useState(null);
  const [modPreview, setModPreview] = useState(null);
  const origPreviewRef = useRef(null);
  const modPreviewRef = useRef(null);

  useEffect(() => () => {
    if (origPreviewRef.current) URL.revokeObjectURL(origPreviewRef.current);
    if (modPreviewRef.current) URL.revokeObjectURL(modPreviewRef.current);
  }, []);

  async function handleOrigFile(file) {
    if (origPreviewRef.current) {
      URL.revokeObjectURL(origPreviewRef.current);
      origPreviewRef.current = null;
    }
    const url = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    origPreviewRef.current = url;
    setOrigPreview(url);
    setOrigFile(file);
    const h = await hashFile(file);
    setOrigHash(h);
  }

  async function handleModFile(file) {
    if (modPreviewRef.current) {
      URL.revokeObjectURL(modPreviewRef.current);
      modPreviewRef.current = null;
    }
    const url = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    modPreviewRef.current = url;
    setModPreview(url);
    setModFile(file);
    const h = await hashFile(file);
    setModHash(h);
  }

  const diffCount = origHash && modHash
    ? origHash.split('').filter((c, i) => c !== modHash[i]).length
    : 0;

  const isMatch   = origHash && modHash && origHash === modHash;
  const hasBoth   = origHash && modHash;

  const origDiff  = hasBoth ? diffHashes(origHash, modHash) : [];
  const modDiff   = hasBoth ? diffHashes(modHash, origHash) : [];

  const bothImages = origFile?.type?.startsWith('image/')
    && modFile?.type?.startsWith('image/');

  return (
    <div style={{
      background:   '#112240',
      border:       '1px solid rgba(212,175,55,0.15)',
      borderRadius: '14px',
      padding:      '28px',
    }}>

      <div style={{ marginBottom: '24px' }}>
        <p style={{
          fontSize:     '10px', letterSpacing: '3px',
          color:        '#94a3b8', fontFamily: 'monospace', marginBottom: '6px',
        }}>
          TAMPER DETECTION ENGINE
        </p>
        <h3 style={{
          fontFamily: 'Orbitron, monospace', fontSize: '14px',
          fontWeight: 700, color: '#f8fafc', letterSpacing: '1px',
          marginBottom: '8px',
        }}>
          SHA-256 COMPARISON
        </h3>
        <p style={{
          fontSize:   '12px', color: '#94a3b8',
          fontFamily: 'Inter, sans-serif', lineHeight: 1.6,
        }}>
          Upload the original file, then the modified version.
          Even a single changed pixel produces a completely different hash.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <FileDropZone
          label="ORIGINAL"
          onFile={handleOrigFile}
          file={origFile}
          hash={origHash}
          color="#22c55e"
          previewUrl={origPreview}
        />
        <FileDropZone
          label="MODIFIED"
          onFile={handleModFile}
          file={modFile}
          hash={modHash}
          color="#ef4444"
          previewUrl={modPreview}
        />
      </div>

      {hasBoth && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y:  0 }}
          transition={{ duration: 0.4 }}
        >
          <div style={{
            display:      'flex', alignItems: 'center',
            gap:          '14px', padding: '16px 20px',
            borderRadius: '10px', marginBottom: '20px',
            background:   isMatch
              ? 'rgba(34,197,94,0.08)'
              : 'rgba(239,68,68,0.08)',
            border:       `1px solid ${isMatch
              ? 'rgba(34,197,94,0.3)'
              : 'rgba(239,68,68,0.3)'}`,
          }}>
            {isMatch
              ? <CheckCircle  size={24} color="#22c55e" />
              : <XCircle      size={24} color="#ef4444" />
            }
            <div>
              <p style={{
                fontFamily: 'Orbitron, monospace', fontSize: '13px',
                fontWeight: 700, letterSpacing: '2px',
                color:      isMatch ? '#22c55e' : '#ef4444',
                marginBottom: '3px',
              }}>
                {isMatch ? 'FILES IDENTICAL — AUTHENTIC' : 'TAMPER DETECTED'}
              </p>
              <p style={{
                fontSize:   '11px', color: '#94a3b8', fontFamily: 'monospace',
              }}>
                {isMatch
                  ? 'Both files produce identical SHA-256 fingerprints'
                  : `${diffCount} / 64 hash characters differ (${Math.round(diffCount/64*100)}% avalanche)`
                }
              </p>
            </div>
          </div>

          {!isMatch && bothImages && origPreview && modPreview && (
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '20px',
            }}>
              <div style={{ flex: 1, borderRadius: '8px', overflow: 'hidden', border: '2px solid #22c55e' }}>
                <img src={origPreview} alt="Original" style={{ width: '100%', display: 'block', maxHeight: '220px', objectFit: 'contain', background: 'rgba(8,17,31,0.5)' }} />
              </div>
              <div style={{ flex: 1, borderRadius: '8px', overflow: 'hidden', border: '2px solid #ef4444' }}>
                <img src={modPreview} alt="Modified" style={{ width: '100%', display: 'block', maxHeight: '220px', objectFit: 'contain', background: 'rgba(8,17,31,0.5)' }} />
              </div>
            </div>
          )}

          {!isMatch && (
            <div style={{
              background:   'rgba(8,17,31,0.5)',
              borderRadius: '10px', padding: '18px 20px',
              marginBottom: '16px',
            }}>
              <p style={{
                fontSize:     '10px', letterSpacing: '3px',
                color:        '#94a3b8', fontFamily: 'monospace',
                marginBottom: '14px',
              }}>
                HASH DIFF — RED CHARACTERS CHANGED
              </p>

              <div style={{ marginBottom: '12px' }}>
                <p style={{
                  fontSize:     '9px', color: '#22c55e',
                  fontFamily:   'monospace', letterSpacing: '2px',
                  marginBottom: '6px',
                }}>
                  ORIGINAL
                </p>
                <div style={{
                  fontFamily:  'monospace', fontSize: '11px',
                  lineHeight:  1.8, wordBreak: 'break-all',
                  letterSpacing: '0.5px',
                }}>
                  {origDiff.map((d, i) => (
                    <span key={i} style={{
                      color:      d.changed ? '#ef4444' : '#22c55e',
                      background: d.changed ? 'rgba(239,68,68,0.15)' : 'transparent',
                      borderRadius: '2px',
                    }}>
                      {d.char}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p style={{
                  fontSize:     '9px', color: '#ef4444',
                  fontFamily:   'monospace', letterSpacing: '2px',
                  marginBottom: '6px',
                }}>
                  MODIFIED
                </p>
                <div style={{
                  fontFamily:   'monospace', fontSize: '11px',
                  lineHeight:   1.8, wordBreak: 'break-all',
                  letterSpacing:'0.5px',
                }}>
                  {modDiff.map((d, i) => (
                    <span key={i} style={{
                      color:      d.changed ? '#ef4444' : '#22c55e',
                      background: d.changed ? 'rgba(239,68,68,0.15)' : 'transparent',
                      borderRadius: '2px',
                    }}>
                      {d.char}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!isMatch && (
            <div style={{
              display:      'flex', gap: '10px', alignItems: 'flex-start',
              background:   'rgba(212,175,55,0.05)',
              border:       '1px solid rgba(212,175,55,0.15)',
              borderRadius: '8px', padding: '14px 16px',
            }}>
              <AlertTriangle size={14} color="#d4af37"
                             style={{ flexShrink: 0, marginTop: '1px' }} />
              <p style={{
                fontSize:   '11px', color: '#94a3b8',
                fontFamily: 'Inter, sans-serif', lineHeight: 1.6,
              }}>
                <span style={{ color: '#d4af37', fontWeight: 600 }}>
                  Avalanche effect:
                </span>{' '}
                SHA-256 is designed so that changing even one bit in the
                input causes ~50% of output bits to flip. This means no
                "close" hashes exist — you either match exactly or you don't.
                There is no partial authenticity.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {!origHash && !modHash && (
        <div style={{
          textAlign:    'center', padding: '16px',
          borderRadius: '8px',
          background:   'rgba(8,17,31,0.3)',
          border:       '1px solid rgba(143,163,191,0.1)',
        }}>
          <p style={{
            fontSize:   '11px', color: '#94a3b8', fontFamily: 'monospace',
            lineHeight: 1.7,
          }}>
            DEMO: Generate content → download the text →
            upload as ORIGINAL → modify one word → upload as MODIFIED
          </p>
        </div>
      )}

    </div>
  );
}
