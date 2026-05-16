import { useState } from 'react';
import { FileText, Image } from 'lucide-react';
import GeneratePanel from './GeneratePanel.jsx';
import ImageGeneratePanel from './ImageGeneratePanel.jsx';

const GOLD = '#d4af37';
const TEXT_MUTED = '#94a3b8';
const TAB_BG = 'rgba(17, 34, 64, 0.5)';

export default function GenerateTabs({ signer, onMintComplete }) {
  const [activeTab, setActiveTab] = useState('text');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '4px',
        background: TAB_BG,
        borderRadius: '10px',
        border: '1px solid rgba(212, 175, 55, 0.12)',
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('text')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Orbitron, monospace',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '2px',
            background: activeTab === 'text' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
            color: activeTab === 'text' ? GOLD : TEXT_MUTED,
            borderBottom: activeTab === 'text' ? '2px solid #d4af37' : '2px solid transparent',
            marginBottom: '-1px',
          }}
        >
          <FileText size={16} />
          TEXT
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('image')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Orbitron, monospace',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '2px',
            background: activeTab === 'image' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
            color: activeTab === 'image' ? GOLD : TEXT_MUTED,
            borderBottom: activeTab === 'image' ? '2px solid #d4af37' : '2px solid transparent',
            marginBottom: '-1px',
          }}
        >
          <Image size={16} />
          IMAGE
          <span style={{
            fontSize: '8px',
            letterSpacing: '1px',
            padding: '2px 8px',
            borderRadius: '999px',
            background: 'rgba(212, 175, 55, 0.2)',
            color: GOLD,
            border: '1px solid rgba(212, 175, 55, 0.35)',
          }}>
            NEW
          </span>
        </button>
      </div>

      {activeTab === 'text'
        ? <GeneratePanel signer={signer} onMintComplete={onMintComplete} />
        : <ImageGeneratePanel signer={signer} onMintComplete={onMintComplete} />}
    </div>
  );
}
