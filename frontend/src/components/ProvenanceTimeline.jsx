import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, Hash, Lock, Database,
  Link, Globe, CheckCircle, Clock,
} from 'lucide-react';

const EVENT_CONFIG = {
  generated: {
    icon: Cpu,
    label: 'AI Generation Complete',
    desc: 'Content generated inside 0G Compute',
    color: '#d4af37',
  },
  hashed: {
    icon: Hash,
    label: 'SHA-256 Hash Computed',
    desc: 'Content fingerprint locked — tamper-proof',
    color: '#60a5fa',
  },
  attested: {
    icon: Lock,
    label: 'TEE Attestation Signed',
    desc: 'Hardware certificate created with ECDSA',
    color: '#d4af37',
  },
  uploaded: {
    icon: Database,
    label: 'Uploaded to 0G Storage',
    desc: 'Content + certificate stored permanently',
    color: '#60a5fa',
  },
  minted: {
    icon: Link,
    label: 'NFT Minted On-Chain',
    desc: 'Provenance record written to 0G Chain',
    color: '#d4af37',
  },
  verified: {
    icon: Globe,
    label: 'Verification Available',
    desc: 'Anyone can verify this content forever',
    color: '#22c55e',
  },
};

const CARD_BG = '#112240';
const TEXT_PRIMARY = '#f8fafc';
const TEXT_MUTED = '#94a3b8';

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatElapsed(ms) {
  if (ms < 1000) return `+${ms}ms`;
  return `+${(ms / 1000).toFixed(1)}s`;
}

export default function ProvenanceTimeline({ events = [], isLive = false }) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (events.length === 0) {
      setVisibleCount(0);
      return;
    }

    if (isLive) {
      setVisibleCount(events.length);
    } else {
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setVisibleCount(count);
        if (count >= events.length) clearInterval(interval);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [events.length, isLive]);

  if (events.length === 0) return null;

  const visibleEvents = events.slice(0, visibleCount);

  return (
    <div style={{
      background: CARD_BG,
      border: '1px solid rgba(212, 175, 55, 0.15)',
      borderRadius: '14px',
      padding: '24px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
      }}>
        <div>
          <p style={{
            fontSize: '10px',
            letterSpacing: '3px',
            color: TEXT_MUTED,
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: '4px',
          }}>
            CRYPTOGRAPHIC AUDIT TRAIL
          </p>
          <h3 style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: '13px',
            fontWeight: 700,
            color: TEXT_PRIMARY,
            letterSpacing: '1px',
          }}>
            PROVENANCE TIMELINE
          </h3>
        </div>
        {isLive && visibleCount < events.length && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '10px',
            fontFamily: 'JetBrains Mono, monospace',
            color: '#d4af37',
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#d4af37',
              display: 'inline-block',
              animation: 'pulse 1s infinite',
            }} />
            RECORDING
          </div>
        )}
        {visibleCount === events.length && events.length === 6 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '10px',
            fontFamily: 'JetBrains Mono, monospace',
            color: '#22c55e',
          }}>
            <CheckCircle size={12} />
            COMPLETE
          </div>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          left: '19px',
          top: '20px',
          bottom: '20px',
          width: '1px',
          background: 'linear-gradient(180deg, #d4af37 0%, #60a5fa 50%, #22c55e 100%)',
          opacity: 0.25,
        }} />

        <AnimatePresence>
          {visibleEvents.map((event, i) => {
            const config = EVENT_CONFIG[event.type];
            if (!config) return null;
            const Icon = config.icon;
            const prevTs = i > 0 ? events[i - 1].timestamp : null;
            const elapsed = prevTs ? event.timestamp - prevTs : null;

            return (
              <motion.div
                key={`${event.type}-${event.timestamp}-${i}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  marginBottom: i < visibleEvents.length - 1 ? '20px' : '0',
                  position: 'relative',
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: `${config.color}15`,
                  border: `1.5px solid ${config.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 12px ${config.color}30`,
                  zIndex: 1,
                }}>
                  <Icon size={16} color={config.color} />
                </div>

                <div style={{ flex: 1, paddingTop: '4px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '4px',
                    flexWrap: 'wrap',
                    gap: '4px',
                  }}>
                    <p style={{
                      fontFamily: 'Orbitron, monospace',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: TEXT_PRIMARY,
                      letterSpacing: '1px',
                    }}>
                      {config.label}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {elapsed !== null && (
                        <span style={{
                          fontSize: '9px',
                          fontFamily: 'JetBrains Mono, monospace',
                          color: config.color,
                          opacity: 0.7,
                        }}>
                          {formatElapsed(elapsed)}
                        </span>
                      )}
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '9px',
                        fontFamily: 'JetBrains Mono, monospace',
                        color: TEXT_MUTED,
                      }}>
                        <Clock size={9} />
                        {formatTime(event.timestamp)}
                      </span>
                    </div>
                  </div>

                  <p style={{
                    fontSize: '11px',
                    color: TEXT_MUTED,
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: 1.5,
                    marginBottom: (event.hash || event.txHash) ? '8px' : '0',
                  }}>
                    {config.desc}
                  </p>

                  {event.hash && (
                    <div style={{
                      background: 'rgba(8, 17, 31, 0.5)',
                      borderRadius: '4px',
                      padding: '5px 10px',
                      display: 'inline-block',
                      marginRight: event.txHash ? '8px' : '0',
                    }}>
                      <span style={{
                        fontSize: '10px',
                        fontFamily: 'JetBrains Mono, monospace',
                        color: config.color,
                        letterSpacing: '0.5px',
                      }}>
                        {event.hash.slice(0, 12)}…{event.hash.slice(-8)}
                      </span>
                    </div>
                  )}

                  {event.txHash && (
                    <div style={{
                      background: 'rgba(8, 17, 31, 0.5)',
                      borderRadius: '4px',
                      padding: '5px 10px',
                      display: 'inline-block',
                    }}>
                      <span style={{
                        fontSize: '10px',
                        fontFamily: 'JetBrains Mono, monospace',
                        color: '#22c55e',
                      }}>
                        tx: {event.txHash.slice(0, 10)}…{event.txHash.slice(-6)}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}
