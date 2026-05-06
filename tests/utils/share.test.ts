import { describe, it, expect } from 'vitest';
import { buildShareUrl, getShareTextSolo } from '../../src/utils/share';

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

describe('getShareTextSolo', () => {
  const baseInput = {
    tier: 'Movie Buff',
    rating: 1300,
    correctCount: 12,
    totalPlayed: 15,
    industryLabel: 'Hindi',
    percentile: 25,
    emoji: '\u{1F525}',
  };

  it('formats text with utm-tagged url for the given channel', () => {
    const text = getShareTextSolo(baseInput, 'whatsapp');
    expect(text).toBe(
      [
        '\u{1F525} Movie Buff (1300 rating)',
        '12/15 Hindi movies · Top 25%',
        '',
        'Terrible plots. Real movies.',
        'Think you can beat that?',
        'https://baddesiplots.com/?utm_source=share&utm_medium=whatsapp&utm_campaign=results_solo',
      ].join('\n')
    );
  });

  it('uses correct utm medium per channel', () => {
    const text = getShareTextSolo(baseInput, 'reddit');
    expect(text).toContain('utm_medium=reddit');
    expect(text).toContain('utm_campaign=results_solo');
  });
});
