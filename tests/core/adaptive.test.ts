import { describe, it, expect } from 'vitest';
import {
  createAdaptiveState,
  updateAbility,
  pickAdaptiveCard,
  getAbilityTier,
  getAbilityPercentile,
  DIFFICULTY_RATING,
} from '../../src/core/adaptive';
import type { Card } from '../../src/core/types';

const makeCard = (id: string, diff: 'easy' | 'medium' | 'hard'): Card => ({
  id, ind: 'HI', diff, era: '2010s', y: '2015', n: 'Test Movie', f: 'Fun fact', c: 'A test clue',
});

describe('AdaptiveState', () => {
  it('starts at ability 1100', () => {
    const state = createAdaptiveState();
    expect(state.ability).toBe(1100);
    expect(state.answeredCount).toBe(0);
    expect(state.history).toHaveLength(0);
  });

  it('ability increases on correct answer', () => {
    const state = createAdaptiveState();
    const next = updateAbility(state, makeCard('c1', 'medium'), true);
    expect(next.ability).toBeGreaterThan(state.ability);
    expect(next.answeredCount).toBe(1);
    expect(next.history).toHaveLength(1);
    expect(next.history[0].correct).toBe(true);
  });

  it('ability decreases on wrong answer', () => {
    const state = createAdaptiveState();
    const next = updateAbility(state, makeCard('c1', 'medium'), false);
    expect(next.ability).toBeLessThan(state.ability);
  });

  it('correct on hard card gives bigger ability boost than correct on easy', () => {
    const state = createAdaptiveState();
    const afterEasy = updateAbility(state, makeCard('e1', 'easy'), true);
    const afterHard = updateAbility(state, makeCard('h1', 'hard'), true);
    const easyDelta = afterEasy.ability - state.ability;
    const hardDelta = afterHard.ability - state.ability;
    expect(hardDelta).toBeGreaterThan(easyDelta);
  });

  it('wrong on easy card gives bigger ability drop than wrong on hard', () => {
    const state = createAdaptiveState();
    const afterEasy = updateAbility(state, makeCard('e1', 'easy'), false);
    const afterHard = updateAbility(state, makeCard('h1', 'hard'), false);
    const easyDrop = state.ability - afterEasy.ability;
    const hardDrop = state.ability - afterHard.ability;
    expect(easyDrop).toBeGreaterThan(hardDrop);
  });

  it('ability is clamped between 500 and 2000', () => {
    let state = createAdaptiveState();
    // Miss 20 easy cards in a row — should not go below 500
    for (let i = 0; i < 20; i++) {
      state = updateAbility(state, makeCard(`e${i}`, 'easy'), false);
    }
    expect(state.ability).toBeGreaterThanOrEqual(500);

    // Get 20 hard cards right — should not exceed 2000
    state = { ...createAdaptiveState(), ability: 1800 };
    for (let i = 0; i < 20; i++) {
      state = updateAbility(state, makeCard(`h${i}`, 'hard'), true);
    }
    expect(state.ability).toBeLessThanOrEqual(2000);
  });

  it('tracks peak ability', () => {
    let state = createAdaptiveState();
    state = updateAbility(state, makeCard('h1', 'hard'), true); // go up
    const peak = state.peakAbility;
    state = updateAbility(state, makeCard('e1', 'easy'), false); // go down
    expect(state.peakAbility).toBe(peak); // peak didn't drop
  });

  it('K-factor decreases with more answers (stabilizes)', () => {
    let state = createAdaptiveState();
    // First answer: high K (80) → big jump
    const first = updateAbility(state, makeCard('m1', 'medium'), true);
    const firstDelta = first.ability - state.ability;

    // Build up 8 answers
    for (let i = 0; i < 8; i++) {
      state = updateAbility(state, makeCard(`x${i}`, 'medium'), true);
    }
    // 9th answer: low K (32) → smaller jump
    const ninth = updateAbility(state, makeCard('m9', 'medium'), true);
    const ninthDelta = ninth.ability - state.ability;

    expect(firstDelta).toBeGreaterThan(ninthDelta);
  });
});

describe('pickAdaptiveCard', () => {
  const cards = [
    makeCard('e1', 'easy'), makeCard('e2', 'easy'),
    makeCard('m1', 'medium'), makeCard('m2', 'medium'),
    makeCard('h1', 'hard'), makeCard('h2', 'hard'),
  ];

  it('picks a card from available pool', () => {
    const card = pickAdaptiveCard(cards, new Set(), [], 1100);
    expect(card).not.toBeNull();
    expect(cards.some(c => c.id === card!.id)).toBe(true);
  });

  it('avoids already-dealt cards', () => {
    const dealt = new Set(['e1', 'e2', 'm1', 'm2', 'h1']);
    const card = pickAdaptiveCard(cards, dealt, [], 1100);
    expect(card!.id).toBe('h2');
  });

  it('returns null when all cards exhausted', () => {
    const dealt = new Set(cards.map(c => c.id));
    const card = pickAdaptiveCard(cards, dealt, [], 1100);
    expect(card).toBeNull();
  });

  it('low ability player gets easier cards more often', () => {
    const picks: string[] = [];
    for (let i = 0; i < 50; i++) {
      const card = pickAdaptiveCard(cards, new Set(), [], 800); // low ability
      if (card) picks.push(card.diff);
    }
    const easyCount = picks.filter(d => d === 'easy').length;
    // With ability 800 and easy rating 900, easy cards should be picked most often
    expect(easyCount).toBeGreaterThan(15); // at least 30% easy
  });

  it('high ability player gets harder cards more often', () => {
    const picks: string[] = [];
    for (let i = 0; i < 50; i++) {
      const card = pickAdaptiveCard(cards, new Set(), [], 1600); // high ability
      if (card) picks.push(card.diff);
    }
    const hardCount = picks.filter(d => d === 'hard').length;
    expect(hardCount).toBeGreaterThan(15); // at least 30% hard
  });
});

describe('getAbilityTier', () => {
  it('maps ability to correct tier', () => {
    expect(getAbilityTier(1700)).toBe('Filmi Genius');
    expect(getAbilityTier(1500)).toBe('Cinephile');
    expect(getAbilityTier(1300)).toBe('Movie Buff');
    expect(getAbilityTier(1050)).toBe('Casual Viewer');
    expect(getAbilityTier(850)).toBe('Beginner');
    expect(getAbilityTier(600)).toBe('Netflix Newbie');
  });
});

describe('getAbilityPercentile', () => {
  it('1100 is roughly 50th percentile', () => {
    const p = getAbilityPercentile(1100);
    expect(p).toBeGreaterThanOrEqual(45);
    expect(p).toBeLessThanOrEqual(55);
  });

  it('higher ability = higher percentile', () => {
    expect(getAbilityPercentile(1500)).toBeGreaterThan(getAbilityPercentile(1100));
    expect(getAbilityPercentile(1100)).toBeGreaterThan(getAbilityPercentile(700));
  });

  it('clamps between 1 and 99', () => {
    expect(getAbilityPercentile(500)).toBeGreaterThanOrEqual(1);
    expect(getAbilityPercentile(2000)).toBeLessThanOrEqual(99);
  });
});
