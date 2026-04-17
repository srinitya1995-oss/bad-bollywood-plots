import type { Player } from '../core/types';
import type { LastResult, SessionSnapshot } from './gameInstance';

const SESSION_STORAGE_KEY = 'badDesiPlots.v8';

export interface ResumeData {
  players: Player[];
  scores: number[];
  cardIdx: number;
  readerIdx: number;
  lastResult: LastResult | null;
  sessionId: string;
}

/** Validates that the parsed JSON has the expected SessionSnapshot shape. */
function isValidSnapshot(data: unknown): data is SessionSnapshot {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.players)) return false;
  if (!Array.isArray(obj.scores)) return false;
  if (typeof obj.cardIdx !== 'number') return false;
  if (typeof obj.readerIdx !== 'number') return false;
  if (typeof obj.sessionId !== 'string') return false;
  // lastResult can be null or an object with card, winnerIdx, correct
  if (obj.lastResult !== null) {
    if (typeof obj.lastResult !== 'object') return false;
    const lr = obj.lastResult as Record<string, unknown>;
    if (typeof lr.winnerIdx !== 'number') return false;
    if (typeof lr.correct !== 'boolean') return false;
    if (typeof lr.card !== 'object' || lr.card === null) return false;
  }
  return true;
}

/**
 * Hook to check for a resumable game session stored in sessionStorage.
 * Returns canResume flag, typed resume data, and a clearResume function.
 */
export function useResumeSession(): { canResume: boolean; resumeData: ResumeData | null; clearResume: () => void } {
  let resumeData: ResumeData | null = null;

  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isValidSnapshot(parsed)) {
        resumeData = {
          players: parsed.players,
          scores: parsed.scores,
          cardIdx: parsed.cardIdx,
          readerIdx: parsed.readerIdx,
          lastResult: parsed.lastResult,
          sessionId: parsed.sessionId,
        };
      }
    }
  } catch {
    // Corrupted or unavailable sessionStorage
  }

  const clearResume = (): void => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // sessionStorage unavailable
    }
  };

  return {
    canResume: resumeData !== null,
    resumeData,
    clearResume,
  };
}
