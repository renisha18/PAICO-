import { CheckCircle, ExternalLink, Copy, Database } from 'lucide-react';

const EXPLORER = import.meta.env.VITE_OG_EXPLORER;

export default function ProvenanceCard({ result, txHash, tokenId }) {
  const { content, certificate, mintParams } = result;

  function copy(text) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div
      style={{
        background: '#132238',
        border: '1px solid rgba(50,213,131,0.3)',
        borderRadius: '14px',
        padding: '24px',
        boxShadow: '0 0 30px rgba(50,213,131,0.08)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle size={18} color="#32d583" />

          <span
            style={{
              fontFamily: 'Orbitron, monospace',
              fontSize: '12px',
              fontWeight: 700,
              color: '#32d583',
              letterSpacing: '2px',
            }}
          >
            PROVENANCE MINTED
          </span>
        </div>

        {tokenId && (
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'monospace',
              color: '#8fa3bf',
            }}
          >
            Token #{tokenId}
          </span>
        )}
      </div>

      {/* Generated content */}
      <div
        style={{
          background: 'rgba(9,19,31,0.5)',
          border: '1px solid rgba(95,209,255,0.1)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
        }}
      >
        <p
          style={{
            fontSize: '10px',
            letterSpacing: '3px',
            color: '#8fa3bf',
            fontFamily: 'monospace',
            marginBottom: '10px',
          }}
        >
          GENERATED OUTPUT
        </p>

        <p
          style={{
            fontSize: '14px',
            color: '#f5f7fa',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.7,
          }}
        >
          {content.text}
        </p>
      </div>

      {/* Hashes */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        {[
          { label: 'CONTENT HASH', value: mintParams.contentHash },
          { label: 'CERTIFICATE HASH', value: mintParams.certificateHash },
          { label: 'STORAGE ROOT', value: mintParams.storageRoot },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: 'rgba(9,19,31,0.4)',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: '9px',
                  letterSpacing: '2px',
                  color: '#8fa3bf',
                  fontFamily: 'monospace',
                  marginBottom: '4px',
                }}
              >
                {label}
              </p>

              <p
                style={{
                  fontSize: '11px',
                  color: '#5fd1ff',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  lineHeight: 1.4,
                }}
              >
                {value}
              </p>
            </div>

            <button
              onClick={() => copy(value)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                flexShrink: 0,
              }}
            >
              <Copy size={12} color="#8fa3bf" />
            </button>
          </div>
        ))}
      </div>

      {/* Metadata grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        {[
          { label: 'MODEL', value: certificate.modelId },
          {
            label: 'TIMESTAMP',
            value: new Date(
              certificate.timestamp * 1000
            ).toLocaleString(),
          },
          {
            label: 'TEE SIGNER',
            value: `${certificate.teeAddress?.slice(0, 10)}…`,
          },
          {
            label: 'CHAIN STATUS',
            value: 'VERIFIED ✓',
            highlight: true,
          },
        ].map(({ label, value, highlight }) => (
          <div
            key={label}
            style={{
              background: 'rgba(9,19,31,0.4)',
              borderRadius: '8px',
              padding: '12px 14px',
            }}
          >
            <p
              style={{
                fontSize: '9px',
                letterSpacing: '2px',
                color: '#8fa3bf',
                fontFamily: 'monospace',
                marginBottom: '4px',
              }}
            >
              {label}
            </p>

            <p
              style={{
                fontSize: '12px',
                fontFamily: 'monospace',
                color: highlight ? '#32d583' : '#f5f7fa',
                fontWeight: highlight ? 700 : 400,
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Action buttons */}
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
              fontFamily: 'monospace',
              letterSpacing: '1px',
              textDecoration: 'none',
              background: 'rgba(212,175,55,0.1)',
              border: '1px solid rgba(212,175,55,0.3)',
              color: '#d4af37',
              transition: 'background 0.2s',
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
              fontFamily: 'monospace',
              letterSpacing: '1px',
              textDecoration: 'none',
              background: 'rgba(95,209,255,0.08)',
              border: '1px solid rgba(95,209,255,0.2)',
              color: '#5fd1ff',
              transition: 'background 0.2s',
            }}
          >
            <Database size={11} />
            0G STORAGE
          </a>
        )}

        <button
          onClick={() => copy(mintParams.contentHash)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '6px',
            fontSize: '10px',
            fontFamily: 'monospace',
            letterSpacing: '1px',
            cursor: 'pointer',
            background: 'rgba(143,163,191,0.08)',
            border: '1px solid rgba(143,163,191,0.2)',
            color: '#8fa3bf',
          }}
        >
          <Copy size={11} />
          COPY HASH
        </button>
      </div>

      {/* Verify link */}
      <div
        style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(212,175,55,0.1)',
        }}
      >
        <p
          style={{
            fontSize: '9px',
            letterSpacing: '2px',
            color: '#8fa3bf',
            fontFamily: 'monospace',
            marginBottom: '6px',
          }}
        >
          PUBLIC VERIFY URL
        </p>

        <p
          style={{
            fontSize: '11px',
            color: 'rgba(95,209,255,0.5)',
            fontFamily: 'monospace',
            wordBreak: 'break-all',
          }}
        >
          {window.location.origin}/verify/{mintParams.contentHash}
        </p>
      </div>
    </div>
  );
}