const EXPLORER = import.meta.env.VITE_OG_EXPLORER;

export default function ProvenanceCard({ result, txHash, tokenId }) {
  const { content, certificate, mintParams } = result;

  function copyHash() {
    navigator.clipboard.writeText(mintParams.contentHash);
  }

  return ( 
    <div className="cyber-card p-4 space-y-4 glow-border">
      <div className="flex items-center justify-between">
        <span className="text-accent text-sm font-bold tracking-widest glow">
          PROVENANCE MINTED
        </span>
        <span className="text-[#999] text-xs">Token #{tokenId}</span>
      </div>

      {/* Generated content */}
      <div className="bg-[#0d0d0d] rounded p-3">
        <p className="text-xs text-[#999] mb-1 tracking-widest">GENERATED OUTPUT</p>
        <p className="text-sm text-white leading-relaxed">{content.text}</p>
      </div>

      {/* Hashes */}
      <div className="space-y-2">
        {[
          { label: 'CONTENT HASH',     value: mintParams.contentHash },
          { label: 'CERTIFICATE HASH', value: mintParams.certificateHash },
          { label: 'STORAGE ROOT',     value: mintParams.storageRoot },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs text-[#999] tracking-widest">{label}</p>
            <p className="font-mono text-xs text-accent break-all">{value}</p>
          </div>
        ))}
      </div>

      {/* Certificate metadata */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-[#999]">MODEL</p>
          <p className="text-white">{certificate.modelId}</p>
        </div>
        <div>
          <p className="text-[#999]">TIMESTAMP</p>
          <p className="text-white">
            {new Date(certificate.timestamp * 1000).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[#999]">TEE SIGNER</p>
          <p className="text-accent">{certificate.teeAddress?.slice(0,10)}…</p>
        </div>
        <div>
          <p className="text-[#999]">STATUS</p>
          <p className="text-accent">VERIFIED ✓</p>
        </div>
      </div>

      {/* Action links */}
      <div className="flex gap-3 flex-wrap">
        <a
          href={`${EXPLORER}/tx/${txHash}`}
          target="_blank" rel="noreferrer"
          className="text-xs border border-[#333] text-[#999] px-3 py-1 rounded
                     hover:border-accent hover:text-accent transition-colors"
        >
          VIEW ON 0G EXPLORER ↗
        </a>
       <a 
          href={content.storageUrl}
          target="_blank" rel="noreferrer"
          className="text-xs border border-[#333] text-[#999] px-3 py-1 rounded
                     hover:border-accent2 hover:text-accent2 transition-colors"
        >
          VIEW ON 0G STORAGE ↗
        </a>
        <button
          onClick={copyHash}
          className="text-xs border border-[#333] text-[#999] px-3 py-1 rounded
                     hover:border-white hover:text-white transition-colors"
        >
          COPY HASH
        </button>
      </div>

      {/* Verify deep link */}
      <div className="border-t border-[#222] pt-3">
        <p className="text-xs text-[#999] mb-1">VERIFY THIS CONTENT</p>
        <p className="font-mono text-xs text-[#555] break-all">
          {window.location.origin}/verify/{mintParams.contentHash}
        </p>
      </div>
    </div>
  );
}