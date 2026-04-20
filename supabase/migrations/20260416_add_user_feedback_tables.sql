-- Migration: add_user_feedback_tables
-- Date: 2026-04-16
-- Purpose: Create tables backing the Suggest, Feedback, and Report flows
--          for the Bad Bollywood Plots production app. All tables accept
--          anonymous writes (fire-and-forget from the client) but only the
--          service role may read them.
--
-- Rollback:
--   DROP TABLE IF EXISTS public.reports;
--   DROP TABLE IF EXISTS public.feedback;
--   DROP TABLE IF EXISTS public.suggestions;
--   DROP TYPE IF EXISTS public.report_reason;
--   DROP TYPE IF EXISTS public.industry_code;

-- ============================================================
-- Enums
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'industry_code') THEN
    CREATE TYPE public.industry_code AS ENUM ('BW', 'TW', 'other');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_reason') THEN
    CREATE TYPE public.report_reason AS ENUM (
      'wrong', 'typo', 'spoiler', 'offensive', 'too-easy', 'too-hard', 'other'
    );
  END IF;
END$$;

-- ============================================================
-- suggestions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.suggestions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     timestamptz NOT NULL DEFAULT now(),
  movie_title    text NOT NULL CHECK (length(movie_title) BETWEEN 1 AND 200),
  submitter_name text CHECK (submitter_name IS NULL OR length(submitter_name) <= 80),
  industry       public.industry_code,
  session_id     text NOT NULL
);

CREATE INDEX IF NOT EXISTS suggestions_created_at_idx ON public.suggestions (created_at DESC);
CREATE INDEX IF NOT EXISTS suggestions_session_id_idx ON public.suggestions (session_id);

-- ============================================================
-- feedback
-- ============================================================

CREATE TABLE IF NOT EXISTS public.feedback (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     timestamptz NOT NULL DEFAULT now(),
  message        text NOT NULL CHECK (length(message) BETWEEN 1 AND 2000),
  submitter_name text CHECK (submitter_name IS NULL OR length(submitter_name) <= 80),
  session_id     text NOT NULL,
  user_agent     text
);

CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON public.feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS feedback_session_id_idx ON public.feedback (session_id);

-- ============================================================
-- reports
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reports (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  card_id    text NOT NULL,
  reason     public.report_reason NOT NULL,
  card_num   text,
  session_id text NOT NULL
);

CREATE INDEX IF NOT EXISTS reports_created_at_idx ON public.reports (created_at DESC);
CREATE INDEX IF NOT EXISTS reports_card_id_idx   ON public.reports (card_id);
CREATE INDEX IF NOT EXISTS reports_reason_idx    ON public.reports (reason);

-- ============================================================
-- Row Level Security
--   - Anonymous (anon) can INSERT only.
--   - Only service_role can SELECT.
--   - Nobody can UPDATE or DELETE from the client.
-- ============================================================

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports     ENABLE ROW LEVEL SECURITY;

-- suggestions policies
DROP POLICY IF EXISTS "anon_insert_suggestions"    ON public.suggestions;
DROP POLICY IF EXISTS "service_select_suggestions" ON public.suggestions;

CREATE POLICY "anon_insert_suggestions"
  ON public.suggestions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "service_select_suggestions"
  ON public.suggestions
  FOR SELECT
  TO service_role
  USING (true);

-- feedback policies
DROP POLICY IF EXISTS "anon_insert_feedback"    ON public.feedback;
DROP POLICY IF EXISTS "service_select_feedback" ON public.feedback;

CREATE POLICY "anon_insert_feedback"
  ON public.feedback
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "service_select_feedback"
  ON public.feedback
  FOR SELECT
  TO service_role
  USING (true);

-- reports policies
DROP POLICY IF EXISTS "anon_insert_reports"    ON public.reports;
DROP POLICY IF EXISTS "service_select_reports" ON public.reports;

CREATE POLICY "anon_insert_reports"
  ON public.reports
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "service_select_reports"
  ON public.reports
  FOR SELECT
  TO service_role
  USING (true);

-- ============================================================
-- Grants
--   Supabase normally grants full table privileges to anon/authenticated.
--   We keep INSERT only for anon and revoke the rest to belt-and-braces
--   the RLS policies above.
-- ============================================================

REVOKE ALL ON public.suggestions FROM anon, authenticated;
REVOKE ALL ON public.feedback    FROM anon, authenticated;
REVOKE ALL ON public.reports     FROM anon, authenticated;

GRANT INSERT ON public.suggestions TO anon, authenticated;
GRANT INSERT ON public.feedback    TO anon, authenticated;
GRANT INSERT ON public.reports     TO anon, authenticated;

GRANT ALL ON public.suggestions TO service_role;
GRANT ALL ON public.feedback    TO service_role;
GRANT ALL ON public.reports     TO service_role;
