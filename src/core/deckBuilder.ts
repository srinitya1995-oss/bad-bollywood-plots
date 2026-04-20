import type { Card, DifficultyFilter, RoundLength } from './types';

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function filterSeen(cards: Card[], seen: string[], sessionDealt: Set<string>): Card[] {
  const seenSet = new Set(seen);
  let filtered = cards.filter((c) => !seenSet.has(c.id) && !sessionDealt.has(c.id));
  // Only reset cross-session seen if we have a large enough pool to replenish from
  const withoutSessionDedup = cards.filter((c) => !sessionDealt.has(c.id));
  if (filtered.length < 4 && withoutSessionDedup.length >= 4) {
    filtered = withoutSessionDedup;
  }
  if (filtered.length < 4 && cards.length >= 4) {
    filtered = cards;
  }
  return filtered;
}

/**
 * Build a fixed-length round deck for v8 game modes.
 * Filters by difficulty, excludes seen/sessionDealt cards, and relaxes
 * constraints gracefully when not enough cards are available.
 */
export function buildFixedRoundDeck(
  pool: Card[],
  seen: Set<string>,
  sessionDealt: Set<string>,
  roundLen: RoundLength,
  filter: DifficultyFilter,
): Card[] {
  // Step 1: apply difficulty filter
  let candidates = filter === 'all' ? pool : pool.filter(c => c.diff === filter);

  // Step 2: exclude seen and sessionDealt
  let available = candidates.filter(c => !seen.has(c.id) && !sessionDealt.has(c.id));

  // Relaxation: drop sessionDealt constraint
  if (available.length < roundLen) {
    available = candidates.filter(c => !seen.has(c.id));
  }

  // Relaxation: drop seen constraint
  if (available.length < roundLen) {
    available = candidates;
  }

  // Relaxation: drop difficulty filter
  if (available.length < roundLen && filter !== 'all') {
    available = pool.filter(c => !seen.has(c.id) && !sessionDealt.has(c.id));
    if (available.length < roundLen) {
      available = pool.filter(c => !seen.has(c.id));
    }
    if (available.length < roundLen) {
      available = pool;
    }
  }

  const shuffled = shuffle(available);
  const dealt = shuffled.slice(0, roundLen);
  for (const c of dealt) sessionDealt.add(c.id);
  return dealt;
}

export function buildPartyDeck(pool: Card[], sessionDealt: Set<string>, seen: string[]): Card[] {
  const available = filterSeen(pool, seen, sessionDealt);
  const easy = shuffle(available.filter((c) => c.diff === 'easy')).slice(0, 4);
  const medium = shuffle(available.filter((c) => c.diff === 'medium')).slice(0, 4);
  const hard = shuffle(available.filter((c) => c.diff === 'hard')).slice(0, 4);
  const dealt = [...easy, ...medium, ...hard]; // ordered: easy→medium→hard for warmup curve
  for (const c of dealt) sessionDealt.add(c.id);
  return dealt;
}

export function buildEndlessDeck(pool: Card[], sessionDealt: Set<string>, seen: string[]): Card[] {
  const dealt = shuffle(filterSeen(pool, seen, sessionDealt));
  for (const c of dealt) sessionDealt.add(c.id);
  return dealt;
}

/**
 * Pick a single card for endless mode based on current streak.
 * Difficulty ramp: streak 0-2 = easy only, 3-5 = easy+medium, 6+ = all.
 * Falls back to any available card if the target difficulty pool is exhausted.
 */
export function pickEndlessCard(
  pool: Card[],
  sessionDealt: Set<string>,
  seen: string[],
  streak: number,
): Card | null {
  const available = filterSeen(pool, seen, sessionDealt);
  if (available.length === 0) return null;

  let allowed: Card[];
  if (streak >= 6) {
    allowed = available; // all difficulties
  } else if (streak >= 3) {
    allowed = available.filter((c) => c.diff === 'easy' || c.diff === 'medium');
  } else {
    allowed = available.filter((c) => c.diff === 'easy');
  }

  // Fallback: if no cards in the target difficulty pool, use any available card
  if (allowed.length === 0) allowed = available;

  const pick = allowed[Math.floor(Math.random() * allowed.length)];
  sessionDealt.add(pick.id);
  return pick;
}
