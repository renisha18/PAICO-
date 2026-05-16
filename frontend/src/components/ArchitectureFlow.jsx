import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Hash, Lock, Database, Link, ChevronRight } from 'lucide-react';

const STEPS = [
  {
    icon: Cpu,
    label: 'AI INFERENCE',
    desc: 'Text or image generated via 0G Compute',
    color: '#d4af37',
  },
  {
    icon: Hash,
    label: 'SHA-256 HASH',
    desc: 'Tamper-proof content fingerprint',
    color: '#60a5fa',
  },
  {
    icon: Lock,
    label: 'TEE ATTESTATION',
    desc: 'Hardware-signed provenance certificate',
    color: '#d4af37',
  },
  {
    icon: Database,
    label: '0G STORAGE',
    desc: 'Content and certificate stored permanently',
    color: '#60a5fa',
  },
  {
    icon: Link,
    label: '0G CHAIN MINT',
    desc: 'On-chain provenance NFT record',
    color: '#22c55e',
  },
];

export default function ArchitectureFlow() {
  return (
    <section style={{
      padding:   '48px 24px 64px',
      maxWidth:  '960px',
      margin:    '0 auto',
      textAlign: 'center',
    }}>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        style={{
          fontSize:      '10px',
          letterSpacing: '4px',
          color:         '#94a3b8',
          fontFamily:    'JetBrains Mono, monospace',
          marginBottom:  '8px',
        }}
      >
        SYSTEM ARCHITECTURE
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.05 }}
        style={{
          fontFamily:    'Orbitron, monospace',
          fontSize:      'clamp(18px, 3vw, 24px)',
          fontWeight:    700,
          color:         '#f8fafc',
          letterSpacing: '2px',
          marginBottom:  '36px',
        }}
      >
        PROVENANCE PIPELINE
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          display:        'flex',
          flexWrap:       'wrap',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '8px',
        }}
      >
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <Fragment key={step.label}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.12 + i * 0.06 }}
                whileHover={{ y: -2 }}
                style={{
                  width:        '168px',
                  padding:      '20px 16px',
                  borderRadius: '12px',
                  background:   '#112240',
                  border:       '1px solid rgba(212, 175, 55, 0.15)',
                  textAlign:    'left',
                }}
              >
                <motion.div
                  animate={{ boxShadow: [
                    `0 0 0px ${step.color}00`,
                    `0 0 14px ${step.color}44`,
                    `0 0 0px ${step.color}00`,
                  ] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                  style={{
                    width:          '36px',
                    height:         '36px',
                    borderRadius:   '8px',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    marginBottom:   '12px',
                    background:     `${step.color}18`,
                    border:         `1px solid ${step.color}44`,
                  }}
                >
                  <Icon size={18} color={step.color} />
                </motion.div>
                <p style={{
                  fontFamily:    'Orbitron, monospace',
                  fontSize:      '10px',
                  fontWeight:    700,
                  letterSpacing: '1px',
                  color:         step.color,
                  marginBottom:  '6px',
                }}>
                  {step.label}
                </p>
                <p style={{
                  fontSize:   '11px',
                  color:      '#94a3b8',
                  lineHeight: 1.5,
                  fontFamily: 'Inter, sans-serif',
                }}>
                  {step.desc}
                </p>
              </motion.div>

              {i < STEPS.length - 1 && (
                <ChevronRight
                  size={18}
                  style={{ color: 'rgba(212, 175, 55, 0.35)', flexShrink: 0 }}
                />
              )}
            </Fragment>
          );
        })}
      </motion.div>
    </section>
  );
}
