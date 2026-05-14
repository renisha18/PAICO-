import crypto from 'node:crypto';

// Hash a Buffer (image bytes, file bytes, etc.)
export function hashBuffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// Hash a plain string (prompt, JSON, etc.)
export function hashString(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

// Hash a JS object deterministically
// IMPORTANT: always sort keys so { a:1, b:2 } and { b:2, a:1 } hash identically
export function hashObject(obj) {
  const canonical = JSON.stringify(obj, Object.keys(obj).sort());
  return hashString(canonical);
}