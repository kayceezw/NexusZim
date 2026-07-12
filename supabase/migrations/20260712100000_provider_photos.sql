-- Add photos array to provider_profiles
ALTER TABLE public.provider_profiles
  ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

-- Storage bucket: provider photos (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('provider-photos', 'provider-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage bucket: site assets (hero background etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Providers can upload/delete their own photos (folder = their user_id)
CREATE POLICY "provider_photos_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'provider-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "provider_photos_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'provider-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "provider_photos_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'provider-photos');

-- Site assets: anyone reads, admins manage
CREATE POLICY "site_assets_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-assets');

CREATE POLICY "site_assets_manage" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'site-assets'
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'super_admin')
    )
  )
  WITH CHECK (
    bucket_id = 'site-assets'
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'super_admin')
    )
  );
