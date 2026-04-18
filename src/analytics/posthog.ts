/**
 * PostHog analytics layer for the Bad Bollywood Plots React app.
 *
 * -----------------------------------------------------------------
 * Feature flags to create in the PostHog UI (project 356713):
 *   - `solo_mode_enabled`        (boolean, default true)  — gates the
 *     "Play Solo" home screen affordance so we can cut it without a
 *     ship if it tanks retention.
 *   - `settings_screen_enabled`  (boolean, default true)  — gates the
 *     whole Settings surface; useful while we iterate post-launch.
 *   - `report_flow_v2`           (boolean, default true)  — enables the
 *     new inline card report flow vs. the old bottom-sheet version.
 *
 * Use `isFeatureEnabled(flag)` from anywhere in the app; it reads
 * PostHog's locally-evaluated flag state and falls back to `false`
 * if PostHog has not loaded yet.
 * -----------------------------------------------------------------
 *
 * Events are emitted via two paths:
 *   1. `track.*` — strongly-typed wrappers for UI code that needs to
 *      fire an explicit event (suggestions, reports, settings, etc).
 *   2. `initAnalyticsSubscriber(bus, sessionId)` — bridges the game
 *      eventBus to PostHog so components never have to call `track.*`
 *      for core game loop events. Each bus event is mapped to a
 *      canonical PostHog event name below.
 */

import type { TypedEventBus } from '../core/eventBus';
import type { GameMode, Industry, Difficulty } from '../core/types';

declare global {
  interface Window {
    posthog?: {
      init(token: string, config: Record<string, unknown>): void;
      capture(event: string, props?: Record<string, unknown>): void;
      isFeatureEnabled?(flag: string): boolean | undefined;
      getFeatureFlag?(flag: string): string | boolean | undefined;
      onFeatureFlags?(cb: () => void): void;
    };
  }
}

type Filter = 'all' | 'easy' | 'medium' | 'hard';

const POSTHOG_TOKEN = import.meta.env.VITE_POSTHOG_TOKEN ?? '';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST ?? 'https://us.i.posthog.com';

let currentSessionId: string | null = null;

// ---------------------------------------------------------------
// Bootstrapping
// ---------------------------------------------------------------

export function initPostHog(): void {
  if (!POSTHOG_TOKEN) {
    // No token in this environment (local dev without .env values). Skip init
    // so we don't spam the console with 400s from missing project credentials.
    return;
  }
  try {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = `${POSTHOG_HOST}/static/array.js`;
    document.head.appendChild(script);

    script.onload = () => {
      window.posthog?.init(POSTHOG_TOKEN, {
        api_host: POSTHOG_HOST,
        autocapture: false,
        capture_pageview: true,
        persistence: 'localStorage',
      });
    };
  } catch {
    /* analytics non-critical */
  }
}

function capture(event: string, props: object = {}): void {
  try {
    window.posthog?.capture(event, {
      ...(props as Record<string, unknown>),
      session: currentSessionId,
      ts: Date.now(),
    });
  } catch {
    /* non-critical */
  }
}

// ---------------------------------------------------------------
// Typed track wrappers (for explicit, UI-triggered events)
// ---------------------------------------------------------------

export interface RoundStartProps {
  mode: Industry | 'mixed';
  playerCount: number;
  roundLen: number;
  difficultyFilter: Filter;
}

export interface CardFlippedProps {
  cardId: string;
  industry: Industry;
  difficulty: Difficulty;
}

export interface AwardProps {
  cardId: string;
  winnerIdx: number;
  points: number;
  readerIdx: number;
}

export interface NobodyScoredProps {
  cardId: string;
}

export interface RoundEndProps {
  mode: GameMode;
  plotsPlayed: number;
  winnerIdx: number;
  totalPts: number;
  tieCount: number;
}

export interface ReportSentProps {
  cardId: string;
  reason: string;
}

export interface SuggestSentProps {
  title: string;
}

export interface FeedbackSentProps {
  messageLength: number;
}

export interface SettingsChangedProps {
  key: string;
  value: string | number | boolean;
}

export const track = {
  roundStart: (p: RoundStartProps) => capture('round_start', p),
  cardFlipped: (p: CardFlippedProps) => capture('card_flipped', p),
  award: (p: AwardProps) => capture('award', p),
  nobodyScored: (p: NobodyScoredProps) => capture('nobody_scored', p),
  roundEnd: (p: RoundEndProps) => capture('round_end', p),
  reportSent: (p: ReportSentProps) => capture('report_sent', p),
  suggestSent: (p: SuggestSentProps) =>
    capture('suggest_sent', { titleLength: p.title.length }), // titles not PII but keep length for funnels
  feedbackSent: (p: FeedbackSentProps) => capture('feedback_sent', p),
  settingsChanged: (p: SettingsChangedProps) => capture('settings_changed', p),
  resumeUsed: () => capture('resume_used'),
};

// ---------------------------------------------------------------
// Feature flags
// ---------------------------------------------------------------

export type FeatureFlag =
  | 'solo_mode_enabled'
  | 'settings_screen_enabled'
  | 'report_flow_v2';

const FLAG_DEFAULTS: Record<FeatureFlag, boolean> = {
  solo_mode_enabled: true,
  settings_screen_enabled: true,
  report_flow_v2: true,
};

/**
 * Check a PostHog feature flag synchronously.
 * Falls back to the compile-time default if PostHog isn't loaded yet.
 */
export function isFeatureEnabled(flag: FeatureFlag | string): boolean {
  try {
    const v = window.posthog?.isFeatureEnabled?.(flag);
    if (typeof v === 'boolean') return v;
  } catch {
    /* non-critical */
  }
  return FLAG_DEFAULTS[flag as FeatureFlag] ?? false;
}

/** Register a callback fired once flags have resolved from the network. */
export function onFeatureFlagsReady(cb: () => void): void {
  try {
    window.posthog?.onFeatureFlags?.(cb);
  } catch {
    /* non-critical */
  }
}

// ---------------------------------------------------------------
// Bus subscriber — bridges the game eventBus to PostHog
// ---------------------------------------------------------------

export function initAnalyticsSubscriber(bus: TypedEventBus, sessionId: string): void {
  currentSessionId = sessionId;

  bus.on('game:started', (data) => {
    track.roundStart({
      mode: data.mode,
      playerCount: data.playerCount,
      roundLen: data.gameMode === 'endless' ? -1 : 12,
      difficultyFilter: 'all',
    });
  });

  bus.on('card:loaded', (data) => {
    capture('card_view', data);
  });

  bus.on('card:flipped', (data) => {
    // The bus only carries cardId + idx; industry/difficulty are filled
    // in by the UI layer for richer events via `track.cardFlipped` if
    // needed. We still record the lightweight version here.
    capture('card_flip', data);
  });

  bus.on('score:updated', (data) => {
    capture('card_result', data);
    if (data.result === 'miss' || data.result === 'skip') {
      // Miss/skip in a multiplayer round equals "nobody scored" for that card.
      // The UI layer emits the richer `award` event when a specific player claims the card.
      // Here we just record the low-level FSM signal.
    }
  });

  bus.on('game:ended', (data) => {
    track.roundEnd({
      mode: 'party', // overridden by UI layer when richer context is available
      plotsPlayed: data.totalPlayed,
      winnerIdx: 0,
      totalPts: data.totalPts,
      tieCount: 0,
    });
    capture('game_end_raw', data);
  });

  bus.on('fsm:transition', (data) => capture('state_transition', data));
  bus.on('player:turn-changed', (data) => capture('turn_change', data));
  bus.on('deck:exhausted', (data) => capture('deck_exhausted', data));
}
