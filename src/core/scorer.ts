import type { Card, Player } from './types';
import { POINT_MAP } from './types';

export interface ScorerState {
  totalPts: number;
  correctCount: number;
  streak: number;
  lives: number;
  players: Player[];
  currentPlayerIdx: number;
}

export function createScorerState(players: Player[], lives = 0): ScorerState {
  return { totalPts: 0, correctCount: 0, streak: 0, lives, players: players.map(p => ({ ...p })), currentPlayerIdx: 0 };
}

export function scoreCard(state: ScorerState, card: Card, result: 'correct' | 'miss' | 'skip'): ScorerState {
  const pts = POINT_MAP[card.diff] ?? 1;
  const next: ScorerState = { ...state, players: state.players.map(p => ({ ...p })) };

  if (result === 'correct') {
    next.correctCount += 1;
    next.streak += 1;
    const bonus = next.streak >= 7 ? 3 : next.streak >= 5 ? 2 : next.streak >= 3 ? 1 : 0;
    next.totalPts += pts + bonus;
    next.players[state.currentPlayerIdx].score += pts + bonus;
  } else if (result === 'miss') {
    next.streak = 0;
    if (state.lives > 0) next.lives = state.lives - 1;
  } else {
    next.streak = 0;
  }
  return next;
}

/** Pick a random element from an array. */
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface VerdictEntry { title: string; verdict: string }

const VERDICTS_90: readonly VerdictEntry[] = [
  { title: 'Interval Khatam, Full Marks!', verdict: 'Yeh toh Amitabh Bachchan level knowledge hai. Take your trophy and leave.' },
  { title: 'Blockbuster!', verdict: "You didn't just watch these movies, you lived in the theater. Respect." },
  { title: 'First Day First Show', verdict: "You've seen more movies than a film critic on a deadline. Seedha filmi encyclopedia." },
];

const VERDICTS_70: readonly VerdictEntry[] = [
  { title: 'Superhit!', verdict: 'Interval mein samosa lelo, second half mein full marks aayenge.' },
  { title: 'Mass Entertainer', verdict: "The multiplex crowd is impressed. The single-screen crowd says 'not bad, yaar.'" },
  { title: 'Weekend Collection: Strong', verdict: 'Your Bollywood knowledge has good opening numbers. Word of mouth will carry you.' },
];

const VERDICTS_50: readonly VerdictEntry[] = [
  { title: 'Average', verdict: 'Half the movie you understood, other half you slept through. Classic Monday show energy.' },
  { title: 'Paisa Vasool', verdict: "Got your money's worth, but nobody's writing a review about this performance." },
  { title: 'Interval Time', verdict: 'Theek hai, go get your popcorn and come back stronger.' },
];

const VERDICTS_25: readonly VerdictEntry[] = [
  { title: 'Flop Show', verdict: 'Bhai, have you actually WATCHED any movies or do you just scroll Netflix thumbnails?' },
  { title: 'Disaster', verdict: 'Your knowledge has the box office trajectory of a Vivek Oberoi solo film.' },
  { title: "Critic's Choice", verdict: "The critics will say 'ambitious attempt' which is Bollywood for 'flop.'" },
];

const VERDICTS_0: readonly VerdictEntry[] = [
  { title: 'Shelved', verdict: 'Netflix subscription cancel karo. Start from the beginning. Watch DDLJ first.' },
  { title: 'Censor Board Reject', verdict: 'This performance has been deemed unfit for public viewing.' },
  { title: 'Straight to OTT', verdict: "Not even a theatrical release. Straight to 'I'll watch it someday' list." },
];

/** Exported for testing — maps tier to its verdict variants. */
export const VERDICT_TIERS = {
  legendary: VERDICTS_90,
  impressive: VERDICTS_70,
  notBad: VERDICTS_50,
  keepTrying: VERDICTS_25,
  oof: VERDICTS_0,
} as const;

export function getVerdict(correctCount: number, totalPlayed: number): { title: string; verdict: string } {
  const pct = totalPlayed > 0 ? (correctCount / totalPlayed) * 100 : 0;
  if (pct >= 90) return pick(VERDICTS_90);
  if (pct >= 70) return pick(VERDICTS_70);
  if (pct >= 50) return pick(VERDICTS_50);
  if (pct >= 25) return pick(VERDICTS_25);
  return pick(VERDICTS_0);
}

export function getLeaderboard(players: Player[]): Player[] {
  return [...players].sort((a, b) => b.score - a.score);
}
