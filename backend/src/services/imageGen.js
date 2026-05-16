/**
 * Pollinations image generation (FREE)
 * No API key required.
 */

const WIDTH = 768;
const HEIGHT = 768;

/**
 * Generate AI image using Pollinations
 * @returns {{
 *   imageBuffer: Buffer,
 *   imageUrl: string,
 *   width: number,
 *   height: number,
 *   mimeType: string
 * }}
 */
export async function generateImage(prompt) {

  if (!prompt?.trim()) {
    throw new Error('Prompt is required');
  }

  // Unique seed prevents repeated cached images
  const seed = Date.now();

  const imageUrl =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=${WIDTH}&height=${HEIGHT}&seed=${seed}&nologo=true`;

  console.log('[pollinations] Generating image:', imageUrl);

  const res = await fetch(imageUrl);

  if (!res.ok) {
    throw new Error(`Pollinations error: ${res.status}`);
  }

  const arrayBuffer = await res.arrayBuffer();

  return {
    imageBuffer: Buffer.from(arrayBuffer),
    imageUrl,
    width: WIDTH,
    height: HEIGHT,
    mimeType: 'image/jpeg',
  };
}