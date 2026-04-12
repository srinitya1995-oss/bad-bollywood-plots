import { describe, it, expect, vi } from 'vitest';
import { ContentLoader } from '../../src/core/contentLoader';

const mockBwPack = {
  id: 'bw', name: 'Bollywood', industry: 'HI' as const,
  cards: [
    { id: 'bw01', ind: 'HI' as const, diff: 'easy' as const, era: '90s', y: '1995', n: 'DDLJ', f: 'Fact', c: 'Clue' },
    { id: 'bw02', ind: 'HI' as const, diff: 'hard' as const, era: '2000s', y: '2001', n: 'K3G', f: 'Fact', c: 'Clue' },
  ],
};
const mockTwPack = {
  id: 'tw', name: 'Tollywood', industry: 'TE' as const,
  cards: [
    { id: 'tw01', ind: 'TE' as const, diff: 'easy' as const, era: '2010s', y: '2015', n: 'Baahubali', f: 'Fact', c: 'Clue' },
  ],
};
const mockManifest = {
  packs: [
    { id: 'bw', file: 'packs/bw.json', enabled: true },
    { id: 'tw', file: 'packs/tw.json', enabled: true },
    { id: 'disabled', file: 'packs/disabled.json', enabled: false },
  ],
};

function createLoader() {
  const fetcher = vi.fn(async (url: string) => {
    if (url.includes('manifest.json')) return mockManifest;
    if (url.includes('bw.json')) return mockBwPack;
    if (url.includes('tw.json')) return mockTwPack;
    throw new Error(`Unknown URL: ${url}`);
  });
  return { loader: new ContentLoader(fetcher), fetcher };
}

describe('ContentLoader', () => {
  it('loads manifest and all enabled packs', async () => {
    const { loader, fetcher } = createLoader();
    const cards = await loader.loadAllEnabled();
    expect(cards).toHaveLength(3);
    expect(fetcher).not.toHaveBeenCalledWith(expect.stringContaining('disabled.json'));
  });

  it('getCardPool filters by industry', async () => {
    const { loader } = createLoader();
    const allCards = await loader.loadAllEnabled();
    const bwPool = ContentLoader.getCardPool(allCards, 'HI');
    expect(bwPool).toHaveLength(2);
    expect(bwPool.every(c => c.ind === 'HI')).toBe(true);
  });

  it('getCardPool returns correct count for TE', async () => {
    const { loader } = createLoader();
    const allCards = await loader.loadAllEnabled();
    const pool = ContentLoader.getCardPool(allCards, 'TE');
    expect(pool).toHaveLength(1);
  });
});
