import { ethers } from 'ethers';
import { hashString } from './hash.js';
import dotenv from 'dotenv';
dotenv.config();  // ← load .env at the top of THIS file too

let _teeWallet = null;

function getTeeWallet() {
  if (_teeWallet) return _teeWallet;

  const key = process.env.TEE_PRIVATE_KEY;

  // Clear error message so you know exactly what went wrong
  if (!key)            throw new Error('TEE_PRIVATE_KEY is not set in backend/.env');
  if (!key.startsWith('0x')) throw new Error('TEE_PRIVATE_KEY must start with 0x');
  if (key.length !== 66)     throw new Error(`TEE_PRIVATE_KEY wrong length: got ${key.length}, need 66`);

  _teeWallet = new ethers.Wallet(key);
  return _teeWallet;
}

export async function createAttestation({ contentHash, promptHash, modelId }) {
  const teeWallet = getTeeWallet();  // ← get wallet here, not at import time

  const payload = {
    contentHash,
    promptHash,
    modelId,
    teeAddress: teeWallet.address,
    timestamp:  Math.floor(Date.now() / 1000),
    version:    '1.0',
  };

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