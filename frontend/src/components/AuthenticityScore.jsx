import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Link2, Database, Hash,
  CheckCircle, XCircle, Loader,
} from 'lucide-react';

const CARD_BG = '#112240';
const TEXT_MUTED = '#94a3b8';
const SUCCESS = '#22c55e';
const DANGER = '#ef4444';
const GOLD = '#d4af37';
const ORANGE = '#f97316';

const CHECK_ROWS = [
  { key: 'teeValid',      label: 'TEE Attestation',  desc: 'Hardware-signed certificate verified locally', points: 40, Icon: Shield },
  { key: 'chainRecord',   label: 'On-Chain Record',  desc: 'Provenance NFT exists on 0G Chain',          points: 30, Icon: Link2 },
  { key: 'storageExists', label: '0G Storage',       desc: 'Certificate retrievable from decentralized storage', points: 20, Icon: Database },
  { key: 'hashMatch',     label: 'Hash Integrity',   desc: 'Content hash matches on-chain record',       points: 10, Icon: Hash },
];

function useCountUp(target, duration = 800, active = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) { setValue(0); return; }
    const start = performance.now();
    let frame;
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * t));
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, active]);
  return value;
}

function scoreColor(score) {
  if (score >= 90) return SUCCESS;
  if (score >= 70) return GOLD;
  if (score >= 40) return ORANGE;
  return DANGER;
}

function scoreLabel(score) {
  if (score >= 90) return 'FULLY AUTHENTICATED';
  if (score >= 70) return 'HIGHLY TRUSTED';
  if (score >= 40) return 'PARTIALLY VERIFIED';
  return 'LOW CONFIDENCE';
}

export default function AuthenticityScore({ checks = {}, loading = false }) {
  const hasChecks = Object.keys(checks).length > 0;
  const total = CHECK_ROWS.reduce((sum, row) => sum + (checks[row.key] ? row.points : 0), 0);
  const displayScore = useCountUp(total, 800, !loading && hasChecks);
  const color = scoreColor(loading ? 0 : total);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - ((loading ? 0 : displayScore) / 100) * circumference;

  return (
    <div style={{
      background: CARD_BG,
      border: '1px solid rgba(212, 175, 55, 0.15)',
      borderRadius: '14px',
      padding: '24px',
    }}>
      <p style={{
        fontSize: '10px',
        letterSpacing: '3px',
        color: TEXT_MUTED,
        fontFamily: 'JetBrains Mono, monospace',
        marginBottom: '20px',
      }}>
        AUTHENTICITY SCORE
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px', alignItems: 'center' }}>
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 128, height: 128 }}>
            <svg width="128" height="128" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="8" />
              <motion.circle
                cx="64" cy="64" r={radius} fill="none"
                stroke={color} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '28px', fontWeight: 700, color }}>
                {loading ? '—' : displayScore}
              </span>
              <span style={{ fontSize: '10px', color: TEXT_MUTED, fontFamily: 'JetBrains Mono, monospace' }}>
                / 100
              </span>
            </div>
          </div>
          <p style={{
            marginTop: '12px',
            fontFamily: 'Orbitron, monospace',
            fontSize: '9px',
            letterSpacing: '2px',
            color,
            textAlign: 'center',
          }}>
            {loading ? 'VERIFYING…' : scoreLabel(total)}
          </p>
        </div>

        <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {CHECK_ROWS.map(({ key, label, desc, points, Icon }) => {
            const pass = checks[key];
            const pending = loading || checks[key] === undefined;
            const rowBg = pending ? 'rgba(148,163,184,0.06)' : pass ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)';
            const rowBorder = pending ? 'rgba(148,163,184,0.15)' : pass ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)';

            return (
              <div key={key} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '8px',
                background: rowBg, border: `1px solid ${rowBorder}`,
              }}>
                <Icon size={16} color={pending ? TEXT_MUTED : pass ? SUCCESS : DANGER} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
                    {label}
                  </p>
                  <p style={{ fontSize: '10px', color: TEXT_MUTED, fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>
                    {desc}
                  </p>
                </div>
                <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: GOLD, flexShrink: 0 }}>
                  +{points}
                </span>
                <span style={{
                  fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
                  letterSpacing: '1px', flexShrink: 0,
                  color: pending ? TEXT_MUTED : pass ? SUCCESS : DANGER,
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  {pending ? (
                    <><Loader size={10} style={{ animation: 'spin 1s linear infinite' }} /> …</>
                  ) : pass ? (
                    <><CheckCircle size={10} /> PASS</>
                  ) : (
                    <><XCircle size={10} /> FAIL</>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
