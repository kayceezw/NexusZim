-- Add tier to provider_profiles
ALTER TABLE public.provider_profiles ADD COLUMN tier INT NOT NULL DEFAULT 1 CHECK (tier BETWEEN 1 AND 4);

-- Intelligence Hub
CREATE TABLE public.events_radar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  venue TEXT,
  city TEXT,
  genre TEXT,
  estimated_attendance TEXT,
  ticket_price_range TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events_radar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read events_radar" ON public.events_radar FOR SELECT USING (true);
CREATE POLICY "Admins manage events_radar" ON public.events_radar FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE public.venue_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_name TEXT NOT NULL,
  city TEXT,
  available_from DATE,
  available_to DATE,
  capacity INT,
  contact TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.venue_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read venue_availability" ON public.venue_availability FOR SELECT USING (true);
CREATE POLICY "Admins manage venue_availability" ON public.venue_availability FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE public.market_rate_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  rate_low NUMERIC(12,2),
  rate_high NUMERIC(12,2),
  unit TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.market_rate_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read market_rate_index" ON public.market_rate_index FOR SELECT USING (true);
CREATE POLICY "Admins manage market_rate_index" ON public.market_rate_index FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Monetization
CREATE TABLE public.featured_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(user_id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  position INT,
  active_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  active_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.featured_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read featured_listings" ON public.featured_listings FOR SELECT USING (true);
CREATE POLICY "Admins manage featured_listings" ON public.featured_listings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(user_id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('basic', 'pro', 'business')),
  status TEXT NOT NULL DEFAULT 'active',
  payment_confirmed_by UUID REFERENCES auth.users(id),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Providers see own subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = provider_id);
CREATE POLICY "Admins see all subscriptions" ON public.subscriptions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins manage subscriptions" ON public.subscriptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Concierge Mode
CREATE TABLE public.operator_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  event_type TEXT,
  provider_ids UUID[] NOT NULL,
  commission_pct NUMERIC(5,2),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.operator_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins see all operator_packages" ON public.operator_packages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins manage operator_packages" ON public.operator_packages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE public.brokered_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES public.operator_packages(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  event_date DATE,
  value NUMERIC(12,2),
  commission_earned NUMERIC(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brokered_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins see all brokered_deals" ON public.brokered_deals FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins manage brokered_deals" ON public.brokered_deals FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
