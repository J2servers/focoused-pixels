import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '@/lib/logger';

describe('logger', () => {
  const spies = {
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    info: vi.spyOn(console, 'info').mockImplementation(() => {}),
    debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
  };
  beforeEach(() => Object.values(spies).forEach(s => s.mockClear()));
  afterEach(() => Object.values(spies).forEach(s => s.mockClear()));

  it('prefixes scope on error', () => {
    logger.error('checkout', 'boom', { id: 1 });
    expect(spies.error).toHaveBeenCalledWith('[checkout]', 'boom', { id: 1 });
  });
  it('prefixes scope on warn', () => {
    logger.warn('auth', 'careful');
    expect(spies.warn).toHaveBeenCalledWith('[auth]', 'careful');
  });
});
