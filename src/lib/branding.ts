export function resolveBrandImage(...sources: Array<string | null | undefined>) {
  for (const source of sources) {
    if (typeof source === 'string') {
      const normalized = source.trim();
      if (normalized) return normalized;
    }
  }

  return '';
}
