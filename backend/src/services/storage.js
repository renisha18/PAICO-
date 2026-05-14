import { ZgFile, Indexer } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';
import { writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join }   from 'node:path';
import { hashBuffer } from './hash.js';

const provider = new ethers.JsonRpcProvider(process.env.OG_RPC_URL);
const signer   = new ethers.Wallet(process.env.TEE_PRIVATE_KEY, provider);
const indexer  = new Indexer(process.env.OG_INDEXER_URL);

/**
 * Upload a Buffer to 0G Storage.
 * Returns the content root — a hash-like identifier for the stored file.
 * This root is what goes into your smart contract and tokenURI.
 */
export async function uploadToStorage(buffer, filename) {
  // 0G SDK works with files on disk — write to tmp, upload, clean up
  const tmpPath = join(tmpdir(), `paico_${Date.now()}_${filename}`);

  try {
    writeFileSync(tmpPath, buffer);

    const zgFile = await ZgFile.fromFilePath(tmpPath);
    const [tree, err] = await zgFile.merkleTree();
    if (err) throw new Error(`Merkle tree error: ${err}`);

    const root = tree.rootHash();

    // upload() returns a transaction — wait for it to confirm
    const [tx, uploadErr] = await indexer.upload(zgFile, 0, signer);
    if (uploadErr) throw new Error(`Upload error: ${uploadErr}`);

    await tx.wait();

    return {
      root,
      url: `${process.env.OG_INDEXER_URL}/file?root=${root}`,
    };
  } finally {
    // Always clean up tmp file
    try { unlinkSync(tmpPath); } catch (_) {}
  }
}