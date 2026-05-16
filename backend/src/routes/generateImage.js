import { Router } from 'express';
import { hashBuffer, hashString } from '../services/hash.js';
import { createAttestation } from '../services/tee.js';
import { uploadToStorage } from '../services/storage.js';
import { generateImage } from '../services/imageGen.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt?.trim()) {
      return res.status(400).json({ error: 'Prompt required' });
    }

    const modelId = process.env.IMAGE_MODEL || 'flux-schnell';

    const { imageBuffer, imageUrl, width, height } = await generateImage(prompt);

    const contentHash = hashBuffer(imageBuffer);
    const promptHash = hashString(prompt);

    const certificate = await createAttestation({
      contentHash,
      promptHash,
      modelId,
      contentType: 'image',
    });

    const certBuffer = Buffer.from(JSON.stringify(certificate), 'utf8');

    const [imageUpload, certUpload] = await Promise.all([
      uploadToStorage(imageBuffer, 'generated-image.webp'),
      uploadToStorage(certBuffer, 'certificate.json'),
    ]);

    res.json({
      success: true,
      content: {
        type: 'image',
        imageUrl,
        contentHash,
        storageRoot: imageUpload.root,
        storageUrl: imageUpload.url,
        width,
        height,
        fallback: imageUpload.fallback || false,
      },
      certificate: {
        ...certificate,
        storageRoot: certUpload.root,
        storageUrl: certUpload.url,
      },
      mintParams: {
        contentHash,
        certificateHash: certificate.certificateHash,
        storageRoot: imageUpload.root,
        modelId,
        attestationMsg: certificate.message,
        signature: certificate.signature,
      },
    });
  } catch (err) {
    console.error('[generate-image]', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
