-- Scraper lead queue — holds raw results before admin review
CREATE TABLE public.scraper_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  category_guess TEXT,
  city TEXT,
  phone TEXT,
  website TEXT,
  email TEXT,
  description TEXT,
  source_url TEXT NOT NULL,
  source_name TEXT NOT NULL DEFAULT 'web',
  raw_data JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'duplicate')),
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.scraper_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage scraper_queue" ON public.scraper_queue
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE INDEX idx_scraper_queue_status ON public.scraper_queue(status);
CREATE INDEX idx_scraper_queue_scraped_at ON public.scraper_queue(scraped_at DESC);
-- Prevent exact duplicates (same name + source URL)
CREATE UNIQUE INDEX idx_scraper_queue_dedup ON public.scraper_queue(business_name, source_url);
