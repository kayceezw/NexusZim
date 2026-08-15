-- ============================================================================
-- Platform analytics — privacy-friendly visitor counting.
-- Tracks page views + unique (anonymous) visitors so admins can see how many
-- people are visiting. visitor_id is a random client-generated id (no PII).
-- ============================================================================

-- Every page view (one row per navigation).
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  visitor_id TEXT,
  session_id TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per unique anonymous visitor (upserted) — lets us count unique
-- visitors with a cheap COUNT(*) instead of DISTINCT over every page view.
CREATE TABLE IF NOT EXISTS public.visitors (
  visitor_id TEXT PRIMARY KEY,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen  TIMESTAMPTZ NOT NULL DEFAULT now(),
  views INT NOT NULL DEFAULT 1
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) may LOG a view; nobody but admins may READ.
DROP POLICY IF EXISTS "Anyone logs a page view" ON public.page_views;
CREATE POLICY "Anyone logs a page view" ON public.page_views
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins read page views" ON public.page_views;
CREATE POLICY "Admins read page views" ON public.page_views
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Anyone upserts visitor" ON public.visitors;
CREATE POLICY "Anyone upserts visitor" ON public.visitors
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone updates own visitor row" ON public.visitors;
CREATE POLICY "Anyone updates own visitor row" ON public.visitors
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admins read visitors" ON public.visitors;
CREATE POLICY "Admins read visitors" ON public.visitors
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE INDEX IF NOT EXISTS idx_page_views_created ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor ON public.page_views(visitor_id);

-- Admin-only aggregate. SECURITY DEFINER (bypasses RLS) with an explicit role
-- guard so only admins can read the numbers.
CREATE OR REPLACE FUNCTION public.visit_stats()
RETURNS TABLE (
  total_views BIGINT,
  unique_visitors BIGINT,
  views_today BIGINT,
  visitors_today BIGINT,
  views_7d BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')) THEN
    RAISE EXCEPTION 'Forbidden: admin role required';
  END IF;

  RETURN QUERY
  SELECT
    (SELECT count(*) FROM public.page_views)::BIGINT,
    (SELECT count(*) FROM public.visitors)::BIGINT,
    (SELECT count(*) FROM public.page_views WHERE created_at >= date_trunc('day', now()))::BIGINT,
    (SELECT count(DISTINCT visitor_id) FROM public.page_views WHERE created_at >= date_trunc('day', now()))::BIGINT,
    (SELECT count(*) FROM public.page_views WHERE created_at >= now() - interval '7 days')::BIGINT;
END;
$$;

-- Atomically record a visit: insert the page view and upsert the visitor row.
-- Callable by anyone (anon visitors included); writes only analytics rows.
CREATE OR REPLACE FUNCTION public.record_visit(
  p_path TEXT,
  p_visitor_id TEXT,
  p_session_id TEXT,
  p_referrer TEXT,
  p_user_agent TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.page_views (path, visitor_id, session_id, referrer, user_agent)
  VALUES (left(p_path, 512), p_visitor_id, p_session_id, left(p_referrer, 512), left(p_user_agent, 512));

  IF p_visitor_id IS NOT NULL THEN
    INSERT INTO public.visitors (visitor_id) VALUES (p_visitor_id)
    ON CONFLICT (visitor_id)
    DO UPDATE SET last_seen = now(), views = public.visitors.views + 1;
  END IF;
END;
$$;
