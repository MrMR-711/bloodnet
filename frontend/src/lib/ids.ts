export function createId(prefix: string): string {
  const raw = globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase();
  return `${prefix}-${raw}`;
}

export function createIdempotencyKey(): string {
  return globalThis.crypto.randomUUID();
}

export function shortenId(id: string, visible = 10): string {
  if (id.length <= visible) return id;
  return `${id.slice(0, visible)}…`;
}
