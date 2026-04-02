import { describe, it, expect, vi } from 'vitest';
import { ContentLoader } from '../../src/core/contentLoader';

const mockBwPack = {
  id: 'bw', name: 'Bollywood', industry: 'BW' as const,
  cards: [
    { id: 'bw01', ind: 'BW' as const, diff: 'easy' as const, era: '90s', y: '1995', n: 'DDLJ', f: 'Fact', c: 'Clue' },
    { id: 'bw02', ind: 'BW' as const, diff: 'hard' as const, era: '2000s', y: '2001', n: 'K3G', f: 'Fact', c: 'Clue' },
  ],
};
const mockTwPack = {
  id: 'tw', name: 'Tollywood', industry: 'TW' as const,
  cards: [
    { id: 'tw01', ind: 'TW' as const, diff: 'easy' as const, era: '2010s', y: '2015', n: 'Baahubali', f: 'Fact', c: 'Clue' },
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
    const bwPool = ContentLoader.getCardPool(allCards, 'BW');
    expect(bwPool).toHaveLength(2);
    expect(bwPool.every(c => c.ind === 'BW')).toBe(true);
  });

  it('getCardPool returns correct count for TW', async () => {
    const { loader } = createLoader();
    const allCards = await loader.loadAllEnabled();
    const pool = ContentLoader.getCardPool(allCards, 'TW');
    expect(pool).toHaveLength(1);
  });
});
