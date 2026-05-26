-- Add onboarding flag to profiles
ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- =========================
-- Categories
-- =========================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories readable by all" ON public.categories
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

INSERT INTO public.categories (slug, name, description) VALUES
  ('events', 'Events & Entertainment', 'Weddings, parties, corporate events, MCs, DJs'),
  ('transport', 'Transport & Logistics', 'Airport transfers, moving, deliveries'),
  ('visa-docs', 'Visa & Business Documents', 'Visa assistance, registrations, permits'),
  ('home-services', 'Home Services', 'Cleaning, repairs, maintenance'),
  ('personal', 'Personal Services', 'Beauty, wellness, tutoring'),
  ('professional', 'Professional Services', 'Legal, accounting, consulting');

-- =========================
-- Client profiles
-- =========================
CREATE TABLE public.client_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  city TEXT,
  preferred_contact TEXT CHECK (preferred_contact IN ('email','phone','whatsapp')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients view own profile" ON public.client_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all client profiles" ON public.client_profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Clients insert own profile" ON public.client_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Clients update own profile" ON public.client_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER client_profiles_updated_at
  BEFORE UPDATE ON public.client_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- Provider profiles
-- =========================
CREATE TABLE public.provider_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  city TEXT,
  phone TEXT,
  bio TEXT,
  website TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verified providers public" ON public.provider_profiles
  FOR SELECT TO anon, authenticated USING (verified = true);
CREATE POLICY "Providers view own profile" ON public.provider_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all providers" ON public.provider_profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Providers insert own profile" ON public.provider_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Providers update own profile" ON public.provider_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins update providers" ON public.provider_profiles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER provider_profiles_updated_at
  BEFORE UPDATE ON public.provider_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- Requests
-- =========================
CREATE TYPE public.request_status AS ENUM ('open','in_review','awarded','closed','cancelled');

CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  city TEXT,
  budget NUMERIC(12,2),
  needed_by DATE,
  status public.request_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_requests_client ON public.requests(client_id);
CREATE INDEX idx_requests_status ON public.requests(status);

CREATE POLICY "Clients see own requests" ON public.requests
  FOR SELECT TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "Providers see open requests" ON public.requests
  FOR SELECT TO authenticated
  USING (status = 'open' AND public.has_role(auth.uid(), 'service_provider'));
CREATE POLICY "Admins see all requests" ON public.requests
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Clients insert requests" ON public.requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = client_id AND public.has_role(auth.uid(), 'client'));
CREATE POLICY "Clients update own requests" ON public.requests
  FOR UPDATE TO authenticated USING (auth.uid() = client_id);

CREATE TRIGGER requests_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- Quotes
-- =========================
CREATE TYPE public.quote_status AS ENUM ('submitted','accepted','rejected','withdrawn');

CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  message TEXT,
  status public.quote_status NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (request_id, provider_id)
);
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_quotes_request ON public.quotes(request_id);
CREATE INDEX idx_quotes_provider ON public.quotes(provider_id);

CREATE POLICY "Provider sees own quotes" ON public.quotes
  FOR SELECT TO authenticated USING (auth.uid() = provider_id);
CREATE POLICY "Client sees quotes on own requests" ON public.quotes
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.requests r WHERE r.id = request_id AND r.client_id = auth.uid()));
CREATE POLICY "Admins see all quotes" ON public.quotes
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Providers submit quotes" ON public.quotes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = provider_id AND public.has_role(auth.uid(), 'service_provider'));
CREATE POLICY "Providers update own quotes" ON public.quotes
  FOR UPDATE TO authenticated USING (auth.uid() = provider_id);
CREATE POLICY "Clients update quotes on own requests" ON public.quotes
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.requests r WHERE r.id = request_id AND r.client_id = auth.uid()));

CREATE TRIGGER quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- Bookings
-- =========================
CREATE TYPE public.booking_status AS ENUM ('pending','confirmed','in_progress','completed','cancelled','refunded');

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id UUID REFERENCES public.requests(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  scheduled_for TIMESTAMPTZ,
  amount NUMERIC(12,2) NOT NULL,
  deposit_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_type TEXT NOT NULL DEFAULT 'deposit' CHECK (payment_type IN ('deposit','full')),
  status public.booking_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_bookings_client ON public.bookings(client_id);
CREATE INDEX idx_bookings_provider ON public.bookings(provider_id);

CREATE POLICY "Booking parties see booking" ON public.bookings
  FOR SELECT TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = provider_id);
CREATE POLICY "Admins see all bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Clients create bookings" ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = client_id AND public.has_role(auth.uid(), 'client'));
CREATE POLICY "Parties update booking" ON public.bookings
  FOR UPDATE TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = provider_id);

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- Reviews
-- =========================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_reviews_provider ON public.reviews(provider_id);

CREATE POLICY "Reviews readable by all" ON public.reviews
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Clients post own review" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = client_id
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id AND b.client_id = auth.uid() AND b.status = 'completed'
    )
  );
CREATE POLICY "Clients update own review" ON public.reviews
  FOR UPDATE TO authenticated USING (auth.uid() = client_id);

-- =========================
-- Login events (audit)
-- =========================
CREATE TABLE public.login_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role,
  user_agent TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.login_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_login_events_user ON public.login_events(user_id);
CREATE INDEX idx_login_events_time ON public.login_events(occurred_at DESC);

CREATE POLICY "Users see own logins" ON public.login_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins see all logins" ON public.login_events
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Users insert own login" ON public.login_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
