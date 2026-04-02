export type Industry = 'BW' | 'TW';
export type GameMode = 'party' | 'endless';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameState =
  | 'home'
  | 'setup'
  | 'playing'
  | 'flipped'
  | 'scoring'
  | 'turnChange'
  | 'continue'
  | 'results';
export type EndReason = 'completed' | 'exit' | 'abandon' | 'lives-exhausted';

export interface Card {
  id: string;
  ind: Industry;
  diff: Difficulty;
  era: string;
  y: string;
  n: string;
  f: string;
  c: string;
}

export interface Player {
  name: string;
  score: number;
}

export interface GameSession {
  sessionId: string;
  mode: Industry;
  gameMode: GameMode;
  totalPts: number;
  correctCount: number;
  totalPlayed: number;
  pct: number;
  reason: EndReason;
  playerCount: number;
  timestamp: number;
}

export interface FeedbackEntry {
  tags: string[];
  text: string;
  timestamp: number;
  sessionId: string;
}

export interface SuggestionEntry {
  movie: string;
  industry: string;
  timestamp: number;
  sessionId: string;
}

export interface AnalyticsEvent {
  event: string;
  props: Record<string, unknown>;
  sessionId: string;
  timestamp: number;
}

export const POINT_MAP: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};
