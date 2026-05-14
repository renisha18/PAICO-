import crypto from 'node:crypto';

export function hashBuffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function hashString(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

export function hashObject(obj) {
  const canonical = JSON.stringify(obj, Object.keys(obj).sort());
  return hashString(canonical);
}