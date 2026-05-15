import { motion } from 'framer-motion';
import { Shield, Cpu, Database } from 'lucide-react';

export default function HeroSection({ onGetStarted }) {
  return (
    <section style={{
      minHeight:      '88vh',
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      textAlign:      'center',
      padding:        '80px 24px 60px',
      position:       'relative',
      overflow:       'hidden',
    }}>

      {/* Grid background */}
      <div style={{
        position:   'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(95,209,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(95,209,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
      }} />

      {/* Radial glow */}
      <div style={{
        position:   'absolute', top: '40%', left: '50%',
        transform:  'translate(-50%, -50%)',
        width:      '500px', height: '250px',
        borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(212,175,55,0.07) 0%, transparent 70%)',
      }} />

      {/* Live badge */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display:      'inline-flex', alignItems: 'center', gap: '8px',
          padding:      '6px 16px', borderRadius: '99px', marginBottom: '28px',
          background:   'rgba(212,175,55,0.1)',
          border:       '1px solid rgba(212,175,55,0.3)',
          color:        '#d4af37', fontSize: '11px',
          fontFamily:   'monospace', letterSpacing: '3px',
        }}
      >
        <span style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: '#32d583',
          boxShadow: '0 0 6px #32d583',
          display: 'inline-block',
          animation: 'pulse 2s infinite',
        }} />
        LIVE ON 0G TESTNET
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{
          fontFamily:  'Orbitron, monospace',
          fontSize:    'clamp(32px, 6vw, 56px)',
          fontWeight:  700, lineHeight: 1.2,
          marginBottom:'16px', letterSpacing: '2px',
        }}
      >
        <span style={{ color: '#f5f7fa' }}>PROVE </span>
        <span style={{
          background: 'linear-gradient(135deg, #d4af37, #f0d36b)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          AI ORIGIN.
        </span>
        <br />
        <span style={{ color: '#f5f7fa' }}>VERIFY </span>
        <span style={{ color: '#5fd1ff' }}>AUTHENTICITY.</span>
      </motion.h1>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          color:       '#8fa3bf', fontSize: '15px',
          maxWidth:    '520px', marginBottom: '36px',
          lineHeight:  1.7, fontFamily: 'Inter, sans-serif',
        }}
      >
        Cryptographic birth certificates for AI-generated content —
        powered by TEE attestation, 0G Storage, and on-chain provenance.
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ display: 'flex', gap: '12px', flexWrap: 'wrap',
                 justifyContent: 'center', marginBottom: '56px' }}
      >
        <button
          onClick={onGetStarted}
          style={{
            padding:     '12px 28px', borderRadius: '8px',
            fontFamily:  'Orbitron, monospace', fontSize: '12px',
            fontWeight:  700, letterSpacing: '2px',
            background:  'linear-gradient(135deg, #d4af37, #b8961e)',
            color:       '#09131f', border: 'none', cursor: 'pointer',
            boxShadow:   '0 0 24px rgba(212,175,55,0.3)',
            transition:  'box-shadow 0.2s',
          }}
        >
          GENERATE + ATTEST
        </button>
        <button
          onClick={onGetStarted}
          style={{
            padding:    '12px 28px', borderRadius: '8px',
            fontFamily: 'Orbitron, monospace', fontSize: '12px',
            fontWeight: 700, letterSpacing: '2px',
            background: 'transparent',
            border:     '1px solid rgba(95,209,255,0.4)',
            color:      '#5fd1ff', cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          VERIFY CONTENT
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        style={{
          display:       'flex', gap: '40px',
          flexWrap:      'wrap', justifyContent: 'center',
        }}
      >
        {[
          { icon: Shield,   label: 'TEE Attested',     value: '100%',  color: '#d4af37' },
          { icon: Cpu,      label: '0G Chain Records', value: 'LIVE',  color: '#5fd1ff' },
          { icon: Database, label: 'Storage Proofs',   value: '0G',    color: '#32d583' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={{
            display:       'flex', flexDirection: 'column',
            alignItems:    'center', gap: '6px',
          }}>
            <div style={{
              display:        'flex', alignItems: 'center',
              gap:            '6px',
            }}>
              <Icon size={14} color={color} />
              <span style={{
                fontFamily: 'Orbitron, monospace',
                fontSize:   '18px', fontWeight: 700, color,
              }}>
                {value}
              </span>
            </div>
            <span style={{
              fontSize:    '10px', color: '#8fa3bf',
              letterSpacing: '2px', fontFamily: 'monospace',
            }}>
              {label}
            </span>
          </div>
        ))}
      </motion.div>

    </section>
  );
}