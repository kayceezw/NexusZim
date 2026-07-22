-- NexusZim Category Taxonomy v2
-- Adds parent/sub-category structure without breaking existing listings.
-- DO NOT run against production without reviewing with KC first.
--
-- What this does:
--   1. Adds a nullable `parent_id` to `categories` for the two-tier structure.
--   2. Adds `sub_category_slug` and `sub_category_name` columns to `services`
--      so existing services can be tagged to a sub-category without a FK constraint.
--   3. Inserts the 14 new parent categories with stable slugs.
--   4. Inserts sub-categories as child rows referencing their parent.
--   5. Does NOT delete old category rows — existing listings keep their FK intact.
--   6. Adds a `legacy` boolean flag to old rows so the UI can filter them out.

-- Step 1: Add parent_id + legacy flag + active flag to categories
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS legacy BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

-- Mark the original 6 flat categories as legacy so the UI can hide them
-- (run after confirming no active provider onboarding depends on them)
-- UPDATE public.categories SET legacy = true WHERE slug IN (
--   'elite', 'events', 'documentation', 'transport', 'personal', 'business'
-- );

-- Step 2: Add sub_category columns to services table
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS sub_category_slug TEXT,
  ADD COLUMN IF NOT EXISTS sub_category_name TEXT;

-- Step 3: Insert 14 new parent categories
-- Uses ON CONFLICT DO NOTHING so re-running is safe.
INSERT INTO public.categories (id, name, slug, description, active)
VALUES
  (gen_random_uuid(), 'Elite Concierge',                  'elite-concierge',           'High-touch lifestyle, security, and VIP services for discerning clients.',         true),
  (gen_random_uuid(), 'Events & Production',              'events-production',          'Event planning, AV production, photography, decor, and coordination.',             true),
  (gen_random_uuid(), 'Visa & Immigration Support',       'visa-immigration',           'Visa applications, document preparation, certified translation, and notary.',      true),
  (gen_random_uuid(), 'Company Registration & Compliance','company-registration',       'Business registration, ZIMRA compliance, annual returns, and licensing.',          true),
  (gen_random_uuid(), 'Transport & Logistics',            'transport-logistics',        'Chauffeur services, freight, courier, relocation, and corporate fleet.',           true),
  (gen_random_uuid(), 'Beauty, Grooming & Wellness',      'beauty-grooming-wellness',   'Salons, barbers, bridal makeup, spa, skincare, and wellness practitioners.',       true),
  (gen_random_uuid(), 'Fitness & Personal Training',      'fitness-personal-training',  'Personal trainers, studios, gyms, nutrition, and coaching services.',              true),
  (gen_random_uuid(), 'Fashion, Tailoring & Styling',     'fashion-tailoring-styling',  'Made-to-measure tailoring, personal stylists, and alteration specialists.',        true),
  (gen_random_uuid(), 'Business & Professional Services', 'business-professional',      'Legal, accounting, marketing, IT, web development, and business consulting.',      true),
  (gen_random_uuid(), 'Property Services',                'property-services',          'Real estate agents, movers, home renovation, and cleaning services.',              true),
  (gen_random_uuid(), 'Health & Medical',                 'health-medical',             'Private clinics, specialists, dental services, and medical concierge.',            true),
  (gen_random_uuid(), 'Education & Tutoring',             'education-tutoring',         'Private tutors, exam preparation, and school placement consultants.',              true),
  (gen_random_uuid(), 'Food & Catering',                  'food-catering',              'Private chefs, catering companies, and meal preparation services.',                true),
  (gen_random_uuid(), 'Repairs & Home Services',          'repairs-home-services',      'Electricians, plumbers, appliance repair, and generator and solar installation.', true)
ON CONFLICT (slug) DO NOTHING;

-- Step 4: Insert sub-categories as child rows
-- Requires parent UUIDs — run this block AFTER Step 3 inserts complete.
-- Sub-categories are inserted referencing parent by slug lookup.

