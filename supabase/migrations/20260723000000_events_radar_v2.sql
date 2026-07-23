-- events_radar v2 — adds scraper columns, indices, and auto-expiry function
-- Run backup.sh before applying this migration.

ALTER TABLE public.events_radar
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS organizer_name TEXT,
  ADD COLUMN IF NOT EXISTS ticket_url TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS scraped_at TIMESTAMPTZ;

-- Fast queries by the public events page
CREATE INDEX IF NOT EXISTS events_radar_date_idx ON public.events_radar(date);
CREATE INDEX IF NOT EXISTS events_radar_status_idx ON public.events_radar(status);

-- Deduplication index: one row per (title, date) combination
-- If a title appears on the same date from multiple scrapers we update in-place.
CREATE UNIQUE INDEX IF NOT EXISTS events_radar_title_date_dedup
  ON public.events_radar(title, date);

-- Auto-expire past events.
-- Call via: SELECT public.expire_past_events();
-- Suitable for a pg_cron job or a scheduled Cloudflare Worker.
CREATE OR REPLACE FUNCTION public.expire_past_events()
RETURNS int AS $$
DECLARE
  affected int;
BEGIN
  UPDATE public.events_radar
  SET status = 'expired'
  WHERE date < CURRENT_DATE AND status = 'upcoming';
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
