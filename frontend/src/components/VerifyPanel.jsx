import { useState }         from 'react';
import { hashFile }         from '../utils/hash.js';
import { verifyCertificate } from '../utils/verify.js';
import { useContract }      from '../hooks/useContract.js';

const BACKEND  = import.meta.env.VITE_BACKEND_URL;
const EXPLORER = import.meta.env.VITE_OG_EXPLORER;

// TEE's known public address — must match what's in the smart contract
const TEE_ADDRESS = import.meta.env.VITE_TEE_ADDRESS;

export default function VerifyPanel({ initialHash }) {
  const [hashInput, setHashInput]   = useState(initialHash || '');
  const [fileResult, setFileResult] = useState(null);
  const [chainRecord, setChainRecord] = useState(null);
  const [certVerify,  setCertVerify]  = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error,   setError]         = useState(null);

  const { lookup } = useContract();

  // Hash a file the user uploads — for the tamper-detection demo
  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const h = await hashFile(file);
    setHashInput(h);
    setFileResult({ name: file.name, hash: h });
  }

  async function handleVerify() {
    if (!hashInput.trim()) return;
    setLoading(true); setError(null);
    setChainRecord(null); setCertVerify(null);

    try {
      // Step 1: look up hash on-chain
      const record = await lookup(hashInput);
      setChainRecord(record);

      if (!record.timestamp) {
        setError('Hash not found on chain — content unregistered or tampered');
        return;
      }

      // Step 2: fetch certificate from 0G Storage and verify ECDSA sig
      const certRes  = await fetch(
        `https://indexer-storage-testnet-standard.0g.ai/file?root=${record.storageRoot}`
      );
      const certJson = await certRes.json();
      const result   = verifyCertificate(certJson, TEE_ADDRESS);
      setCertVerify(result);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const isVerified = chainRecord?.timestamp && certVerify?.valid;

  return (
    <div className="space-y-4">

      {/* File upload — for tamper demo */}
      <div className="cyber-card p-4">
        <p className="text-xs text-[#999] tracking-widest mb-3">
          VERIFY FILE — upload any image or text file to check authenticity
        </p>
        <label className="block border border-dashed border-[#333] rounded p-4
                          text-center cursor-pointer hover:border-accent transition-colors">
          <span className="text-sm text-[#666]">Drop file or click to upload</span>
          <input type="file" className="hidden" onChange={handleFileUpload} />
        </label>
        {fileResult && (
          <p className="text-xs text-accent mt-2 font-mono break-all">
            {fileResult.name} → {fileResult.hash}
          </p>
        )}
      </div>

      {/* Manual hash input */}
      <div className="cyber-card p-4">
        <p className="text-xs text-[#999] tracking-widest mb-2">OR ENTER CONTENT HASH</p>
        <input
          value={hashInput}
          onChange={e => setHashInput(e.target.value)}
          placeholder="SHA-256 hex string (64 chars)…"
          className="w-full bg-transparent border border-[#222] rounded p-3
                     font-mono text-sm text-white placeholder-[#444]
                     focus:outline-none focus:border-accent"
        />
        <button
          onClick={handleVerify}
          disabled={loading || !hashInput.trim()}
          className="mt-3 w-full py-2 rounded font-mono text-sm font-bold
                     border border-accent2 text-accent2
                     hover:bg-accent2 hover:text-black transition-colors
                     disabled:opacity-30"
        >
          {loading ? 'VERIFYING…' : 'VERIFY AUTHENTICITY'}
        </button>
      </div>

      {error && (
        <div className="cyber-card p-4 border border-red-900">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-red-400 text-lg">✗</span>
            <span className="text-red-400 font-bold text-sm">TAMPERED OR UNREGISTERED</span>
          </div>
          <p className="text-red-300 text-xs">{error}</p>
        </div>
      )}

      {/* Verification result */}
      {chainRecord?.timestamp && (
        <div className={`cyber-card p-4 space-y-3 border ${
          isVerified ? 'border-accent' : 'border-red-800'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`text-2xl ${isVerified ? 'text-accent' : 'text-red-400'}`}>
              {isVerified ? '✓' : '✗'}
            </span>
            <div>
              <p className={`font-bold text-sm ${isVerified ? 'text-accent glow' : 'text-red-400'}`}>
                {isVerified ? 'AUTHENTIC — VERIFIED ORIGIN' : 'VERIFICATION FAILED'}
              </p>
              <p className="text-xs text-[#999]">{certVerify?.reason}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs border-t border-[#222] pt-3">
            {[
              { label: 'MODEL',     value: chainRecord.modelId },
              { label: 'CREATOR',   value: `${chainRecord.creator?.slice(0,10)}…` },
              { label: 'MINTED',    value: new Date(chainRecord.timestamp * 1000).toLocaleString() },
              { label: 'TEE VERIFIED', value: chainRecord.verified ? 'YES' : 'NO' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[#999]">{label}</p>
                <p className="text-white">{value}</p>
              </div>
            ))}
          </div>

          <a
            href={`${EXPLORER}/token/${import.meta.env.VITE_CONTRACT_ADDRESS}`}
            target="_blank" rel="noreferrer"
            className="text-xs text-[#999] hover:text-accent transition-colors"
          >
            VIEW CONTRACT ON 0G EXPLORER ↗
          </a>
        </div>
      )}
    </div>
  );
}