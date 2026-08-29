# NexusZim — Fable 5 Build Prompt
## "Africa's Premier Event Intelligence & Service Brokerage Platform"

---

## 🎯 VISION STATEMENT

Build **NexusZim** — a full-stack service marketplace and event intelligence brokerage platform for Zimbabwe and the African continent. This is not a generic directory. NexusZim is the **Fixer's platform**: the authoritative hub where event organizers, corporates, and individuals connect with verified service providers, book complete event packages, and get intel no one else has. The platform positions its operator as the most connected, most trusted event broker on the continent.

---

## 🏗️ TECH STACK (NON-NEGOTIABLE)

- **Framework**: TanStack Start (SSR + client routing)
- **Runtime**: Bun
- **Database + Auth + Storage**: Supabase (project ID: `nxxnylunickxlvqtyhtk`)
- **Edge API**: Cloudflare Workers via Wrangler (Hono routing)
- **Styling**: Tailwind CSS
- **Forms**: TanStack Form
- **State/Queries**: TanStack Query

Do not introduce new dependencies that conflict with this stack. Respect what is already scaffolded.

---

## 🎨 DESIGN LANGUAGE

The platform serves a continent. It must feel **authoritative, premium, and distinctly African** — not a clone of Fiverr or Thumbtack.

### Palette
| Role | Hex | Usage |
|---|---|---|
| Base | `#0D0D0D` | Page backgrounds, dark surfaces |
| Gold | `#C9A84C` | Primary accent — CTA buttons, highlights, active states |
| Surface | `#F5F0E8` | Cards, content panels, off-white surfaces |
| Copper | `#A0522D` | Tier badges, status indicators |
| Muted | `#2A2A2A` | Secondary surfaces, nav backgrounds |
| Text | `#E8E4DC` | Primary text on dark backgrounds |

### Typography
- **Display**: Syne or Clash Display — authority, weight, presence. Used for hero headings and section titles only.
- **Body**: Inter or DM Sans — clean, readable, neutral.
- **Data/Utility**: JetBrains Mono — provider tiers, IDs, stats, labels.

### Aesthetic Rules
- Zero border-radius on structural containers. Subtle radius (4px) on interactive elements only.
- Gold underlines, not borders, to denote active navigation.
- Tier badges use monospace text + copper/gold backgrounds — they feel like credentials, not tags.
- No stock illustration. Use geometric African textile pattern motifs as subtle background textures on hero/dark sections.
- Motion: purposeful only. Entrance reveals on cards. No looping animations.

---

## 👤 USER ROLES

The platform has three distinct user types, each with their own dashboard and flow:

### 1. Client (Event Organizer / Individual)
- Searches and browses verified providers
- Requests quotes or direct bookings
- Accesses the Event Intel Hub (upcoming events, market pricing, venue availability)
- Rates and reviews providers after engagement

### 2. Provider (Service Business / Freelancer)
- Creates a verified profile with service listings
- Manages incoming quote requests and enquiries
- Upgrades verification tier to increase trust and visibility
- Accesses their own analytics dashboard (views, leads, conversion)

### 3. Admin / Operator (NexusZim Staff)
- Full user management (approve/flag/suspend providers)
- Intel Hub content management (event data, market reports)
- Revenue dashboard (commissions, subscriptions, featured slots)
- Dispute resolution queue

---

## 🏆 PROVIDER VERIFICATION TIERS

This is the trust backbone of the platform. Display these prominently on every provider card and profile.

| Tier | Label | Badge Color | Requirements |
|---|---|---|---|
| 1 | Listed | Grey | Self-registered, basic profile |
| 2 | Checked | Blue | ID verified + business proof submitted |
| 3 | Trusted | Copper | 5+ confirmed jobs + positive ratings |
| 4 | Elite | Gold | Audited portfolio + NexusZim-endorsed |

Tier is displayed on every listing card, search result, and provider profile. Clients can filter search by minimum tier.

---

## 🗂️ CORE FEATURES TO BUILD / EXTEND

### A. Provider Directory & Search
- Full-text search by service type, city, price range, tier
- Category browsing: Events & Entertainment, Hospitality, Logistics, Creative, Technical, Security, Catering
- Provider cards display: name, tier badge, top services, rating, starting price, response time
- Filter panel: tier, category, location, price range, availability
- Map view toggle (Harare / Bulawayo / other cities)

### B. Provider Profile Pages
- Hero: business name, tier badge, tagline, cover photo
- Services offered with base pricing
- Portfolio gallery
- Verified credentials section (shown only if tier ≥ Checked)
- Reviews & ratings with verified-client markers
- "Request Quote" and "Send Message" CTAs
- Enquiry form (name, event date, event type, budget, message)

### C. Client Dashboard
- Active enquiries and their status (Sent / Responded / Confirmed / Complete)
- Saved/shortlisted providers
- Booking history
- Access to Event Intel Hub

### D. Provider Dashboard
- Incoming enquiries inbox
- Profile completion progress bar (with prompts to upgrade tier)
- Visibility stats: profile views, enquiry rate, conversion
- Featured listing upsell prompt
- Earnings summary (if commission model enabled)

### E. 🔥 Event Intelligence Hub (Differentiator)
This is what makes NexusZim the Intel broker. No competitor has this.

**Sections:**
1. **Upcoming Events Radar** — curated list of confirmed upcoming events in Zimbabwe + continent. Filterable by city, genre, scale. Each entry: event name, date, venue, estimated attendance, ticket price range, organizer (if public).
2. **Venue Availability Board** — crowd-sourced + admin-maintained board of major venues with availability windows.
3. **Market Rate Index** — average rates for key service categories (DJ, photographer, catering per head, security, etc.) updated monthly. Positioned as "the price you should be paying."
4. **Organizer Alerts** — subscribe to alerts for: new provider in your category, rate changes, venue openings, event filings.

