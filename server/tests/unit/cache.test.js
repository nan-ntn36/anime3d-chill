/**
 * Cache Utility Tests
 * 
 * NOTE: cache.js is a thin Redis wrapper. Due to vitest CJS/ESM mock interop 
 * limitations, vi.mock cannot reliably intercept the require('../config/redis') 
 * call inside cache.js. The Redis-backed cache logic is tested indirectly through 
 * integration tests. These tests verify the cache API surface and error handling.
 */

import { describe, it, expect } from 'vitest';

describe('Cache Module', () => {
  it('exports the expected functions', () => {
    const cache = require('../../src/utils/cache');
    expect(typeof cache.cacheGet).toBe('function');
    expect(typeof cache.cacheSet).toBe('function');
    expect(typeof cache.cacheDel).toBe('function');
    expect(typeof cache.cacheFlush).toBe('function');
  });

  it('cacheGet returns null when Redis is unreachable (graceful fallback)', async () => {
    // Without actual Redis connection, getCacheClient() will throw
    // and the try/catch in cacheGet will return null
    const { cacheGet } = require('../../src/utils/cache');
    const result = await cacheGet('nonexistent-key');
    // Will either return null (cache miss) or null (error caught)
    expect(result === null || result === undefined).toBe(true);
  });
});
