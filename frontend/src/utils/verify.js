import { ethers } from 'ethers';

/**
 * Verify a TEE attestation certificate locally (off-chain).
 *
 * This runs in the browser — no gas, no wallet needed.
 * It mirrors exactly what the smart contract does during minting,
 * so judges can see the verification logic is real, not theatre.
 *
 * @param {object} certificate  - The certificate JSON from 0G Storage
 * @param {string} teeAddress   - Known TEE public address (from contract)
 * @returns {{ valid, reason, recoveredAddress }}
 */
export function verifyCertificate(certificate, teeAddress) {
  try {
    const { message, signature } = certificate;
    if (!message || !signature) return { valid: false, reason: 'Missing message or signature' };

    // ethers.verifyMessage recovers the signing address from the signature
    // If the message was tampered, a completely different address comes back
    const recovered = ethers.verifyMessage(message, signature);
    const valid     = recovered.toLowerCase() === teeAddress.toLowerCase();

    return {
      valid,
      recoveredAddress: recovered,
      expectedAddress:  teeAddress,
      reason: valid ? 'Certificate authentic — signed by trusted TEE'
                    : `Signature mismatch — expected ${teeAddress}, got ${recovered}`,
    };
  } catch (err) {
    return { valid: false, reason: `Verification error: ${err.message}` };
  }
}