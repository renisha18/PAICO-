

=======
# PAICO — Proof-Attested AI Content Origin

**Cryptographic birth certificates for AI-generated text and images — powered by TEE attestation, 0G Storage, and on-chain provenance.**

**Live contract:** [`0x2dd4B557b4500315c1C52AC0f204381569496433`](https://chainscan-galileo.0g.ai/address/0x2dd4B557b4500315c1C52AC0f204381569496433) on 0G Galileo Testnet

---

## What is PAICO?

AI tools can produce text, images, audio, and video at scale — but consumers, platforms, and rights holders have almost no reliable way to answer a simple question: *was this created by AI, and if so, by whom and when?* Watermarks are fragile, metadata is stripped, and screenshots break any file-level proof.

PAICO (**Proof-Attested AI Content Origin**) attaches a **cryptographic birth certificate** to every piece of generated content. When a creator runs a prompt through PAICO, the system:

1. Generates content via **0G Compute** (text or image).
2. Computes a **SHA-256** fingerprint of the raw bytes.
3. Signs an **ECDSA attestation** with a dedicated TEE key (model ID + timestamp + hash).
4. Stores the content and certificate on **0G Storage**.
5. Mints an **ERC-721 provenance NFT** on **0G Chain** that permanently links the hash, storage root, and creator wallet.

Anyone can later **verify** a file: re-hash it, fetch the certificate from storage, validate the TEE signature locally, and confirm an on-chain record exists. Tampering changes the hash; forged certificates fail signature verification; missing chain records fail the authenticity score.

This matters for **deepfake detection**, **newsroom provenance**, **AI IP disputes**, and **platform trust & safety** — without requiring users to trust a central database.

---

## How It Works

```
User Prompt
     │
     ▼
┌─────────────────────────────┐
│   0G Compute (TEE)          │
│   AI Inference inside       │
│   Trusted Execution Env     │
└──────────┬──────────────────┘
           │
           ▼
SHA-256(content) → contentHash
           │
           ▼
ECDSA.sign(contentHash + modelId + timestamp)
→ attestation certificate
           │
           ▼
┌─────────────────────────────┐
│   0G Storage                │
│   content + certificate     │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│   0G Chain (EVM)            │
│   PAICORegistry.sol         │
│   mintProvenance(...)       │
└──────────┬──────────────────┘
           │
           ▼
Public Verification
Anyone can verify: hash match + TEE sig + chain record
```

**End-to-end flow (demo path):**

| Step | Component | What happens |
|------|-----------|--------------|
| 1 | Frontend | User connects MetaMask on 0G testnet, enters prompt |
| 2 | Backend `/api/generate` or `/api/generate-image` | Inference + hash + TEE sign + 0G upload |
| 3 | Frontend | Calls `mintProvenance()` on `PAICORegistry` |
| 4 | 0G Chain | NFT minted; `ProvenanceMinted` event emitted |
| 5 | Verify tab | Upload file or open `/verify/:hash` — score + timeline |

---

## 0G Integration

| Component | Usage | Status |
|-----------|--------|--------|
| **0G Chain** | `PAICORegistry.sol` — immutable provenance registry (ERC-721) | ✅ Live on Galileo testnet |
| **0G Storage** | Persists generated content + attestation JSON; `tokenURI` points to indexer | ✅ Live |
| **0G Compute** | Text inference (`qwen/qwen-2.5-7b-instruct`) and image generation via router API | ✅ Live |

**Network details**

| Field | Value |
|-------|--------|
| Chain | 0G Galileo Testnet |
| Chain ID | `16602` |
| RPC | `https://evmrpc-testnet.0g.ai` |
| Explorer | [https://chainscan-galileo.0g.ai](https://chainscan-galileo.0g.ai) |
| Storage indexer | `https://indexer-storage-testnet-standard.0g.ai` |

---

## Features

- ✅ **Text generation** — prompt → attest → mint full pipeline
- ✅ **Image generation** — TEXT / IMAGE tabs; 0G Compute router + Pollinations fallback
- ✅ **TEE attestation** — ECDSA-signed certificates bound to content hash + model + timestamp
- ✅ **0G Storage upload** — content and certificate stored with retrievable root
- ✅ **On-chain mint** — `mintProvenance()` with in-contract TEE signature verification
- ✅ **Provenance card** — hashes, metadata, explorer link, copy-to-clipboard
- ✅ **Provenance timeline** — animated step events with timestamps
- ✅ **Verify by hash or file** — authenticity score (0–100), check breakdown
- ✅ **Tamper comparison** — side-by-side original vs uploaded (text + image)
- ✅ **QR verify link** — shareable `/verify/:contentHash` URL
- ✅ **Recent activity** — last 5 `ProvenanceMinted` events from chain
- ✅ **Wallet connect** — MetaMask, auto network switch / add 0G testnet

---

## Smart Contract

| | |
|---|---|
| **Contract** | `PAICORegistry` |
| **Address** | `0x2dd4B557b4500315c1C52AC0f204381569496433` |
| **Explorer** | [View on 0G Chainscan](https://chainscan-galileo.0g.ai/address/0x2dd4B557b4500315c1C52AC0f204381569496433) |
| **TEE signer (immutable)** | `0xe7ABc4739eC36111614501810eF2e8225C7032dD` |
| **Standard** | ERC-721 (`PAICO` / `PAICO Provenance`) |

### Key functions

```solidity
function mintProvenance(
    string contentHash,
    string certificateHash,
    string storageRoot,
    string modelId,
    string attestationMsg,
    bytes signature
) external returns (uint256 tokenId);

function getRecordByHash(string contentHash)
    external view returns (ProvenanceRecord memory);
```

### Key events

```solidity
event ProvenanceMinted(
    uint256 indexed tokenId,
    string  contentHash,
    address indexed creator,
    string  modelId,
    uint256 timestamp
);
```

On-chain mint **reverts** if the TEE signature is invalid or the content hash is already registered.

---

## Tech Stack

| Frontend | Backend |
|----------|---------|
| React 19 + Vite 8 | Node.js + Express |
| Framer Motion | ethers.js v6 |
| ethers.js v6 | @0glabs/0g-ts-sdk |
| Tailwind CSS 3 + inline design tokens | 0G Compute / Storage APIs |
| lucide-react, qrcode.react | ECDSA TEE signing (`tee.js`) |
| MetaMask wallet integration | Image providers: 0G router, Pollinations |

| Contracts |
|-----------|
| Solidity 0.8.20, Hardhat, OpenZeppelin ERC-721 |

---

## Project Structure

```
hackathon/
├── frontend/          # React SPA (generate, verify, landing)
├── backend/           # Express API — inference, attest, upload
├── contracts/         # PAICORegistry.sol + Hardhat deploy
└── README.md          # ← you are here
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- MetaMask
- 0G testnet ETH (for minting)
- API keys: 0G Compute router key (text + image); optional Replicate if using that provider

### 1. Clone and install

```bash
git clone <your-repo-url>
cd hackathon

cd contracts && npm install
cd ../backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment

Copy and fill in secrets (see tables below). **Never commit real private keys.**

**`contracts/.env`** (for deploy):

```env
OG_RPC_URL=https://evmrpc-testnet.0g.ai
DEPLOYER_PRIVATE_KEY=0x...
TEE_SIGNER_ADDRESS=0xe7ABc4739eC36111614501810eF2e8225C7032dD
```

**`backend/.env`** — see [Backend variables](#backend-environment-variables).

**`frontend/.env`** — see [Frontend variables](#frontend-environment-variables).

Use the **same** `CONTRACT_ADDRESS` / `VITE_CONTRACT_ADDRESS` and matching TEE keys after deploy.

### 3. Deploy contract

```bash
cd contracts
npx hardhat run scripts/deploy.js --network 0g-testnet
```

Paste the printed address into `backend/.env` and `frontend/.env`.

### 4. Run backend

```bash
cd backend
npm run dev
# listens on http://localhost:3001
```

Health check: `GET http://localhost:3001/health`

### 5. Run frontend

```bash
cd frontend
npm run dev
# default http://localhost:5173
```

Connect wallet → **GENERATE** tab → enter prompt → **GENERATE + ATTEST** → approve MetaMask mint.

---

## Environment Variables

### Backend environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | HTTP port (default `3001`) |
| `TEE_PRIVATE_KEY` | Yes | Private key used to sign attestations (must match on-chain `TEE_SIGNER`) |
| `OG_RPC_URL` | Yes | 0G testnet JSON-RPC URL |
| `OG_INDEXER_URL` | Yes | 0G Storage indexer base URL |
| `CONTRACT_ADDRESS` | Yes | Deployed `PAICORegistry` address |
| `OG_COMPUTE_URL` | Yes | 0G Compute router API base URL |
| `OG_COMPUTE_KEY` | Yes | Bearer token for Compute router |
| `OG_COMPUTE_MODEL` | No | Text model ID (default project: `qwen/qwen-2.5-7b-instruct`) |
| `IMAGE_PROVIDER` | No | `0g-router`, `pollinations`, `replicate`, or `together` |
| `IMAGE_MODEL` | No | Image model name for selected provider |
| `POLLINATIONS_FALLBACK` | No | `true` to fall back if 0G image generation fails |
| `REPLICATE_API_KEY` | If using Replicate | Replicate API token |
| `TOGETHER_API_KEY` | If using Together | Together AI API key |

### Frontend environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_BACKEND_URL` | Yes | Backend origin (e.g. `http://localhost:3001`) |
| `VITE_CONTRACT_ADDRESS` | Yes | `PAICORegistry` address |
| `VITE_TEE_ADDRESS` | Yes | TEE public address (for local signature verification) |
| `VITE_OG_RPC_URL` | Yes | RPC URL for reads / event queries |
| `VITE_OG_EXPLORER` | Yes | Block explorer base URL |
| `VITE_CHAIN_ID` | Yes | EVM chain ID (`16602` for Galileo testnet) |

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service health + config presence |
| `POST` | `/api/generate` | Text: infer → hash → attest → upload → return mint params |
| `POST` | `/api/generate-image` | Image: same pipeline for image bytes |
| `POST` | `/api/upload` | Standalone upload helper |

---

## Security Notes

- **TEE attestation** — Certificates are ECDSA-signed; the smart contract recovers the signer and requires it to match the immutable `TEE_SIGNER` set at deploy time. Forged certificates cannot mint.
- **SHA-256 hashing** — Any byte-level change to content produces a different hash; verification detects tampering deterministically.
- **Private keys** — `TEE_PRIVATE_KEY` and deployer keys exist only on the backend/deployer environment, never in the browser bundle.
- **On-chain immutability** — Once minted, provenance records and NFT ownership history live on 0G Chain; duplicate hashes are rejected.
- **Ethereum signed message prefix** — Signatures use the standard `\x19Ethereum Signed Message:\n` format to prevent replay as raw transactions.

---

## Verification & Authenticity Score

| Check | Weight | Pass condition |
|-------|--------|----------------|
| TEE attestation | 40 pts | Local ECDSA verify against `VITE_TEE_ADDRESS` |
| On-chain record | 30 pts | `getRecordByHash` returns non-zero timestamp |
| 0G Storage | 20 pts | Certificate retrievable from indexer |
| Hash match | 10 pts | Uploaded file hash equals registered `contentHash` |

Public verify URL pattern: `https://<your-host>/verify/<contentHash>`

---

## Roadmap

- [ ] **0G Compute sealed inference** — hardware-enclave attestation when API is available
- [ ] **Provenance lineage** — parent → child content graph for edits and remixes
- [ ] **Public explorer** — `/explore` feed of recent attestations and models
- [ ] **Batch verification API** — enterprise bulk-check endpoint
- [ ] **Mainnet deployment** — production registry + storage roots

---

## Team

| Name | Role | Contact |
|------|------|---------|
| _Your Name_ | _Role_ | _email / telegram_ |
| _Teammate_ | _Role_ | _contact_ |

---

## License

MIT — see repository license file if present.

---

**PAICO — 0G APAC Hackathon 2026 · Track 5 — Privacy & Sovereign Infrastructure**

*Powered by 0G Storage · 0G Chain · 0G Compute · TEE attestation*

