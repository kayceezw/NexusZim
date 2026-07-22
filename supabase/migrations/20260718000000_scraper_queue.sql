-- Scraper lead queue — holds raw results before admin review
CREATE TABLE IF NOT EXISTS public.scraper_queue (
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

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'scraper_queue' AND policyname = 'Admins manage scraper_queue'
  ) THEN
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
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_scraper_queue_status ON public.scraper_queue(status);
CREATE INDEX IF NOT EXISTS idx_scraper_queue_scraped_at ON public.scraper_queue(scraped_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_scraper_queue_dedup ON public.scraper_queue(business_name, source_url);
