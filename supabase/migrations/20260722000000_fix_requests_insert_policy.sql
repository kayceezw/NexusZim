-- Fix: allow any authenticated user to insert their own request.
-- The previous policy restricted inserts to users with the 'client' role,
-- which blocked service_providers from posting briefs and was unnecessary —
-- auth.uid() = client_id is the real security invariant here.
DROP POLICY IF EXISTS "Clients insert requests" ON public.requests;

CREATE POLICY "Authenticated users insert own requests" ON public.requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = client_id);
