import { describe, expect, it } from 'vitest';
import { VBEN_TEMPLATE_IDS } from '../src/core/constants.js';

describe('constants', () => {
  it('lists all known vben UI templates', () => {
    expect(VBEN_TEMPLATE_IDS).toContain('web-antd');
    expect(VBEN_TEMPLATE_IDS).toHaveLength(5);
  });
});
