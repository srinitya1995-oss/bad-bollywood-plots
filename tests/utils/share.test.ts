import { describe, it, expect } from 'vitest';
import { buildShareUrl } from '../../src/utils/share';

describe('buildShareUrl', () => {
  it.each([
    ['whatsapp', 'solo'],
    ['whatsapp', 'party'],
    ['x',        'solo'],
    ['x',        'party'],
    ['reddit',   'solo'],
    ['reddit',   'party'],
    ['copy',     'solo'],
    ['copy',     'party'],
  ] as const)('emits utm params for %s + %s', (channel, mode) => {
    const url = buildShareUrl(channel, mode);
    expect(url).toBe(
      `https://baddesiplots.com/?utm_source=share&utm_medium=${channel}&utm_campaign=results_${mode}`
    );
  });
});
