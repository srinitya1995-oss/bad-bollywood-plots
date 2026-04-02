import { describe, it, expect } from 'vitest';
import { shuffle, filterSeen, buildPartyDeck, buildEndlessDeck } from '../../src/core/deckBuilder';
import type { Card } from '../../src/core/types';

function makeCard(id: string, diff: 'easy' | 'medium' | 'hard' = 'easy'): Card {
  return { id, ind: 'BW', diff, era: '90s', y: '1995', n: `Movie ${id}`, f: 'Fact', c: 'Clue' };
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
