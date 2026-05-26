
REVOKE EXECUTE ON FUNCTION public.provider_matches_request(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.provider_matches_request(uuid, uuid) TO authenticated;
