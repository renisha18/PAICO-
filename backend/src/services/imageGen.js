/**
 * Hybrid image generation:
 * - 0G Router (TEE-backed)
 * - Pollinations fallback
 */

export async function generateImageBuffer(prompt) {
  const provider = process.env.IMAGE_PROVIDER || 'pollinations';

  // ─────────────────────────────────────────────
  // 0G Router
  // ─────────────────────────────────────────────
  if (provider === '0g-router') {

    const imageModel = process.env.IMAGE_MODEL;

    if (!imageModel) {
      throw new Error('IMAGE_MODEL not set');
    }

    console.log('[image] Using 0G Router:', imageModel);

    const res = await fetch(
      `${process.env.OG_COMPUTE_URL}/v1/images/generations`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OG_COMPUTE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: imageModel,
          prompt,
          n: 1,
          size: '512x512',
        }),
      }
    );

    if (!res.ok) {

      const errText = await res.text();

      console.error('[image] 0G Router error:', errText);

      // fallback
      if (process.env.POLLINATIONS_FALLBACK === 'true') {
        console.log('[image] Falling back to Pollinations');
        return pollinationsGenerate(prompt);
      }

      throw new Error(`0G Router error: ${errText}`);
    }

    const data = await res.json();

    const imageUrl = data.data?.[0]?.url;
    const b64Data  = data.data?.[0]?.b64_json;

    // Base64 response
    if (b64Data) {

      const imageBuffer = Buffer.from(b64Data, 'base64');

      return {
        imageBuffer,
        imageUrl: `data:image/png;base64,${b64Data}`,
        mimeType: 'image/png',
        provider: '0g-router',
        teeVerified: true,
        width: 512,
        height: 512,
      };
    }

    // URL response
    if (imageUrl) {

      const imgRes = await fetch(imageUrl);

      if (!imgRes.ok) {
        throw new Error('Failed to fetch generated image');
      }

      const arrayBuffer = await imgRes.arrayBuffer();

      return {
        imageBuffer: Buffer.from(arrayBuffer),
        imageUrl,
        mimeType: 'image/png',
        provider: '0g-router',
        teeVerified: true,
        width: 512,
        height: 512,
      };
    }

    throw new Error('No image returned from 0G Router');
  }

  // ─────────────────────────────────────────────
  // Pollinations fallback
  // ─────────────────────────────────────────────
  return pollinationsGenerate(prompt);
}

async function pollinationsGenerate(prompt) {

  const width = 768;
  const height = 768;

  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=${width}&height=${height}&seed=${Date.now()}&nologo=true`;

  console.log('[image] Using Pollinations');

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Pollinations error: ${res.status}`);
  }

  const arrayBuffer = await res.arrayBuffer();

  return {
    imageBuffer: Buffer.from(arrayBuffer),
    imageUrl: url,
    mimeType: 'image/jpeg',
    provider: 'pollinations',
    teeVerified: false,
    width,
    height,
  };
}