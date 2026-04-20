import type { StorageAdapter } from './interface';
import type { GameSession, FeedbackEntry, SuggestionEntry, AnalyticsEvent } from '../core/types';

const MAX_EVENTS = 500;

export class LocalStorageAdapter implements StorageAdapter {
  constructor(private storage: Storage) {}

  getSeenCards(): string[] {
    try { return JSON.parse(this.storage.getItem('sp_seen') || '[]'); }
    catch { return []; }
  }
  markCardsSeen(cardIds: string[]): void {
    const seen = this.getSeenCards();
    const updated = [...new Set([...seen, ...cardIds])];
    this.storage.setItem('sp_seen', JSON.stringify(updated));
  }
  clearSeenCards(): void { this.storage.removeItem('sp_seen'); }
  saveSession(session: GameSession): void {
    try {
      const sessions = JSON.parse(this.storage.getItem('sp_sessions') || '[]');
      sessions.push(session);
      this.storage.setItem('sp_sessions', JSON.stringify(sessions));
    } catch { /* non-critical */ }
  }
  getHighScore(): number { return parseInt(this.storage.getItem('sp_highScore') || '0', 10); }
  setHighScore(score: number): void { this.storage.setItem('sp_highScore', String(score)); }
  saveFeedback(entry: FeedbackEntry): void {
    try {
      const fb = JSON.parse(this.storage.getItem('sp_feedback') || '[]');
      fb.push(entry);
      this.storage.setItem('sp_feedback', JSON.stringify(fb));
    } catch { /* non-critical */ }
  }
  saveSuggestion(entry: SuggestionEntry): void {
    try {
      const suggestions = JSON.parse(this.storage.getItem('sp_suggestions') || '[]');
      suggestions.push(entry);
      this.storage.setItem('sp_suggestions', JSON.stringify(suggestions));
    } catch { /* non-critical */ }
  }
  logEvent(event: AnalyticsEvent): void {
    try {
      const events: AnalyticsEvent[] = JSON.parse(this.storage.getItem('sp_events') || '[]');
      events.push(event);
      if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
      this.storage.setItem('sp_events', JSON.stringify(events));
    } catch { /* non-critical */ }
  }
  getEventBuffer(): AnalyticsEvent[] {
    try { return JSON.parse(this.storage.getItem('sp_events') || '[]'); }
    catch { return []; }
  }
  clearEventBuffer(): void { this.storage.removeItem('sp_events'); }
}
