import type { GameSession, FeedbackEntry, SuggestionEntry, AnalyticsEvent } from '../core/types';

export interface StorageAdapter {
  getSeenCards(): string[];
  markCardsSeen(cardIds: string[]): void;
  clearSeenCards(): void;
  saveSession(session: GameSession): void;
  getHighScore(): number;
  setHighScore(score: number): void;
  saveFeedback(entry: FeedbackEntry): void;
  saveSuggestion(entry: SuggestionEntry): void;
  logEvent(event: AnalyticsEvent): void;
  getEventBuffer(): AnalyticsEvent[];
  clearEventBuffer(): void;
}
