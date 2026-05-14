import { Router } from 'express';
import { uploadToStorage } from '../services/storage.js';

const router = Router();

/**
 * POST /api/upload
 * Body: { content: string, filename: string }
 *
 * Standalone upload endpoint — useful for testing storage
 * independently from the generate flow.
 */
router.post('/', async (req, res) => {
  try {
    const { content, filename = 'file.txt' } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });

    const buffer = Buffer.from(content, 'utf8');
    const result = await uploadToStorage(buffer, filename);

    res.json({
      success: true,
      root:    result.root,
      url:     result.url,
    });

  } catch (err) {
    console.error('[upload]', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;