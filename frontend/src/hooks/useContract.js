import { useState, useCallback } from 'react';
import { ethers }                from 'ethers';

// Minimal ABI — only the functions we actually call
const REGISTRY_ABI = [
  'function mintProvenance(string,string,string,string,string,bytes) returns (uint256)',
  'function getRecordByHash(string) view returns (tuple(string,string,string,string,uint256,address,bool))',
  'event ProvenanceMinted(uint256 indexed,string,address indexed,string,uint256)',
];

export function useContract() {
  const [status, setStatus] = useState('idle');
  const [txHash, setTxHash] = useState(null);
  const [tokenId, setTokenId] = useState(null);

  const mint = useCallback(async (signer, mintParams) => {
    setStatus('minting');
    try {
      const contract = new ethers.Contract(
        import.meta.env.VITE_CONTRACT_ADDRESS,
        REGISTRY_ABI,
        signer
      );

      const tx = await contract.mintProvenance(
        mintParams.contentHash,
        mintParams.certificateHash,
        mintParams.storageRoot,
        mintParams.modelId,
        mintParams.attestationMsg,
        mintParams.signature
      );

      setTxHash(tx.hash);
      setStatus('confirming');

      const receipt = await tx.wait();

      // Extract tokenId from the ProvenanceMinted event
      const event = receipt.logs
        .map(log => { try { return contract.interface.parseLog(log); } catch { return null; } })
        .find(e => e?.name === 'ProvenanceMinted');

      if (event) setTokenId(event.args[0].toString());

      setStatus('done');
      return { txHash: tx.hash, receipt };

    } catch (err) {
      setStatus('error');
      throw err;
    }
  }, []);

  const lookup = useCallback(async (contentHash) => {
    const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_OG_RPC_URL);
    const contract = new ethers.Contract(
      import.meta.env.VITE_CONTRACT_ADDRESS,
      REGISTRY_ABI,
      provider
    );
    const record = await contract.getRecordByHash(contentHash);
    // record is a tuple — map to named fields
    return {
      contentHash:     record[0],
      certificateHash: record[1],
      storageRoot:     record[2],
      modelId:         record[3],
      timestamp:       Number(record[4]),
      creator:         record[5],
      verified:        record[6],
    };
  }, []);

  return { mint, lookup, status, txHash, tokenId };
}
