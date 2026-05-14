import { Router } from 'express';
import { hashBuffer, hashString } from '../services/hash.js';
import { createAttestation }      from '../services/tee.js';
import { uploadToStorage }        from '../services/storage.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt?.trim()) {
      return res.status(400).json({ error: 'Prompt required' });
    }

    const computeUrl   = process.env.OG_COMPUTE_URL;
    const computeKey   = process.env.OG_COMPUTE_KEY;
    const computeModel = process.env.OG_COMPUTE_MODEL || 'llama3-8b-8192';

    if (!computeUrl || !computeKey) {
      return res.status(500).json({ 
        error: 'OG_COMPUTE_URL or OG_COMPUTE_KEY not set in backend/.env' 
      });
    }

    // ── Step 1: Call inference API ───────────────────────────────────
    console.log('[generate] Calling inference:', computeUrl);

    const computeRes = await fetch(
      `${computeUrl}/v1/chat/completions`,
      {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${computeKey}`,
        },
        body: JSON.stringify({
          model:      computeModel,
          messages:   [{ role: 'user', content: prompt }],
          max_tokens: 500,
        }),
      }
    );

    if (!computeRes.ok) {
      const errText = await computeRes.text();
      console.error('[generate] Inference error:', computeRes.status, errText);
      return res.status(502).json({ 
        error: `Inference API error ${computeRes.status}: ${errText}` 
      });
    }

    const computeData   = await computeRes.json();
    const generatedText = computeData.choices?.[0]?.message?.content;

    if (!generatedText) {
      return res.status(502).json({ 
        error: 'No content returned from inference API',
        raw:   computeData 
      });
    }

    console.log('[generate] Got inference response, length:', generatedText.length);

    // ── Step 2: Hash content ─────────────────────────────────────────
    const contentBuffer = Buffer.from(generatedText, 'utf8');
    const contentHash   = hashBuffer(contentBuffer);
    const promptHash    = hashString(prompt);
    const modelId       = computeData.model || computeModel;

    console.log('[generate] Content hash:', contentHash);

    // ── Step 3: TEE attestation ──────────────────────────────────────
    const certificate = await createAttestation({ 
      contentHash, 
      promptHash, 
      modelId 
    });

    console.log('[generate] Attestation created, sig:', certificate.signature.slice(0, 20) + '...');

    // ── Step 4: Upload to 0G Storage ────────────────────────────────
    const certBuffer = Buffer.from(JSON.stringify(certificate), 'utf8');

    const [contentUpload, certUpload] = await Promise.all([
      uploadToStorage(contentBuffer, 'content.txt'),
      uploadToStorage(certBuffer,    'certificate.json'),
    ]);

    console.log('[generate] Uploads done:', {
      contentRoot: contentUpload.root,
      certRoot:    certUpload.root,
      fallback:    contentUpload.fallback || false,
    });

    // ── Step 5: Return everything frontend needs ─────────────────────
    res.json({
      success: true,
      content: {
        text:        generatedText,
        contentHash,
        storageRoot: contentUpload.root,
        storageUrl:  contentUpload.url,
        fallback:    contentUpload.fallback || false,
      },
      certificate: {
        ...certificate,
        storageRoot: certUpload.root,
        storageUrl:  certUpload.url,
      },
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