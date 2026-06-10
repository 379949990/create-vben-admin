import { describe, expect, it } from 'vitest';
import { resolveUpstreamRef } from '../src/extract/resolve-ref.js';

describe('resolveUpstreamRef', () => {
  it('returns explicit ref when provided', async () => {
    await expect(resolveUpstreamRef('v5.7.0')).resolves.toBe('v5.7.0');
  });
});
