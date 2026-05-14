import { useState }      from 'react';
import { useContract }   from '../hooks/useContract.js';
import ProvenanceCard    from './ProvenanceCard.jsx';

const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default function GeneratePanel({ signer }) {
  const [prompt,  setPrompt]  = useState('');
  const [loading, setLoading] = useState(false);
  const [step,    setStep]    = useState(''); // progress label
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);

  const { mint, status, txHash, tokenId } = useContract();

  async function handleGenerate() {
    if (!prompt.trim() || !signer) return;
    setLoading(true); setError(null); setResult(null);

    try {
      // Step 1 — request generation from backend
      setStep('Sending to 0G Compute TEE…');
      const genRes = await fetch(`${BACKEND}/api/generate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ prompt }),
      });
      if (!genRes.ok) throw new Error((await genRes.json()).error);
      const data = await genRes.json();

      // Step 2 — mint on-chain
      setStep('Minting provenance record on 0G Chain…');
      const { txHash: tx } = await mint(signer, data.mintParams);

      setResult({ ...data, txHash: tx });
      setStep('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Prompt input */}
      <div className="cyber-card p-4">
        <label className="block text-xs text-[#999] mb-2 tracking-widest">
          PROMPT
        </label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Describe what you want the AI to generate…"
          rows={3}
          className="w-full bg-transparent text-white placeholder-[#444]
                     border border-[#222] rounded p-3 text-sm font-mono
                     focus:outline-none focus:border-accent resize-none"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !signer || !prompt.trim()}
          className="mt-3 w-full py-2 rounded font-mono text-sm
                     bg-accent text-black font-bold
                     disabled:opacity-30 disabled:cursor-not-allowed
                     hover:shadow-[0_0_16px_rgba(0,255,153,0.4)] transition"
        >
          {loading ? step || 'WORKING…' : 'GENERATE + ATTEST'}
        </button>
      </div>

      {/* Status pipeline */}
      {loading && (
        <div className="cyber-card p-4 space-y-2">
          {[
            '0G Compute TEE inference',
            'SHA-256 content hashing',
            'TEE attestation signing',
            '0G Storage upload',
            'On-chain mint',
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-[#999]">
              <span className="status-dot bg-accent animate-pulse"></span>
              {s}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="cyber-card p-4 border-red-800">
          <p className="text-red-400 text-sm font-mono">{error}</p>
        </div>
      )}

      {result && <ProvenanceCard result={result} txHash={txHash} tokenId={tokenId} />}
    </div>
  );
}