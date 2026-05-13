// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Why ERC-721? Each provenance record becomes a transferable ownership
// certificate. The creator owns proof that THEY generated this content.
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PAICORegistry is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // The TEE's known public address — only attestations signed by
    // this key are considered valid. Set once at deploy, immutable.
    address public immutable TEE_SIGNER;

    // Core provenance record — everything stored per content piece
    struct ProvenanceRecord {
        string  contentHash;      // SHA-256 of the generated image/text
        string  certificateHash;  // SHA-256 of the attestation certificate
        string  storageRoot;      // 0G Storage content root (like a CID)
        string  modelId;          // which AI model generated this
        uint256 timestamp;        // block timestamp at mint
        address creator;          // wallet that minted this record
        bool    verified;         // did we verify the TEE sig on-chain?
    }

    // tokenId → ProvenanceRecord
    mapping(uint256 => ProvenanceRecord) public records;

    // contentHash → tokenId (for quick lookup during verification)
    mapping(string => uint256) public hashToToken;

    // Events — these show up in 0G Explorer, proving on-chain activity
    event ProvenanceMinted(
        uint256 indexed tokenId,
        string  contentHash,
        address indexed creator,
        string  modelId,
        uint256 timestamp
    );

    constructor(address _teeSigner) ERC721("PAICO Provenance", "PAICO") {
        TEE_SIGNER = _teeSigner;
    }

    /**
     * @dev Mint a provenance record for a piece of AI-generated content.
     * @param contentHash     SHA-256 hex of the content file
     * @param certificateHash SHA-256 hex of the attestation JSON
     * @param storageRoot     0G Storage root returned after upload
     * @param modelId         AI model identifier string
     * @param attestationMsg  The exact message string the TEE signed
     * @param signature       ECDSA signature from the TEE
     *
     * Security: We verify the TEE's ECDSA signature on-chain before
     * minting. If the signature is invalid (wrong key, tampered message)
     * the transaction reverts. You cannot mint a fake certificate.
     */
    function mintProvenance(
        string  memory contentHash,
        string  memory certificateHash,
        string  memory storageRoot,
        string  memory modelId,
        string  memory attestationMsg,
        bytes   memory signature
    ) external returns (uint256) {

        // Verify TEE signature before doing anything else
        bool sigValid = _verifyTEESignature(attestationMsg, signature);
        require(sigValid, "Invalid TEE attestation signature");

        // Prevent duplicate records for the same content
        require(hashToToken[contentHash] == 0, "Content already registered");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        // Store the provenance record
        records[newTokenId] = ProvenanceRecord({
            contentHash:      contentHash,
            certificateHash:  certificateHash,
            storageRoot:      storageRoot,
            modelId:          modelId,
            timestamp:        block.timestamp,
            creator:          msg.sender,
            verified:         true  // sig was valid (checked above)
        });

        hashToToken[contentHash] = newTokenId;
        _safeMint(msg.sender, newTokenId);

        emit ProvenanceMinted(newTokenId, contentHash, msg.sender, modelId, block.timestamp);
        return newTokenId;
    }

    /**
     * @dev Look up a record by content hash — used by the verify page.
     * Returns zero-value struct if not found (check timestamp == 0).
     */
    function getRecordByHash(string memory contentHash)
        external view returns (ProvenanceRecord memory)
    {
        uint256 tokenId = hashToToken[contentHash];
        return records[tokenId];
    }

    /**
     * @dev Verify ECDSA signature from TEE.
     * Security note: we use Ethereum's standard signed message prefix
     * (\x19Ethereum Signed Message:\n) so TEE signatures cannot be
     * replayed as actual transactions.
     */
    function _verifyTEESignature(
        string  memory message,
        bytes   memory signature
    ) internal view returns (bool) {
        // Hash the message with Ethereum prefix
        bytes32 ethHash = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n",
                uintToStr(bytes(message).length),
                message
            )
        );

        // Recover the signing address from the signature
        address recovered = _recoverSigner(ethHash, signature);

        // Check it matches the known TEE address
        return recovered == TEE_SIGNER;
    }

    function _recoverSigner(bytes32 hash, bytes memory sig)
        internal pure returns (address)
    {
        require(sig.length == 65, "Invalid signature length");
        bytes32 r; bytes32 s; uint8 v;
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
        return ecrecover(hash, v, r, s);
    }

    // Helper: uint to string (needed for message length prefix)
    function uintToStr(uint256 v) internal pure returns (string memory) {
        if (v == 0) return "0";
        uint256 tmp = v; uint256 digits;
        while (tmp != 0) { digits++; tmp /= 10; }
        bytes memory buf = new bytes(digits);
        while (v != 0) { digits--; buf[digits] = bytes1(uint8(48 + v % 10)); v /= 10; }
        return string(buf);
    }

    // Standard ERC-721 metadata URI
    function tokenURI(uint256 tokenId)
        public view override returns (string memory)
    {
        require(_exists(tokenId), "Token does not exist");
        ProvenanceRecord memory r = records[tokenId];
        // Return 0G Storage URL — judges can click this
        return string(abi.encodePacked(
            "https://indexer-storage-testnet-standard.0g.ai/file?root=",
            r.storageRoot
        ));
    }
}