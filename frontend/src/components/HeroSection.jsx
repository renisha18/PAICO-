import { motion } from 'framer-motion';
import { Shield, Cpu, Link } from 'lucide-react';

export default function HeroSection({ onGetStarted }) {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center
                        justify-center text-center px-6 overflow-hidden">

      {/* Animated background grid */}
      <div className="absolute inset-0 pointer-events-none"
           style={{
             backgroundImage: `
               linear-gradient(rgba(95,209,255,0.03) 1px, transparent 1px),
               linear-gradient(90deg, rgba(95,209,255,0.03) 1px, transparent 1px)
             `,
             backgroundSize: '60px 60px',
           }}
      />

      {/* Gold radial glow behind headline */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-[600px] h-[300px] rounded-full pointer-events-none"
           style={{
             background: 'radial-gradient(ellipse, rgba(212,175,55,0.08) 0%, transparent 70%)'
           }}
      />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y:   0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full
                   text-xs font-mono tracking-widest"
        style={{
          background: 'rgba(212,175,55,0.1)',
          border:     '1px solid rgba(212,175,55,0.3)',
          color:      '#d4af37',
        }}
      >
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        LIVE ON 0G TESTNET
      </motion.div>

      {/* Main headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y:  0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-display text-4xl md:text-6xl font-bold mb-4
                   leading-tight tracking-wider"
      >
        <span className="text-white">PROVE </span>
        <span style={{
          background: 'linear-gradient(135deg, #d4af37, #f0d36b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          AI ORIGIN.
        </span>
        <br />
        <span className="text-white">VERIFY </span>
        <span style={{ color: '#5fd1ff' }}>AUTHENTICITY.</span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-muted text-lg max-w-xl mb-10 leading-relaxed"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        Cryptographic birth certificates for AI-generated content.
        Powered by TEE attestation, 0G Storage, and on-chain provenance.
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y:  0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex gap-4 flex-wrap justify-center mb-16"
      >
        <button
          onClick={onGetStarted}
          className="px-8 py-3 rounded-lg font-display text-sm font-bold
                     tracking-wider transition-all duration-200"
          style={{
            background:  'linear-gradient(135deg, #d4af37, #b8961e)',
            color:       '#09131f',
            boxShadow:   '0 0 24px rgba(212,175,55,0.3)',
          }}
          onMouseEnter={e => e.target.style.boxShadow = '0 0 36px rgba(212,175,55,0.5)'}
          onMouseLeave={e => e.target.style.boxShadow = '0 0 24px rgba(212,175,55,0.3)'}
        >
          GENERATE + ATTEST
        </button>
        <button
          onClick={onGetStarted}
          className="px-8 py-3 rounded-lg font-display text-sm font-bold
                     tracking-wider transition-all duration-200"
          style={{
            background: 'transparent',
            border:     '1px solid rgba(95,209,255,0.4)',
            color:      '#5fd1ff',
          }}
          onMouseEnter={e => e.target.style.background = 'rgba(95,209,255,0.08)'}
          onMouseLeave={e => e.target.style.background = 'transparent'}
        >
          VERIFY CONTENT
        </button>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex gap-8 flex-wrap justify-center"
      >
        {[
          { icon: Shield, label: 'TEE Attested',      value: '100%' },
          { icon: Cpu,    label: '0G Chain Records',  value: 'LIVE' },
          { icon: Link,   label: 'Storage Proofs',    value: '0G'   },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <Icon size={14} style={{ color: '#d4af37' }} />
              <span className="font-display text-xl font-bold"
                    style={{ color: '#d4af37' }}>
                {value}
              </span>
            </div>
            <span className="text-xs text-muted tracking-widest">{label}</span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}