INSERT INTO public.categories (id, name, slug, description, active, parent_id)
SELECT gen_random_uuid(), sub.name, sub.slug, sub.description, true, p.id
FROM public.categories p
JOIN (VALUES
  -- Elite Concierge
  ('elite-concierge', 'Personal Assistants & Errands',      'elite-personal-assistants',      'Personal errand running and lifestyle management support.'),
  ('elite-concierge', 'VIP / Airport Meet & Greet',         'elite-vip-meet-greet',            'Protocol handling, airport reception, and VIP liaison.'),
  ('elite-concierge', 'Household Staff Placement',          'elite-household-staff',           'Sourcing and vetting of domestic and household staff.'),
  ('elite-concierge', 'Personal Security & Close Protection','elite-close-protection',         'Close protection officers and event security teams.'),
  -- Events & Production
  ('events-production', 'Wedding Planning & Coordination',  'events-wedding-planning',         'Full wedding planning, coordination, and day-of management.'),
  ('events-production', 'Corporate Events & Conferences',   'events-corporate',                'Corporate event management, conferences, and launches.'),
  ('events-production', 'Photography & Videography',        'events-photography',              'Event photographers and videographers.'),
  ('events-production', 'Decor, Hire & Catering',           'events-decor-catering',           'Venue decor, equipment hire, and catering services.'),
  ('events-production', 'Sound, Lighting & AV',             'events-av',                       'Professional sound, stage lighting, and AV production.'),
  -- Visa & Immigration
  ('visa-immigration', 'Visa Applications & Appointments',  'visa-applications',               'Assistance with visa application forms and appointment booking.'),
  ('visa-immigration', 'Document Prep & Certified Translation','visa-document-prep',           'Document preparation, certified translation services.'),
  ('visa-immigration', 'Notary & Affidavits',               'visa-notary',                     'Notary public and affidavit services.'),
  -- Company Registration
  ('company-registration', 'Business Registration',         'reg-business-registration',       'PBC, PVT, and NGO entity registration.'),
  ('company-registration', 'Tax & Regulatory Compliance',   'reg-tax-compliance',              'ZIMRA returns, tax compliance, and regulatory filings.'),
  ('company-registration', 'Licensing',                     'reg-licensing',                   'Operating licences and sector-specific permits.'),
  -- Transport
  ('transport-logistics', 'Car Hire & Chauffeur Services',  'transport-chauffeur',             'Executive car hire and professional chauffeur services.'),
  ('transport-logistics', 'Freight, Courier & Relocation',  'transport-freight',               'Freight forwarding, courier, and household relocation.'),
  ('transport-logistics', 'Fleet & Corporate Transport',    'transport-fleet',                 'Corporate fleet management and staff transport.'),
  -- Beauty
  ('beauty-grooming-wellness', 'Salons & Barbers',          'beauty-salons-barbers',           'Hair salons and barbershops, chair and mobile.'),
  ('beauty-grooming-wellness', 'Spa & Skincare',            'beauty-spa-skincare',             'Spa treatments, skincare, and beauty therapists.'),
  ('beauty-grooming-wellness', 'Wellness Practitioners',    'beauty-wellness',                 'Holistic wellness, massage, and complementary therapists.'),
  -- Fitness
  ('fitness-personal-training', 'Personal Trainers',        'fitness-trainers',                'Certified personal trainers for individuals and groups.'),
  ('fitness-personal-training', 'Studios & Gyms',           'fitness-studios',                 'Gym facilities and studio class bookings.'),
  ('fitness-personal-training', 'Nutrition & Coaching',     'fitness-nutrition',               'Nutritionists, dietitians, and performance coaches.'),
  -- Fashion
  ('fashion-tailoring-styling', 'Tailors & Designers',      'fashion-tailors',                 'Made-to-measure tailors and fashion designers.'),
  ('fashion-tailoring-styling', 'Personal Stylists',        'fashion-stylists',                'Personal shopping and styling consultants.'),
  ('fashion-tailoring-styling', 'Alterations',              'fashion-alterations',             'Garment alterations and repairs.'),
  -- Business & Professional
  ('business-professional', 'Legal Services',               'business-legal',                  'Lawyers and legal advisory services.'),
  ('business-professional', 'Accounting & Tax',             'business-accounting',             'Accountants, bookkeepers, and tax advisors.'),
  ('business-professional', 'Marketing, Design & Branding', 'business-marketing',             'Marketing agencies, graphic designers, and brand consultants.'),
  ('business-professional', 'IT, Web & Software',           'business-it',                     'IT support, web development, and software services.'),
  ('business-professional', 'Business Consulting & Advisory','business-consulting',            'Business strategy, operations, and management consultants.'),
  -- Property
  ('property-services', 'Real Estate Agents',               'property-real-estate',            'Licensed real estate sales and rental agents.'),
  ('property-services', 'Movers & Relocation',              'property-movers',                 'Household and office removal and relocation services.'),
  ('property-services', 'Home Renovation',                  'property-renovation',             'Builders, contractors, and renovation specialists.'),
  ('property-services', 'Cleaning Services',                'property-cleaning',               'Domestic and commercial cleaning companies.'),
  -- Health
  ('health-medical', 'Private Clinics & Specialists',       'health-clinics',                  'Private general practitioners and specialist consultations.'),
  ('health-medical', 'Dental',                              'health-dental',                   'Private dental practices and oral health services.'),
  ('health-medical', 'Medical Concierge & Referrals',       'health-concierge',                'Medical coordination, concierge, and specialist referrals.'),
  -- Education
  ('education-tutoring', 'Private Tutors & Exam Prep',      'education-tutors',                'Subject tutors and examination preparation services.'),
  ('education-tutoring', 'School Placement Consultants',    'education-placement',             'School search, application, and placement advisory.'),
  -- Food & Catering
  ('food-catering', 'Private Chefs',                        'food-private-chefs',              'Private chef services for residences and events.'),
  ('food-catering', 'Catering Companies',                   'food-catering-companies',         'Full catering for events, functions, and corporate meals.'),
  ('food-catering', 'Meal Prep Services',                   'food-meal-prep',                  'Weekly meal preparation and delivery services.'),
  -- Repairs
  ('repairs-home-services', 'Electricians & Plumbers',      'repairs-electrical-plumbing',     'Qualified electricians and plumbers for residential and commercial.'),
  ('repairs-home-services', 'Appliance Repair',             'repairs-appliances',              'Domestic and commercial appliance repair technicians.'),
  ('repairs-home-services', 'Generator & Solar Installation','repairs-generator-solar',        'Generator servicing and solar panel installation.')
) AS sub(parent_slug, name, slug, description)
  ON p.slug = sub.parent_slug
ON CONFLICT (slug) DO NOTHING;
