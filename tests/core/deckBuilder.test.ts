import { describe, it, expect } from 'vitest';
import { shuffle, filterSeen, buildPartyDeck, buildEndlessDeck, pickEndlessCard, buildFixedRoundDeck } from '../../src/core/deckBuilder';
import type { Card } from '../../src/core/types';

function makeCard(id: string, diff: 'easy' | 'medium' | 'hard' = 'easy'): Card {
  return { id, ind: 'HI', diff, era: '90s', y: '1995', n: `Movie ${id}`, f: 'Fact', c: 'Clue' };
}

describe('shuffle', () => {
  it('returns a new array with the same elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
    expect(result.sort()).toEqual(input.sort());
    expect(result).not.toBe(input);
  });
});

describe('filterSeen', () => {
  it('excludes cards in seen list', () => {
    const cards = [makeCard('a'), makeCard('b'), makeCard('c')];
    const result = filterSeen(cards, ['a'], new Set());
    expect(result.map(c => c.id)).toEqual(['b', 'c']);
  });

  it('excludes cards in sessionDealt', () => {
    const cards = [makeCard('a'), makeCard('b'), makeCard('c')];
    const result = filterSeen(cards, [], new Set(['b']));
    expect(result.map(c => c.id)).toEqual(['a', 'c']);
  });

  it('resets seen when fewer than 4 cards remain', () => {
    const cards = [makeCard('a'), makeCard('b'), makeCard('c'), makeCard('d')];
    const result = filterSeen(cards, ['a', 'b', 'c', 'd'], new Set());
    expect(result).toHaveLength(4);
  });

  it('keeps session dedup even when cross-session resets', () => {
    const cards = [makeCard('a'), makeCard('b'), makeCard('c'), makeCard('d'), makeCard('e')];
    const result = filterSeen(cards, ['a', 'b', 'c', 'd'], new Set(['a']));
    expect(result.map(c => c.id)).not.toContain('a');
  });
});

describe('buildPartyDeck', () => {
  it('returns up to 12 cards (4 easy, 4 medium, 4 hard)', () => {
    const pool = [
      ...Array.from({ length: 10 }, (_, i) => makeCard(`e${i}`, 'easy')),
      ...Array.from({ length: 10 }, (_, i) => makeCard(`m${i}`, 'medium')),
      ...Array.from({ length: 10 }, (_, i) => makeCard(`h${i}`, 'hard')),
    ];
    const result = buildPartyDeck(pool, new Set(), []);
    expect(result).toHaveLength(12);
    expect(result.filter(c => c.diff === 'easy')).toHaveLength(4);
    expect(result.filter(c => c.diff === 'medium')).toHaveLength(4);
    expect(result.filter(c => c.diff === 'hard')).toHaveLength(4);
  });

  it('tracks dealt cards in sessionDealt', () => {
    const pool = Array.from({ length: 20 }, (_, i) => makeCard(`c${i}`, 'easy'));
    const sessionDealt = new Set<string>();
    const result = buildPartyDeck(pool, sessionDealt, []);
    for (const card of result) {
      expect(sessionDealt.has(card.id)).toBe(true);
    }
  });
});

describe('buildEndlessDeck', () => {
  it('returns all available cards shuffled', () => {
    const pool = [makeCard('a'), makeCard('b'), makeCard('c')];
    const result = buildEndlessDeck(pool, new Set(), []);
    expect(result).toHaveLength(3);
  });

  it('tracks dealt cards in sessionDealt', () => {
    const pool = [makeCard('a'), makeCard('b')];
    const sessionDealt = new Set<string>();
    buildEndlessDeck(pool, sessionDealt, []);
    expect(sessionDealt.has('a')).toBe(true);
    expect(sessionDealt.has('b')).toBe(true);
  });
});

