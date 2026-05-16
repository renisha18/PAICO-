import { QRCodeSVG } from 'qrcode.react';
import { Shield, Copy } from 'lucide-react';

const CARD_BG = '#112240';
const BORDER = 'rgba(212, 175, 55, 0.15)';
const TEXT_MUTED = '#94a3b8';
const CYAN = '#60a5fa';
const GOLD = '#d4af37';

export default function VerifyQR({ contentHash }) {
  const verifyUrl = `${window.location.origin}/verify/${contentHash}`;
  const truncated = verifyUrl.length > 40
    ? `${verifyUrl.slice(0, 40)}…`
    : verifyUrl;

  function copyUrl() {
    navigator.clipboard.writeText(verifyUrl);
  }

  return (
    <div style={{
        background: CARD_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: '14px',
        padding: '20px',
        marginTop: '16px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '16px',
        }}>
          <Shield size={14} color={GOLD} />
          <p style={{
            fontSize: '10px',
            letterSpacing: '3px',
            color: TEXT_MUTED,
            fontFamily: 'JetBrains Mono, monospace',
            margin: 0,
          }}>
            SCAN TO VERIFY
          </p>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '14px',
        }}>
          <QRCodeSVG
            value={verifyUrl}
            size={140}
            bgColor={CARD_BG}
            fgColor={GOLD}
            level="M"
          />
        </div>

        <p style={{
          fontSize: '11px',
          color: TEXT_MUTED,
          fontFamily: 'Inter, sans-serif',
          marginBottom: '8px',
        }}>
          Verify authenticity from any device
        </p>

        <p style={{
          fontSize: '11px',
          color: CYAN,
          fontFamily: 'JetBrains Mono, monospace',
          marginBottom: '12px',
          wordBreak: 'break-all',
        }}>
          {truncated}
        </p>

        <button
          onClick={copyUrl}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '6px',
            fontSize: '10px',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '1px',
            cursor: 'pointer',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            color: GOLD,
          }}
        >
          <Copy size={11} />
          COPY URL
        </button>
    </div>
  );
}
