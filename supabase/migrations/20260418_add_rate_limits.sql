-- Migration: add_rate_limits
-- Date: 2026-04-18
-- Purpose: Server-side rate limiting for anonymous inserts into feedback,
--          suggestions, and reports. Client-side throttle is bypassable —
--          this trigger is the real gate.
--
-- Policy: max 10 inserts per session_id per hour per table.
-- Rationale: a real human doesn't legitimately submit more than 10
--          suggestions or feedback notes in an hour. A bot spraying the
--          anon endpoint would trip the trigger and get a 500.
--
-- Rollback:
--   DROP TRIGGER IF EXISTS rate_limit_feedback_insert ON public.feedback;
--   DROP TRIGGER IF EXISTS rate_limit_suggestions_insert ON public.suggestions;
--   DROP TRIGGER IF EXISTS rate_limit_reports_insert ON public.reports;
--   DROP FUNCTION IF EXISTS public.enforce_session_rate_limit();

CREATE OR REPLACE FUNCTION public.enforce_session_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  recent_count int;
  max_per_hour int := 10;
BEGIN
  -- Count rows inserted by this session_id in the same table in the last hour.
  EXECUTE format(
    'SELECT count(*) FROM public.%I WHERE session_id = $1 AND created_at >= now() - interval ''1 hour''',
    TG_TABLE_NAME
  )
  INTO recent_count
  USING NEW.session_id;

  IF recent_count >= max_per_hour THEN
    RAISE EXCEPTION 'rate limit exceeded for session % on table %', NEW.session_id, TG_TABLE_NAME
      USING ERRCODE = '42P01'; -- distinct code for client logging
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS rate_limit_feedback_insert ON public.feedback;
CREATE TRIGGER rate_limit_feedback_insert
BEFORE INSERT ON public.feedback
FOR EACH ROW EXECUTE FUNCTION public.enforce_session_rate_limit();

DROP TRIGGER IF EXISTS rate_limit_suggestions_insert ON public.suggestions;
CREATE TRIGGER rate_limit_suggestions_insert
BEFORE INSERT ON public.suggestions
FOR EACH ROW EXECUTE FUNCTION public.enforce_session_rate_limit();

DROP TRIGGER IF EXISTS rate_limit_reports_insert ON public.reports;
CREATE TRIGGER rate_limit_reports_insert
BEFORE INSERT ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.enforce_session_rate_limit();