describe('pickEndlessCard', () => {
  const pool = [
    ...Array.from({ length: 5 }, (_, i) => makeCard(`e${i}`, 'easy')),
    ...Array.from({ length: 5 }, (_, i) => makeCard(`m${i}`, 'medium')),
    ...Array.from({ length: 5 }, (_, i) => makeCard(`h${i}`, 'hard')),
  ];

  it('picks only easy cards at streak 0-2', () => {
    for (let streak = 0; streak <= 2; streak++) {
      const card = pickEndlessCard(pool, new Set(), [], streak);
      expect(card).not.toBeNull();
      expect(card!.diff).toBe('easy');
    }
  });

  it('picks easy or medium cards at streak 3-5', () => {
    for (let streak = 3; streak <= 5; streak++) {
      const card = pickEndlessCard(pool, new Set(), [], streak);
      expect(card).not.toBeNull();
      expect(['easy', 'medium']).toContain(card!.diff);
    }
  });

  it('can pick hard cards at streak 6+', () => {
    // With only hard cards in pool, streak 6+ should still return a card
    const hardOnly = Array.from({ length: 5 }, (_, i) => makeCard(`h${i}`, 'hard'));
    const card = pickEndlessCard(hardOnly, new Set(), [], 6);
    expect(card).not.toBeNull();
    expect(card!.diff).toBe('hard');
  });

  it('falls back to any card when target difficulty pool is empty', () => {
    const hardOnly = [makeCard('h1', 'hard')];
    // streak 0 wants easy, but only hard available, should fallback
    const card = pickEndlessCard(hardOnly, new Set(), [], 0);
    expect(card).not.toBeNull();
    expect(card!.diff).toBe('hard');
  });

  it('returns null when pool is completely exhausted', () => {
    const small = [makeCard('a', 'easy')];
    const card = pickEndlessCard(small, new Set(['a']), ['a'], 0);
    expect(card).toBeNull();
  });

  it('tracks picked card in sessionDealt', () => {
    const sessionDealt = new Set<string>();
    const card = pickEndlessCard(pool, sessionDealt, [], 0);
    expect(card).not.toBeNull();
    expect(sessionDealt.has(card!.id)).toBe(true);
  });
});

describe('buildFixedRoundDeck', () => {
  const pool = [
    ...Array.from({ length: 10 }, (_, i) => makeCard(`e${i}`, 'easy')),
    ...Array.from({ length: 10 }, (_, i) => makeCard(`m${i}`, 'medium')),
    ...Array.from({ length: 10 }, (_, i) => makeCard(`h${i}`, 'hard')),
  ];

  it('returns the correct number of cards for each round length', () => {
    for (const len of [5, 8, 10, 12] as const) {
      const result = buildFixedRoundDeck(pool, new Set(), new Set(), len, 'all');
      expect(result).toHaveLength(len);
    }
  });

  it('filters by difficulty when filter is not all', () => {
    const result = buildFixedRoundDeck(pool, new Set(), new Set(), 5, 'easy');
    for (const card of result) {
      expect(card.diff).toBe('easy');
    }
  });

  it('excludes seen cards', () => {
    const seen = new Set(['e0', 'e1', 'e2', 'e3', 'e4']);
    const result = buildFixedRoundDeck(pool, seen, new Set(), 5, 'easy');
    for (const card of result) {
      expect(seen.has(card.id)).toBe(false);
    }
  });

  it('excludes sessionDealt cards', () => {
    const sessionDealt = new Set(['e0', 'e1']);
    const result = buildFixedRoundDeck(pool, new Set(), sessionDealt, 5, 'easy');
    // e0 and e1 should not be in result (they get added to sessionDealt by the function though)
    const originalDealt = new Set(['e0', 'e1']);
    for (const card of result) {
      expect(originalDealt.has(card.id)).toBe(false);
    }
  });

  it('relaxes gracefully when not enough cards after filtering', () => {
    // Only 3 easy cards, requesting 5 with easy filter. Should relax and include other difficulties.
    const smallPool = [
      makeCard('e0', 'easy'),
      makeCard('e1', 'easy'),
      makeCard('e2', 'easy'),
      makeCard('m0', 'medium'),
      makeCard('m1', 'medium'),
      makeCard('h0', 'hard'),
    ];
    const result = buildFixedRoundDeck(smallPool, new Set(), new Set(), 5, 'easy');
    expect(result).toHaveLength(5);
  });

  it('relaxes sessionDealt before seen before filter', () => {
    // All easy cards are in sessionDealt, but easy filter is set
    const easyPool = Array.from({ length: 5 }, (_, i) => makeCard(`e${i}`, 'easy'));
    const allIds = new Set(easyPool.map(c => c.id));
    const result = buildFixedRoundDeck(easyPool, new Set(), allIds, 5, 'easy');
    expect(result).toHaveLength(5);
  });

  it('tracks dealt cards in sessionDealt', () => {
    const sessionDealt = new Set<string>();
    const result = buildFixedRoundDeck(pool, new Set(), sessionDealt, 8, 'all');
    for (const card of result) {
      expect(sessionDealt.has(card.id)).toBe(true);
    }
  });
});
