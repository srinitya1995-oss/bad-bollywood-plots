import { describe, it, expect } from 'vitest';
import { INDUSTRY_META } from '../../src/core/types';

describe('INDUSTRY_META', () => {
  it('has entries for all 4 languages', () => {
    expect(Object.keys(INDUSTRY_META)).toEqual(['HI', 'TE', 'TA', 'ML']);
  });
  it('each entry has label, lang, color, packId, comingSoon', () => {
    for (const meta of Object.values(INDUSTRY_META)) {
      expect(meta).toHaveProperty('label');
      expect(meta).toHaveProperty('lang');
      expect(meta).toHaveProperty('color');
      expect(meta).toHaveProperty('packId');
      expect(meta).toHaveProperty('comingSoon');
    }
  });
  it('Hindi and Telugu are not coming-soon', () => {
    expect(INDUSTRY_META.HI.comingSoon).toBe(false);
    expect(INDUSTRY_META.TE.comingSoon).toBe(false);
  });
  it('Tamil and Malayalam are coming-soon', () => {
    expect(INDUSTRY_META.TA.comingSoon).toBe(true);
    expect(INDUSTRY_META.ML.comingSoon).toBe(true);
  });
});
