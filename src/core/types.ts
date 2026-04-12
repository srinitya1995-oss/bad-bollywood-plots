export type Industry = 'HI' | 'TE' | 'TA' | 'ML';

export interface IndustryMeta {
  label: string;
  lang: string;
  color: string;
  packId: string;
  comingSoon: boolean;
}

export const INDUSTRY_META: Record<Industry, IndustryMeta> = {
  HI: { label: 'Hindi Films', lang: 'Hindi', color: '--card-hi', packId: 'hi', comingSoon: false },
  TE: { label: 'Telugu Films', lang: 'Telugu', color: '--card-te', packId: 'te', comingSoon: false },
  TA: { label: 'Tamil Films', lang: 'Tamil', color: '--card-ta', packId: 'ta', comingSoon: true },
  ML: { label: 'Malayalam Films', lang: 'Malayalam', color: '--card-ml', packId: 'ml', comingSoon: true },
};
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
