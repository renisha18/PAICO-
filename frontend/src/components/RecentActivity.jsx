import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { RotateCw, ExternalLink } from 'lucide-react';

const RPC = import.meta.env.VITE_OG_RPC_URL;
const CONTRACT = import.meta.env.VITE_CONTRACT_ADDRESS;
const EXPLORER = import.meta.env.VITE_OG_EXPLORER;

const EVENT_ABI = [
  'event ProvenanceMinted(uint256 indexed,string,address indexed,string,uint256)',
];

const CARD_BG = '#112240';
const BORDER = 'rgba(212, 175, 55, 0.15)';
const TEXT_MUTED = '#94a3b8';
const CYAN = '#60a5fa';
const GOLD = '#d4af37';

function relativeTime(tsSeconds) {
  const ts = Number(tsSeconds);
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60) return `${diff} sec ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return new Date(ts * 1000).toLocaleDateString();
}

function truncateHash(hash) {
  if (!hash || hash.length < 16) return hash || '—';
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

function truncateAddr(addr) {
  if (!addr || addr.length < 12) return addr || '—';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function RecentActivity({ refreshTrigger = 0 }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new ethers.JsonRpcProvider(RPC);
      const contract = new ethers.Contract(CONTRACT, EVENT_ABI, provider);
      const latest = await provider.getBlockNumber();
      const fromBlock = Math.max(0, latest - 500);
      const events = await contract.queryFilter(
        contract.filters.ProvenanceMinted(),
        fromBlock,
        latest,
      );

      const parsed = events
        .slice(-5)
        .reverse()
        .map(ev => ({
          tokenId: ev.args[0]?.toString() ?? ev.args?.tokenId?.toString(),
          contentHash: ev.args[1] ?? ev.args?.contentHash,
          creator: ev.args[2] ?? ev.args?.creator,
          modelId: ev.args[3] ?? ev.args?.modelId,
          timestamp: Number(ev.args[4] ?? ev.args?.timestamp ?? 0),
          txHash: ev.transactionHash,
        }));

      setRecords(parsed);
    } catch (err) {
      console.error('[RecentActivity]', err);
      setError('Unable to load recent activity');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [refreshTrigger, loadEvents]);

  return (
    <div style={{
      background: CARD_BG,
      border: `1px solid ${BORDER}`,
      borderRadius: '14px',
      padding: '24px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        <p style={{
          fontSize: '10px',
          letterSpacing: '3px',
          color: TEXT_MUTED,
          fontFamily: 'JetBrains Mono, monospace',
          margin: 0,
        }}>
          RECENT ATTESTATIONS
        </p>
        <button
          type="button"
          onClick={loadEvents}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            background: 'rgba(212, 175, 55, 0.08)',
            color: GOLD,
            fontSize: '10px',
            fontFamily: 'JetBrains Mono, monospace',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          <RotateCw size={12} style={loading ? { animation: 'spin 1s linear infinite' } : undefined} />
          REFRESH
        </button>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                height: '56px',
                borderRadius: '8px',
                background: 'rgba(8, 17, 31, 0.6)',
                animation: 'pulse 1.2s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <p style={{
          fontSize: '12px',
          color: TEXT_MUTED,
          fontFamily: 'Inter, sans-serif',
          textAlign: 'center',
          padding: '16px 0',
        }}>
          {error}
        </p>
      )}

      {!loading && !error && records.length === 0 && (
        <p style={{
          fontSize: '12px',
          color: TEXT_MUTED,
          fontFamily: 'Inter, sans-serif',
          textAlign: 'center',
          padding: '16px 0',
        }}>
          No attestations found
        </p>
      )}

      {!loading && !error && records.length > 0 && (
        <div>
          {records.map((rec, i) => (
            <div key={`${rec.txHash}-${rec.tokenId}`}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '14px 0',
              }}>
                <div>
                  <p style={{
                    fontFamily: 'Orbitron, monospace',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: GOLD,
                    margin: '0 0 6px',
                    letterSpacing: '1px',
                  }}>
                    Token #{rec.tokenId}
                  </p>
                  <p style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '12px',
                    color: CYAN,
                    margin: '0 0 4px',
                  }}>
                    {truncateHash(rec.contentHash)}
                  </p>
                  <p style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    color: TEXT_MUTED,
                    margin: 0,
                  }}>
                    {truncateAddr(rec.creator)}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '6px',
                  flexShrink: 0,
                }}>
                  <p style={{
                    fontSize: '10px',
                    color: TEXT_MUTED,
                    fontFamily: 'JetBrains Mono, monospace',
                    margin: 0,
                    maxWidth: '120px',
                    textAlign: 'right',
                    wordBreak: 'break-word',
                  }}>
                    {rec.modelId}
                  </p>
                  <p style={{
                    fontSize: '10px',
                    color: TEXT_MUTED,
                    fontFamily: 'JetBrains Mono, monospace',
                    margin: 0,
                  }}>
                    {relativeTime(rec.timestamp)}
                  </p>
                  {rec.txHash && (
                    <a
                      href={`${EXPLORER}/tx/${rec.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: GOLD,
                        opacity: 0.85,
                      }}
                      title="View on 0G Explorer"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
              {i < records.length - 1 && (
                <div style={{
                  height: '1px',
                  background: 'rgba(212, 175, 55, 0.1)',
                }} />
              )}
            </div>
          ))}
        </div>
      )}

      <p style={{
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(212, 175, 55, 0.1)',
        fontSize: '9px',
        color: TEXT_MUTED,
        fontFamily: 'JetBrains Mono, monospace',
        textAlign: 'center',
        letterSpacing: '1px',
      }}>
        Powered by 0G Chain · Live data
      </p>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
