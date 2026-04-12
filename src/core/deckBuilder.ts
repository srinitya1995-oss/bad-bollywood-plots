import type { Card } from './types';

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
