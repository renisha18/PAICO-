import { useState } from 'react';
import { CheckCircle, ExternalLink, Copy, Check, Database } from 'lucide-react';
import VerifyQR from './VerifyQR.jsx';

const EXPLORER = import.meta.env.VITE_OG_EXPLORER;
const CARD_BG = '#112240';
const TEXT_PRIMARY = '#f8fafc';
const TEXT_MUTED = '#94a3b8';
const CYAN = '#60a5fa';
const GOLD = '#d4af37';
const SUCCESS = '#22c55e';

export default function ProvenanceCard({ result, txHash, tokenId }) {
  const { content, certificate, mintParams } = result;

  const [copied, setCopied] = useState({});

  function copy(key, text) {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopied(prev => ({ ...prev, [key]: false }));
    }, 2000);
  }

  return (
    <div style={{
      background: CARD_BG,
      border: '1px solid rgba(34, 197, 94, 0.3)',
      borderRadius: '14px',
      padding: '24px',
      boxShadow: '0 0 30px rgba(34, 197, 94, 0.08)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle size={18} color={SUCCESS} />
          <span style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: '12px',
            fontWeight: 700,
            color: SUCCESS,
            letterSpacing: '2px',
          }}>
            PROVENANCE MINTED
          </span>
        </div>
        {tokenId && (
          <span style={{
            fontSize: '11px',
            fontFamily: 'JetBrains Mono, monospace',
            color: TEXT_MUTED,
          }}>
            Token #{tokenId}
          </span>
        )}
      </div>

      <div style={{
        background: 'rgba(8, 17, 31, 0.5)',
        border: '1px solid rgba(96, 165, 250, 0.1)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px',
      }}>
        <p style={{
          fontSize: '10px',
          letterSpacing: '3px',
          color: TEXT_MUTED,
          fontFamily: 'JetBrains Mono, monospace',
          marginBottom: '10px',
        }}>
          GENERATED OUTPUT
        </p>
        <p style={{
          fontSize: '14px',
          color: TEXT_PRIMARY,
          fontFamily: 'Inter, sans-serif',
          lineHeight: 1.7,
        }}>
          {content.text}
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '20px',
      }}>
        {[
          { label: 'CONTENT HASH', copyKey: 'contentHash', value: mintParams.contentHash },
          { label: 'CERTIFICATE HASH', copyKey: 'certHash', value: mintParams.certificateHash },
          { label: 'STORAGE ROOT', copyKey: 'storageRoot', value: mintParams.storageRoot },
        ].map(({ label, copyKey, value }) => (
          <div
            key={label}
            style={{
              background: 'rgba(8, 17, 31, 0.4)',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: '9px',
                letterSpacing: '2px',
                color: TEXT_MUTED,
                fontFamily: 'JetBrains Mono, monospace',
                marginBottom: '4px',
              }}>
                {label}
              </p>
              <p style={{
                fontSize: '11px',
                color: CYAN,
                fontFamily: 'JetBrains Mono, monospace',
                wordBreak: 'break-all',
                lineHeight: 1.4,
              }}>
                {value}
              </p>
            </div>
            <button
              type="button"
              onClick={() => copy(copyKey, value)}
              style={{
                background: copied[copyKey] ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '9px',
                fontFamily: 'monospace',
                color: copied[copyKey] ? SUCCESS : TEXT_MUTED,
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              {copied[copyKey] ? <><Check size={11} /> COPIED!</> : <><Copy size={11} /></>}
            </button>
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '20px',
      }}>
        {[
          { label: 'MODEL', value: certificate.modelId },
          {
            label: 'TIMESTAMP',
            value: new Date(certificate.timestamp * 1000).toLocaleString(),
          },
          {
            label: 'TEE SIGNER',
            value: certificate.teeAddress
              ? `${certificate.teeAddress.slice(0, 10)}…`
              : '—',
          },
          { label: 'STATUS', value: 'VERIFIED ✓', highlight: true },
        ].map(({ label, value, highlight }) => (
          <div
            key={label}
            style={{
              background: 'rgba(8, 17, 31, 0.4)',
              borderRadius: '8px',
              padding: '12px 14px',
            }}
          >
            <p style={{
              fontSize: '9px',
              letterSpacing: '2px',
              color: TEXT_MUTED,
              fontFamily: 'JetBrains Mono, monospace',
              marginBottom: '4px',
            }}>
              {label}
            </p>
            <p style={{
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              color: highlight ? SUCCESS : TEXT_PRIMARY,
              fontWeight: highlight ? 700 : 400,
            }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {txHash && (
          <a
            href={`${EXPLORER}/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '10px',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '1px',
              textDecoration: 'none',
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: GOLD,
            }}
          >
            <ExternalLink size={11} />
            0G EXPLORER
          </a>
        )}

        {content.storageUrl && (
          <a
            href={content.storageUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '10px',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '1px',
              textDecoration: 'none',
              background: 'rgba(96, 165, 250, 0.08)',
              border: '1px solid rgba(96, 165, 250, 0.2)',
              color: CYAN,
            }}
          >
            <Database size={11} />
            0G STORAGE
          </a>
        )}

        <button
          type="button"
          onClick={() => copy('mainHash', mintParams.contentHash)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '6px',
            fontSize: '10px',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '1px',
            cursor: 'pointer',
            background: copied.mainHash ? 'rgba(34, 197, 94, 0.1)' : 'rgba(148, 163, 184, 0.08)',
            border: copied.mainHash ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(148, 163, 184, 0.2)',
            color: copied.mainHash ? SUCCESS : TEXT_MUTED,
            transition: 'all 0.2s',
          }}
        >
          {copied.mainHash ? <><Check size={11} /> COPIED!</> : <><Copy size={11} /> COPY HASH</>}
        </button>
      </div>

      <VerifyQR contentHash={mintParams.contentHash} />
    </div>
  );
}
