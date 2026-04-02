import type { StorageAdapter } from './interface';
import type { GameSession, FeedbackEntry, SuggestionEntry, AnalyticsEvent } from '../core/types';

interface SupabaseClient {
  from(table: string): { insert(data: unknown): { then(cb: () => void): { catch(cb: () => void): void } } };
}

export class SupabaseAdapter implements StorageAdapter {
  constructor(
    private client: SupabaseClient | null,
    private fallback: StorageAdapter,
  ) {}

  // Reads delegate to fallback
  getSeenCards(): string[] { return this.fallback.getSeenCards(); }
  markCardsSeen(cardIds: string[]): void { this.fallback.markCardsSeen(cardIds); }
  clearSeenCards(): void { this.fallback.clearSeenCards(); }
  getHighScore(): number { return this.fallback.getHighScore(); }
  setHighScore(score: number): void { this.fallback.setHighScore(score); }
  getEventBuffer(): AnalyticsEvent[] { return this.fallback.getEventBuffer(); }
  clearEventBuffer(): void { this.fallback.clearEventBuffer(); }
  logEvent(event: AnalyticsEvent): void { this.fallback.logEvent(event); }

  // Writes go to both Supabase and fallback
  saveSession(session: GameSession): void {
    this.fallback.saveSession(session);
    this.dbInsert('sessions', {
      session_id: session.sessionId,
      mode: session.mode,
      game_mode: session.gameMode,
      total_pts: session.totalPts,
      correct_count: session.correctCount,
      total_played: session.totalPlayed,
      pct: session.pct,
      reason: session.reason,
      player_count: session.playerCount,
    });
  }

  saveFeedback(entry: FeedbackEntry): void {
    this.fallback.saveFeedback(entry);
    this.dbInsert('feedback', {
      tags: entry.tags,
      text: entry.text,
      session_id: entry.sessionId,
    });
  }

  saveSuggestion(entry: SuggestionEntry): void {
    this.fallback.saveSuggestion(entry);
    this.dbInsert('suggestions', {
      movie_name: entry.movie,
      industry: entry.industry,
      session_id: entry.sessionId,
    });
  }

  private dbInsert(table: string, data: Record<string, unknown>): void {
    if (!this.client) return;
    try {
      this.client.from(table).insert(data).then(() => {}).catch(() => {});
    } catch { /* fire-and-forget */ }
  }
}
