-- Reset categories to match site catalog
DELETE FROM public.categories;

INSERT INTO public.categories (slug, name, description) VALUES
  ('elite', 'Elite Concierge', 'Discreet, high-touch services for VIP clients.'),
  ('events', 'Events & Production', 'Plan, produce, and run unforgettable events.'),
  ('documentation', 'Visa & Business Docs', 'Documentation support, done right.'),
  ('transport', 'Transport & Logistics', 'Move people and goods, on time.'),
  ('personal', 'Personal & Lifestyle', 'Look good. Feel good. Locally.'),
  ('business', 'Business & Professional', 'Specialists for everything else.');

-- Services catalog
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC(12,2),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_services_category ON public.services(category_id);

CREATE POLICY "Services readable by all" ON public.services
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage services" ON public.services
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Seed services
INSERT INTO public.services (category_id, name, base_price) VALUES
  -- elite
  ((SELECT id FROM public.categories WHERE slug='elite'), 'Personal concierge & lifestyle management', 1500),
  ((SELECT id FROM public.categories WHERE slug='elite'), 'VIP liaison & protocol handling', 1200),
  ((SELECT id FROM public.categories WHERE slug='elite'), 'Private event planning & full production', 3500),
  ((SELECT id FROM public.categories WHERE slug='elite'), 'Executive transport & airport meet-and-greet', 250),
  ((SELECT id FROM public.categories WHERE slug='elite'), 'Personal security & crowd control', 800),
  ((SELECT id FROM public.categories WHERE slug='elite'), 'Premium travel & visa coordination', 600),
  ((SELECT id FROM public.categories WHERE slug='elite'), 'Luxury gifting & surprise experiences', 400),
  ((SELECT id FROM public.categories WHERE slug='elite'), 'Private chef, catering & fine dining', 450),
  ((SELECT id FROM public.categories WHERE slug='elite'), 'Wardrobe, styling & grooming', 300),
  ((SELECT id FROM public.categories WHERE slug='elite'), 'Short-notice hotel, venue & transport bookings', 200),
  -- events
  ((SELECT id FROM public.categories WHERE slug='events'), 'Event planning (full coordination)', 800),
  ((SELECT id FROM public.categories WHERE slug='events'), 'Day-of event coordination', 350),
  ((SELECT id FROM public.categories WHERE slug='events'), 'Production & AV (sound, stage, lighting)', 600),
  ((SELECT id FROM public.categories WHERE slug='events'), 'MC & hosting', 200),
  ((SELECT id FROM public.categories WHERE slug='events'), 'Décor & styling', 400),
  ((SELECT id FROM public.categories WHERE slug='events'), 'Event security & VIP liaison', 300),
  ((SELECT id FROM public.categories WHERE slug='events'), 'Catering for events', 15),
  ((SELECT id FROM public.categories WHERE slug='events'), 'DJ services', 250),
  ((SELECT id FROM public.categories WHERE slug='events'), 'Photography & videography', 400),
  -- documentation
  ((SELECT id FROM public.categories WHERE slug='documentation'), 'UK visa application support', 120),
  ((SELECT id FROM public.categories WHERE slug='documentation'), 'Schengen visa application support', 100),
  ((SELECT id FROM public.categories WHERE slug='documentation'), 'USA visa application support', 150),
  ((SELECT id FROM public.categories WHERE slug='documentation'), 'SADC visa application support', 80),
  ((SELECT id FROM public.categories WHERE slug='documentation'), 'Work permit application support', 200),
  ((SELECT id FROM public.categories WHERE slug='documentation'), 'PBC company registration support', 180),
  ((SELECT id FROM public.categories WHERE slug='documentation'), 'PVT company registration support', 250),
  ((SELECT id FROM public.categories WHERE slug='documentation'), 'NGO registration support', 350),
  ((SELECT id FROM public.categories WHERE slug='documentation'), 'ZIMRA compliance support', 150),
  ((SELECT id FROM public.categories WHERE slug='documentation'), 'Annual returns filing', 90),
  -- transport
  ((SELECT id FROM public.categories WHERE slug='transport'), 'Airport transfer (Harare)', 35),
  ((SELECT id FROM public.categories WHERE slug='transport'), 'Airport transfer (Victoria Falls)', 60),
  ((SELECT id FROM public.categories WHERE slug='transport'), 'Chauffeur service (half day)', 80),
  ((SELECT id FROM public.categories WHERE slug='transport'), 'Chauffeur service (full day)', 150),
  ((SELECT id FROM public.categories WHERE slug='transport'), 'Executive transport (event)', 120),
  ((SELECT id FROM public.categories WHERE slug='transport'), 'Same-day inter-city delivery', 45),
  ((SELECT id FROM public.categories WHERE slug='transport'), 'Pallet & freight logistics', 200),
  ((SELECT id FROM public.categories WHERE slug='transport'), 'Last-mile parcel delivery', 15),
  -- personal
  ((SELECT id FROM public.categories WHERE slug='personal'), 'Barbering (in-shop)', 12),
  ((SELECT id FROM public.categories WHERE slug='personal'), 'At-home barbering', 25),
  ((SELECT id FROM public.categories WHERE slug='personal'), 'Grooming package (beard sculpt + cut)', 20),
  ((SELECT id FROM public.categories WHERE slug='personal'), 'Bridal makeup', 80),
  ((SELECT id FROM public.categories WHERE slug='personal'), 'Event makeup', 45),
  ((SELECT id FROM public.categories WHERE slug='personal'), 'Lashes & nails', 30),
  ((SELECT id FROM public.categories WHERE slug='personal'), 'Massage therapy (at-home)', 50),
  ((SELECT id FROM public.categories WHERE slug='personal'), 'Personal training session', 25),
  -- business
  ((SELECT id FROM public.categories WHERE slug='business'), 'Brand strategy & identity', 600),
  ((SELECT id FROM public.categories WHERE slug='business'), 'Website design & development', 800),
  ((SELECT id FROM public.categories WHERE slug='business'), 'Social media management (monthly)', 300),
  ((SELECT id FROM public.categories WHERE slug='business'), 'IT support (per hour)', 30),
  ((SELECT id FROM public.categories WHERE slug='business'), 'Monthly bookkeeping (small business)', 90),
  ((SELECT id FROM public.categories WHERE slug='business'), 'Payroll services', 60),
  ((SELECT id FROM public.categories WHERE slug='business'), 'Business consulting (per session)', 150),
  ((SELECT id FROM public.categories WHERE slug='business'), 'Legal admin & contracts review', 120);

-- Attach service to requests
ALTER TABLE public.requests
  ADD COLUMN service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  ADD COLUMN service_name TEXT;
