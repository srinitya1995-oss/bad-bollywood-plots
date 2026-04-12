import { describe, it, expect } from 'vitest';
import { createScorerState, scoreCard, getVerdict, getLeaderboard, VERDICT_TIERS } from '../../src/core/scorer';
import type { Card, Player } from '../../src/core/types';

function makeCard(diff: 'easy' | 'medium' | 'hard' = 'easy'): Card {
  return { id: 'bw01', ind: 'BW', diff, era: '90s', y: '1995', n: 'Test', f: 'Fact', c: 'Clue' };
}

describe('scoreCard', () => {
  it('adds points for correct answer', () => {
    const state = createScorerState([{ name: 'P1', score: 0 }]);
    const next = scoreCard(state, makeCard('medium'), 'correct');
    expect(next.totalPts).toBe(2);
    expect(next.correctCount).toBe(1);
    expect(next.streak).toBe(1);
    expect(next.players[0].score).toBe(2);
  });

  it('resets streak on miss', () => {
    let state = createScorerState([{ name: 'P1', score: 0 }]);
    state = scoreCard(state, makeCard(), 'correct');
    state = scoreCard(state, makeCard(), 'miss');
    expect(state.streak).toBe(0);
    expect(state.totalPts).toBe(1);
  });

  it('decrements lives on miss in endless mode', () => {
    const state = createScorerState([{ name: 'P1', score: 0 }], 3);
    const next = scoreCard(state, makeCard(), 'miss');
    expect(next.lives).toBe(2);
  });

  it('does not change score on skip', () => {
    const state = createScorerState([{ name: 'P1', score: 0 }]);
    const next = scoreCard(state, makeCard('hard'), 'skip');
    expect(next.totalPts).toBe(0);
    expect(next.streak).toBe(0);
  });

  it('awards correct points per difficulty', () => {
    const state = createScorerState([{ name: 'P1', score: 0 }]);
    expect(scoreCard(state, makeCard('easy'), 'correct').totalPts).toBe(1);
    expect(scoreCard(state, makeCard('medium'), 'correct').totalPts).toBe(2);
    expect(scoreCard(state, makeCard('hard'), 'correct').totalPts).toBe(3);
  });

  it('scores to current player in multiplayer', () => {
    const state = createScorerState([{ name: 'P1', score: 0 }, { name: 'P2', score: 0 }]);
    const next = scoreCard(state, makeCard('hard'), 'correct');
    expect(next.players[0].score).toBe(3);
    expect(next.players[1].score).toBe(0);
  });
});

describe('getVerdict', () => {
  const titlesOf = (entries: readonly { title: string }[]) => entries.map(e => e.title);

  it('returns a legendary verdict for 90%+', () => {
    expect(titlesOf(VERDICT_TIERS.legendary)).toContain(getVerdict(10, 10).title);
  });
  it('returns an impressive verdict for 70-89%', () => {
    expect(titlesOf(VERDICT_TIERS.impressive)).toContain(getVerdict(8, 10).title);
  });
  it('returns a not-bad verdict for 50-69%', () => {
    expect(titlesOf(VERDICT_TIERS.notBad)).toContain(getVerdict(6, 10).title);
  });
  it('returns a keep-trying verdict for 25-49%', () => {
    expect(titlesOf(VERDICT_TIERS.keepTrying)).toContain(getVerdict(3, 10).title);
  });
  it('returns an oof verdict for <25%', () => {
    expect(titlesOf(VERDICT_TIERS.oof)).toContain(getVerdict(1, 10).title);
  });
  it('each tier has multiple variants for replayability', () => {
    for (const tier of Object.values(VERDICT_TIERS)) {
      expect(tier.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('getLeaderboard', () => {
  it('sorts players by score descending', () => {
    const players: Player[] = [{ name: 'A', score: 5 }, { name: 'B', score: 10 }, { name: 'C', score: 3 }];
    expect(getLeaderboard(players).map(p => p.name)).toEqual(['B', 'A', 'C']);
  });
});
