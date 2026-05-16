import { ethers } from 'ethers';
import dotenv     from 'dotenv';
import { hashString } from './hash.js';

dotenv.config();

let _teeWallet = null;

function getTeeWallet() {
  if (_teeWallet) return _teeWallet;

  const key = process.env.TEE_PRIVATE_KEY;
  if (!key)                  throw new Error('TEE_PRIVATE_KEY not set in backend/.env');
  if (!key.startsWith('0x')) throw new Error('TEE_PRIVATE_KEY must start with 0x');
  if (key.length !== 66)     throw new Error(`TEE_PRIVATE_KEY wrong length: ${key.length}`);

  _teeWallet = new ethers.Wallet(key);
  console.log('[tee] Wallet loaded:', _teeWallet.address);
  return _teeWallet;
}

export async function createAttestation({ contentHash, promptHash, modelId, contentType }) {
  const teeWallet = getTeeWallet();

  const payload = {
    contentHash,
    promptHash,
    modelId,
    teeAddress: teeWallet.address,
    timestamp:  Math.floor(Date.now() / 1000),
    version:    '1.0',
  };
  if (contentType) payload.contentType = contentType;

  // Sort keys for deterministic serialization
  const message   = JSON.stringify(payload, Object.keys(payload).sort());
  const signature = await teeWallet.signMessage(message);

  return {
    ...payload,
    message,
    signature,
    certificateHash: hashString(message + signature),
  };
}

export function getTeeAddress() {
  return getTeeWallet().address;
}