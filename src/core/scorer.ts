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

export function getVerdict(correctCount: number, totalPlayed: number): { title: string; verdict: string } {
  const pct = totalPlayed > 0 ? (correctCount / totalPlayed) * 100 : 0;
  if (pct >= 90) return { title: 'Legendary!', verdict: 'You are the ultimate Bollywood/Tollywood buff. Take a bow.' };
  if (pct >= 70) return { title: 'Impressive!', verdict: 'You clearly know your movies. Almost perfect.' };
  if (pct >= 50) return { title: 'Not bad!', verdict: 'Decent knowledge, but there is room to grow.' };
  if (pct >= 25) return { title: 'Keep trying!', verdict: 'You got some, missed some. Watch more movies!' };
  return { title: 'Oof.', verdict: 'Those plots were too terrible even for you. Try again!' };
}

export function getLeaderboard(players: Player[]): Player[] {
  return [...players].sort((a, b) => b.score - a.score);
}
