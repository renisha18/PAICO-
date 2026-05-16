import { Shield, ExternalLink, Copy, Database } from 'lucide-react';
import VerifyQR from './VerifyQR.jsx';

const EXPLORER = import.meta.env.VITE_OG_EXPLORER;
const CARD_BG = '#112240';
const TEXT_PRIMARY = '#f8fafc';
const TEXT_MUTED = '#94a3b8';
const CYAN = '#60a5fa';
const GOLD = '#d4af37';
const SUCCESS = '#22c55e';

export default function ImageProvenanceCard({ result, txHash, tokenId }) {
  const { content, certificate, mintParams } = result;

  function copy(text) {
    navigator.clipboard.writeText(text);
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
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={20} color={SUCCESS} />
          <span style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: '12px',
            fontWeight: 700,
            color: SUCCESS,
            letterSpacing: '2px',
          }}>
            IMAGE PROVENANCE MINTED
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {tokenId && (
            <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: TEXT_MUTED }}>
              Token #{tokenId}
            </span>
          )}
          <span style={{
            fontSize: '9px',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '2px',
            color: GOLD,
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            background: 'rgba(212, 175, 55, 0.08)',
          }}>
            IMAGE
          </span>
        </div>
      </div>

      <div style={{
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        marginBottom: '10px',
      }}>
        <img
          src={content.imageUrl}
          alt="Attested generation"
          style={{ width: '100%', display: 'block' }}
        />
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '6px 10px',
          borderRadius: '6px',
        }}>
          <Shield size={14} color={SUCCESS} />
          <span style={{
            fontSize: '10px',
            fontFamily: 'Orbitron, monospace',
            fontWeight: 700,
            letterSpacing: '1px',
            color: '#f8fafc',
          }}>
            PAICO VERIFIED
          </span>
        </div>
      </div>

      <p style={{
        fontSize: '11px',
        color: TEXT_MUTED,
        fontFamily: 'Inter, sans-serif',
        marginBottom: '20px',
      }}>
        Attested image — stored on 0G Storage
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'CONTENT HASH', value: mintParams.contentHash },
          { label: 'CERTIFICATE HASH', value: mintParams.certificateHash },
          { label: 'STORAGE ROOT', value: mintParams.storageRoot },
        ].map(({ label, value }) => (
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
              onClick={() => copy(value)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
            >
              <Copy size={12} color={TEXT_MUTED} />
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
          { label: 'TIMESTAMP', value: new Date(certificate.timestamp * 1000).toLocaleString() },
          {
            label: 'TEE SIGNER',
            value: certificate.teeAddress
              ? `${certificate.teeAddress.slice(0, 10)}…`
              : '—',
          },
          { label: 'TYPE', value: 'IMAGE ✓', highlight: true },
        ].map(({ label, value, highlight }) => (
          <div key={label} style={{
            background: 'rgba(8, 17, 31, 0.4)',
            borderRadius: '8px',
            padding: '12px 14px',
          }}>
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
          onClick={() => copy(mintParams.contentHash)}
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
            background: 'rgba(148, 163, 184, 0.08)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            color: TEXT_MUTED,
          }}
        >
          <Copy size={11} />
          COPY HASH
        </button>
      </div>

      <VerifyQR contentHash={mintParams.contentHash} />

      <p style={{
        marginTop: '12px',
        fontSize: '10px',
        color: TEXT_MUTED,
        fontFamily: 'Inter, sans-serif',
        lineHeight: 1.5,
        textAlign: 'center',
      }}>
        This QR code links to public verification. Anyone can confirm this image's origin without trusting PAICO.
      </p>
    </div>
  );
}
