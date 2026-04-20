/**
 * Client-side, fire-and-forget writers for user-generated content:
 * suggestions, feedback, and card reports.
 *
 * All three calls are non-blocking and swallow errors. The UI should
 * optimistically show "thanks!" after calling these. We never throw.
 *
 * Each session gets a single random `session_id` stored in sessionStorage
 * so the three tables can be joined server-side for a given visit.
 *
 * The Supabase client itself is loaded as a UMD bundle in index.html
 * (window.supabase) and instantiated lazily here using the same
 * VITE_SUPABASE_* env vars as src/hooks/gameInstance.ts.
 */

type SupabaseInsertResponse = Promise<{ error: unknown }>;
interface SupabaseLikeClient {
  from(table: string): {
    insert(data: Record<string, unknown> | Record<string, unknown>[]): SupabaseInsertResponse;
  };
}

const SESSION_KEY = 'bbp_session_id';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://wmfxkkgktmfsipiihsjq.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

let cachedClient: SupabaseLikeClient | null | undefined;

/** Get (or create) a stable per-visit session id. */
export function getSessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    // sessionStorage blocked (Safari private, etc). Stable-ish fallback.
    return `nostorage-${Date.now().toString(36)}`;
  }
}

function getClient(): SupabaseLikeClient | null {
  if (cachedClient !== undefined) return cachedClient;
  try {
    const win = window as unknown as { supabase?: { createClient: (url: string, key: string) => SupabaseLikeClient } };
    if (!win.supabase || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
      cachedClient = null;
      return cachedClient;
    }
    cachedClient = win.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch {
    cachedClient = null;
  }
  return cachedClient;
}

const writeTimestamps = new Map<string, number>();
const THROTTLE_MS = 5_000;

function fireAndForgetInsert(table: string, row: Record<string, unknown>): void {
  const now = Date.now();
  const lastWrite = writeTimestamps.get(table) ?? 0;
  if (now - lastWrite < THROTTLE_MS) return;
  writeTimestamps.set(table, now);

  const client = getClient();
  if (!client) return;
  try {
    client
      .from(table)
      .insert(row)
      .then((res) => {
        if (res && res.error) {
          // eslint-disable-next-line no-console
          console.warn(`[feedback] ${table} insert error`, res.error);
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn(`[feedback] ${table} insert threw`, err);
      });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`[feedback] ${table} call threw`, err);
  }
}

// ---------------------------------------------------------------
// Public API
// ---------------------------------------------------------------

export type SuggestIndustry = 'BW' | 'TW' | 'other';

export interface SubmitSuggestionInput {
  title: string;
  submitterName?: string;
  industry?: SuggestIndustry;
}

export function submitSuggestion(input: SubmitSuggestionInput): void {
  const title = input.title?.trim();
  if (!title) return;
  fireAndForgetInsert('suggestions', {
    movie_title: title.slice(0, 200),
    submitter_name: input.submitterName?.trim().slice(0, 80) || null,
    industry: input.industry ?? null,
    session_id: getSessionId(),
  });
}

export interface SubmitFeedbackInput {
  message: string;
  submitterName?: string;
}

export function submitFeedback(input: SubmitFeedbackInput): void {
  const message = input.message?.trim();
  if (!message) return;
  fireAndForgetInsert('feedback', {
    message: message.slice(0, 2000),
    submitter_name: input.submitterName?.trim().slice(0, 80) || null,
    session_id: getSessionId(),
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 500) : null,
  });
}

export type ReportReason =
  | 'wrong'
  | 'typo'
  | 'spoiler'
  | 'offensive'
  | 'too-easy'
  | 'too-hard'
  | 'other';

export interface SubmitReportInput {
  cardId: string;
  cardNum?: string;
  reason: ReportReason;
}

export function submitReport(input: SubmitReportInput): void {
  if (!input.cardId || !input.reason) return;
  fireAndForgetInsert('reports', {
    card_id: input.cardId,
    card_num: input.cardNum ?? null,
    reason: input.reason,
    session_id: getSessionId(),
  });
}
