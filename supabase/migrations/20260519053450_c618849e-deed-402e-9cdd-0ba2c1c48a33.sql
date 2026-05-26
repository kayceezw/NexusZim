
-- Add client contact snapshot on requests (set at insert time by client)
ALTER TABLE public.requests
  ADD COLUMN IF NOT EXISTS client_name text,
  ADD COLUMN IF NOT EXISTS client_phone text,
  ADD COLUMN IF NOT EXISTS client_email text,
  ADD COLUMN IF NOT EXISTS client_whatsapp text;

-- Add whatsapp to provider profiles
ALTER TABLE public.provider_profiles
  ADD COLUMN IF NOT EXISTS whatsapp text;

-- Helper: does the current provider's category match this request?
CREATE OR REPLACE FUNCTION public.provider_matches_request(_user_id uuid, _category_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.provider_profiles
    WHERE user_id = _user_id AND category_id = _category_id
  )
$$;

-- Replace the broad "providers see all open requests" policy with a category-scoped one
DROP POLICY IF EXISTS "Providers see open requests" ON public.requests;

CREATE POLICY "Providers see matching open requests"
ON public.requests
FOR SELECT
TO authenticated
USING (
  status = 'open'
  AND has_role(auth.uid(), 'service_provider'::app_role)
  AND public.provider_matches_request(auth.uid(), category_id)
);
