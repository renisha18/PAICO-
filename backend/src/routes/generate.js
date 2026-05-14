import { Router } from 'express';
import { hashBuffer, hashString } from '../services/hash.js';
import { createAttestation }      from '../services/tee.js';
import { uploadToStorage }        from '../services/storage.js';

const router = Router();

/**
 * POST /api/generate
 * Body: { prompt: string }
 *
 * Flow:
 * 1. Call 0G Compute with the prompt
 * 2. Hash the result
 * 3. Create TEE attestation
 * 4. Upload content + certificate to 0G Storage
 * 5. Return everything the frontend needs to mint
 */
router.post('/', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt?.trim()) return res.status(400).json({ error: 'Prompt required' });

    // ── Step 1: Generate via 0G Compute ─────────────────────────────
    // 0G Compute returns text (and image base64 for image models)
    // Adjust the model and parameters for your chosen 0G model
    const computeRes = await fetch(`${process.env.OG_COMPUTE_URL}/v1/chat/completions`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.OG_COMPUTE_KEY}`,
      },
      body: JSON.stringify({
        model:      'llama-3.1-8b-instruct', // check available 0G models
        messages:   [{ role: 'user', content: prompt }],
        max_tokens: 500,
      }),
    });

    if (!computeRes.ok) {
      const errText = await computeRes.text();
      throw new Error(`0G Compute error: ${errText}`);
    }

    const computeData = await computeRes.json();
    const generatedText = computeData.choices[0].message.content;

    // ── Step 2: Hash content and prompt ─────────────────────────────
    const contentBuffer = Buffer.from(generatedText, 'utf8');
    const contentHash   = hashBuffer(contentBuffer);
    const promptHash    = hashString(prompt);  // hash not raw prompt = privacy

    // ── Step 3: TEE attestation ──────────────────────────────────────
    const modelId     = computeData.model || 'llama-3.1-8b-instruct';
    const certificate = await createAttestation({ contentHash, promptHash, modelId });

    // ── Step 4: Upload to 0G Storage ────────────────────────────────
    const certBuffer = Buffer.from(JSON.stringify(certificate), 'utf8');

    const [contentUpload, certUpload] = await Promise.all([
      uploadToStorage(contentBuffer, 'content.txt'),
      uploadToStorage(certBuffer,   'certificate.json'),
    ]);

    // ── Step 5: Return mint-ready payload ───────────────────────────
    res.json({
      success: true,
      content: {
        text:        generatedText,
        contentHash,
        storageRoot: contentUpload.root,
        storageUrl:  contentUpload.url,
      },
      certificate: {
        ...certificate,
        storageRoot: certUpload.root,
        storageUrl:  certUpload.url,
      },
      // These go directly into the contract mint call
      mintParams: {
        contentHash,
        certificateHash: certificate.certificateHash,
        storageRoot:     contentUpload.root,
        modelId,
        attestationMsg:  certificate.message,
        signature:       certificate.signature,
      },
    });

  } catch (err) {
    console.error('[generate]', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
