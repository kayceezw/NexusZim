-- Add a dedicated WhatsApp field to client profiles so it can differ from phone.
ALTER TABLE public.client_profiles ADD COLUMN IF NOT EXISTS whatsapp TEXT;