Access: Free tier sees limited data. Full access requires registration (free) + email verification.

### F. Operator/Fixer Concierge Mode
A private page (admin-only) that allows the NexusZim operator to:
- Create "Managed Packages" — curated bundles of providers for specific event types (e.g., "Corporate Dinner Package: venue + catering + AV + security")
- Track commissions on referred packages
- Log direct brokered deals (offline deals that go through the operator)
- See which providers are most frequently shortlisted (hot providers)

---

## 💰 MONETIZATION FEATURES

### Already Planned
- **Featured Listings**: Providers pay to appear at top of category search. Admin marks listing as featured.
- **Provider Subscriptions**: Monthly plans (Basic free / Pro $15/mo / Business $40/mo) unlocking more enquiry slots, analytics, priority support.
- **Lead Generation Fee**: Per-enquiry charge for Trusted/Elite providers (optional, configurable).
- **Commission on Packages**: When a managed package is confirmed, system logs a commission % for the operator.

### Implementation Notes
- Payments initially: manual (EcoCash, bank transfer). Admin confirms payment and upgrades tier/plan in dashboard.
- Do not build a payment gateway into v1. Add a "Payment Confirmed by Admin" toggle in the admin panel.
- ZimGateway / Paynow integration is planned for v2.

---

## 🔗 PLATFORM POSITIONING RULES (Do Not Violate)

1. **NexusZim is a connection platform, not a payment processor.** Never hold funds. Never promise transaction security between provider and client. The platform facilitates introductions.
2. **Dispute handling is informational, not judicial.** The platform can flag providers and log complaints. It does not arbitrate disputes or issue refunds.
3. **Cash-first economy.** All pricing shown is indicative/negotiated. Actual payment happens off-platform between client and provider.
4. **Data is the long game.** Every enquiry, search, shortlist, and confirmed job is a data point feeding into ZimDataPulse's intelligence layer. Build with this in mind: log structured analytics on every significant user action.

---

## 🗃️ DATABASE SCHEMA NOTES (Supabase)

Key tables that must exist or be extended:

```sql
-- Core tables
users (id, email, role: client|provider|admin, created_at)
providers (id, user_id, business_name, tier, category, city, bio, portfolio_urls[], verified_at)
services (id, provider_id, title, description, base_price, unit)
enquiries (id, client_id, provider_id, event_date, event_type, budget, message, status, created_at)
reviews (id, enquiry_id, client_id, provider_id, rating, body, verified_job: bool)

-- Intelligence Hub
events_radar (id, title, date, venue, city, genre, estimated_attendance, ticket_price_range, source)
venue_availability (id, venue_name, city, available_from, available_to, capacity, contact)
market_rate_index (id, category, rate_low, rate_high, unit, updated_at, notes)

-- Monetization
featured_listings (id, provider_id, category, position, active_from, active_to)
subscriptions (id, provider_id, plan: basic|pro|business, status, payment_confirmed_by, confirmed_at)
operator_packages (id, name, event_type, provider_ids[], commission_pct, description)
brokered_deals (id, package_id, client_name, event_date, value, commission_earned, notes)
```

All tables must have Row Level Security (RLS) enabled. Providers see only their own data. Clients see only their own enquiries. Admins see everything.

---

## 🚀 PAGES / ROUTES TO BUILD

| Route | Description |
|---|---|
| `/` | Landing page — hero, value prop, category browse, featured providers, Intel Hub teaser |
| `/providers` | Provider directory with search + filters |
| `/providers/:id` | Provider profile page |
| `/intel` | Event Intelligence Hub |
| `/intel/events` | Upcoming Events Radar |
| `/intel/venues` | Venue Availability Board |
| `/intel/rates` | Market Rate Index |
| `/register` | Split: I'm a Client / I'm a Provider |
| `/dashboard` | Client dashboard |
| `/provider/dashboard` | Provider dashboard |
| `/provider/onboarding` | Step-by-step profile setup wizard |
| `/admin` | Admin panel (protected) |
| `/admin/providers` | Manage + verify providers |
| `/admin/intel` | Manage intel hub content |
| `/admin/revenue` | Revenue dashboard |
| `/admin/concierge` | Operator/Fixer concierge mode |

---

## ✅ BUILD INSTRUCTIONS FOR FABLE 5

You are a **senior full-stack engineer** doing a **complete build and enhancement pass** on an existing NexusZim project. The scaffolding already exists (TanStack Start + Bun + Supabase + Cloudflare Workers). GitHub repo: `kayceezw/NexusZim`.

Your job:
1. **Audit what exists** — read the folder structure, existing routes, components, and schema.
2. **Preserve what works** — do not rewrite functional code unless it conflicts with the requirements above.
3. **Add what's missing** — implement all features described in this document that are not yet present.
4. **Enforce RLS** — ensure every Supabase table has Row Level Security policies matching the role definitions above.
5. **Design fidelity** — apply the design language (palette, typography, tier badges) to all new UI. Retrofit existing UI if it deviates significantly.
6. **Event Intelligence Hub** — this is the top build priority. Build it fully even if nothing exists for it yet.
7. **Admin Concierge Mode** — second priority. The operator needs this to run brokered deals.
8. **Test the enquiry flow end-to-end**: client searches → views provider → submits enquiry → provider sees it in dashboard → status updated.

Do not add a payment gateway. Do not add a real-time chat system. Those are v2. Focus on making v1 production-ready for a soft launch.
