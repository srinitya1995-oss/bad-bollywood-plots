/**
 * GMAT-style Computer Adaptive Testing (CAT) engine for Seedha Plot.
 *
 * Each card has a difficulty rating. The player has an ability estimate.
 * After each answer, both update using a logistic model (like ELO chess ratings).
 * Card selection picks the card closest to the player's current ability.
 * Final score IS the ability estimate — not a point count.
 */

import type { Card, Difficulty } from './types';

// Difficulty → base rating (Rasch model scale)
const DIFFICULTY_RATING: Record<Difficulty, number> = {
  easy: 900,
  medium: 1200,
  hard: 1550,
};

// How much ability moves per answer (K-factor, decays with more answers for stability)
function kFactor(answeredCount: number): number {
  if (answeredCount < 4) return 80;   // high volatility early (calibrating)
  if (answeredCount < 8) return 50;   // settling
  return 32;                           // stable (standard ELO K-factor)
}

export interface AdaptiveState {
  ability: number;           // current estimated ability (starts 1100)
  answeredCount: number;     // how many cards answered
  history: { cardId: string; rating: number; correct: boolean }[];
  peakAbility: number;       // highest ability reached (for display)
}

export function createAdaptiveState(): AdaptiveState {
  return {
    ability: 1100,
    answeredCount: 0,
    history: [],
    peakAbility: 1100,
  };
}

/** Probability that a player with `ability` gets a card with `rating` correct. */
function expectedScore(ability: number, cardRating: number): number {
  return 1 / (1 + Math.pow(10, (cardRating - ability) / 400));
}

/**
 * Update ability after answering a card.
 * Returns new AdaptiveState (immutable).
 */
export function updateAbility(
  state: AdaptiveState,
  card: Card,
  correct: boolean,
): AdaptiveState {
  const cardRating = DIFFICULTY_RATING[card.diff];
  const expected = expectedScore(state.ability, cardRating);
  const actual = correct ? 1 : 0;
  const k = kFactor(state.answeredCount);

  const newAbility = Math.round(state.ability + k * (actual - expected));
  // Clamp to reasonable range
  const clamped = Math.max(500, Math.min(2000, newAbility));

  return {
    ability: clamped,
    answeredCount: state.answeredCount + 1,
    history: [...state.history, { cardId: card.id, rating: cardRating, correct }],
    peakAbility: Math.max(state.peakAbility, clamped),
  };
}

/**
 * Pick the best next card — closest to the player's current ability.
 * Adds randomness within a band to avoid feeling deterministic.
 */
export function pickAdaptiveCard(
  pool: Card[],
  sessionDealt: Set<string>,
  seen: string[],
  ability: number,
): Card | null {
  const seenSet = new Set(seen);
  let available = pool.filter(c => !seenSet.has(c.id) && !sessionDealt.has(c.id));

  // Fallback if pool exhausted
  if (available.length === 0) {
    available = pool.filter(c => !sessionDealt.has(c.id));
  }
  if (available.length === 0) return null;

  // Score each card by proximity to ability, with slight randomness
  const scored = available.map(c => {
    const rating = DIFFICULTY_RATING[c.diff];
    const distance = Math.abs(rating - ability);
    const noise = Math.random() * 150; // adds variety within ~150 rating band
    return { card: c, score: distance + noise };
  });

  // Sort by score (lower = better match)
  scored.sort((a, b) => a.score - b.score);

  const pick = scored[0].card;
  sessionDealt.add(pick.id);
  return pick;
}

/** Convert ability rating to a display-friendly tier label. */
export function getAbilityTier(ability: number): string {
  if (ability >= 1600) return 'Filmi Genius';
  if (ability >= 1400) return 'Cinephile';
  if (ability >= 1200) return 'Movie Buff';
  if (ability >= 1000) return 'Casual Viewer';
  if (ability >= 800) return 'Beginner';
  return 'Netflix Newbie';
}

/** Convert ability to a percentile estimate (approximate, for display). */
export function getAbilityPercentile(ability: number): number {
  // Rough logistic mapping: 1100 = 50th percentile (median)
  const percentile = 100 / (1 + Math.pow(10, (1100 - ability) / 300));
  return Math.round(Math.max(1, Math.min(99, percentile)));
}

export { DIFFICULTY_RATING };
