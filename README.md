```mermaid
flowchart TD
  U[USER] -->|Prompt / Upload / Verify Hash| FE[Frontend (React + Vite)]
  FE -->|Auth + Request| API[Backend API (Node.js + Express)]

  %% Generation paths
  API -->|Inference Request| INF[AI Inference
0G Router API
(Pollinations fallback)]
  INF -->|Generated Text / Image Bytes| HASH[Hashing Engine
SHA-256/Keccak256]

  %% Attestation
  HASH -->|contentHash| TEE[TEE Attestation Service
(quote + cert)]
  TEE -->|attestationCert + certHash| API

  %% Storage
  API -->|content + attestationCert| STOR[0G Storage
(Content Addressed)]
  STOR -->|storageRoot / CID| API

  %% On-chain provenance
  API -->|Mint Provenance Record
(contentHash, certHash, storageRoot,
model/provider, timestamp)| SC[Smart Contract
Provenance Registry (Solidity)]
  SC -->|txHash + provenanceId| CHAIN[0G Chain]
  CHAIN --> EXPL[0G Chain Explorer]

  %% UI proof card
  API -->|Provenance Payload| FE
  FE -->|Render ProvenanceCard + QR| U

  %% Verification loop
  U -->|Paste contentHash OR Scan QR| FE
  FE -->|Verify Request| VER[Verification Engine]
  VER -->|Read provenanceId by contentHash| SC
  VER -->|Fetch content + cert| STOR
  VER -->|Validate TEE cert + recompute hash| HASH
  VER -->|Result: VERIFIED or TAMPERED| FE
```

  %% Tampering detection
  HASH -->|Mismatch ⇒ TAMPERED| VER
