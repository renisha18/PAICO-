// Browser-native SHA-256 — zero dependencies
// SubtleCrypto is available in all modern browsers, no library needed

export async function hashBuffer(buffer) {
  const hashBuf   = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuf));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashString(str) {
  const bytes = new TextEncoder().encode(str);
  return hashBuffer(bytes);
}

// Hash a File object from an <input type="file">
export async function hashFile(file) {
  const buf = await file.arrayBuffer();
  return hashBuffer(buf);
}