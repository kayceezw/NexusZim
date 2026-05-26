export type CategorySlug =
  | "elite"
  | "events"
  | "documentation"
  | "transport"
  | "personal"
  | "business";

export interface Category {
  slug: CategorySlug;
  name: string;
  tagline: string;
  description: string;
  icon: string; // lucide name
  services: string[];
  accent: "primary" | "teal" | "gold" | "accent";
}

export interface Provider {
  id: string;
  name: string;
  business: string;
  category: CategorySlug;
  services: string[];
  city: string;
  rating: number;
  reviews: number;
  priceFrom: number; // USD
  verified: boolean;
  featured?: boolean;
  responseTime: string;
  completedJobs: number;
  avatarColor: string;
  initials: string;
  bio: string;
  availability: "available" | "busy" | "booked";
}

export interface Review {
  id: string;
  providerId: string;
  client: string;
  rating: number;
  date: string;
  text: string;
}

export const CITIES = [
  "Harare",
  "Bulawayo",
  "Mutare",
  "Gweru",
  "Victoria Falls",
  "Masvingo",
  "Chitungwiza",
  "Kwekwe",
];

export const CATEGORIES: Category[] = [
  {
    slug: "elite",
    name: "Elite Concierge",
    tagline: "Discreet, high-touch services for VIP clients.",
    description:
      "An invitation-level tier of vetted specialists handling lifestyle, security, travel, private events and family-office support for high-net-worth clients.",
    icon: "Crown",
    accent: "gold",
    services: [
      "Personal concierge & lifestyle management",
      "VIP liaison & protocol handling",
      "Private event planning & full production",
      "Executive transport & airport meet-and-greet",
      "Personal security & crowd control",
      "Premium travel & visa coordination",
      "Corporate & personal admin support",
      "Luxury gifting & surprise experiences",
      "Home & office upkeep coordination",
      "Private chef, catering & fine dining",
      "Wardrobe, styling & grooming",
      "Short-notice hotel, venue & transport bookings",
      "Wealth, investment & family-office support",
    ],
  },
  {
    slug: "events",
    name: "Events & Production",
    tagline: "Plan, produce, and run unforgettable events.",
    description:
      "Event planning, coordination, AV & production, MC, décor, security, and VIP liaison teams.",
    icon: "PartyPopper",
    accent: "teal",
    services: [
      "Event planning",
      "Event coordination",
      "Production & AV",
      "MC & hosting",
      "Décor & styling",
      "Security & VIP liaison",
    ],
  },
  {
    slug: "documentation",
    name: "Visa & Business Docs",
    tagline: "Documentation support, done right.",
    description:
      "Visa applications, permits, company registration, and business compliance support — consultancy and document assistance.",
    icon: "FileCheck2",
    accent: "primary",
    services: [
      "Visa application support",
      "Permit application support",
      "Company registration support",
      "Business compliance support",
    ],
  },
  {
    slug: "transport",
    name: "Transport & Logistics",
    tagline: "Move people and goods, on time.",
    description:
      "Airport transfers, chauffeur services, executive transport, logistics, and last-mile delivery.",
    icon: "Car",
    accent: "accent",
    services: [
      "Airport transfers",
      "Chauffeur services",
      "Executive transport",
      "Logistics",
      "Delivery",
    ],
  },
  {
    slug: "personal",
    name: "Personal & Lifestyle",
    tagline: "Look good. Feel good. Locally.",
    description:
      "Barbering, grooming, beauty, wellness, and at-home personal services.",
    icon: "Scissors",
    accent: "gold",
    services: ["Barbering", "Grooming", "Beauty", "Wellness", "At-home services"],
  },
  {
    slug: "business",
    name: "Business & Professional",
    tagline: "Specialists for everything else.",
    description:
      "General business and professional services — expandable with new sub-categories anytime.",
    icon: "Briefcase",
    accent: "teal",
    services: ["Consulting", "Marketing", "IT support", "Bookkeeping", "Legal admin"],
  },
];

const colors = [
  "bg-teal text-teal-foreground",
  "bg-primary text-primary-foreground",
  "bg-accent text-accent-foreground",
  "bg-gold text-gold-foreground",
];

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const RAW_PROVIDERS: Provider[] = [
  {
    id: "e1",
    name: "Anesu Mukomberanwa",
    business: "Sable & Co. Private Concierge",
    category: "elite",
    services: [
      "Personal concierge & lifestyle management",
      "VIP liaison & protocol handling",
      "Luxury gifting & surprise experiences",
      "Short-notice hotel, venue & transport bookings",
    ],
    city: "Harare",
    rating: 5.0,
    reviews: 47,
    priceFrom: 1500,
    verified: true,
    featured: true,
    responseTime: "Replies in ~5 min",
    completedJobs: 180,
    bio: "Bespoke concierge desk for diplomats, executives and HNW families. NDA-bound team handling lifestyle, travel and protocol end to end.",
    availability: "available",
    avatarColor: colors[3],
    initials: "AM",
  },
  {
    id: "e2",
    name: "Captain Tatenda Mhuriro",
    business: "Onyx Protective Services",
    category: "elite",
    services: [
      "Personal security & crowd control",
      "VIP liaison & protocol handling",
      "Executive transport & airport meet-and-greet",
    ],
    city: "Harare",
    rating: 4.95,
    reviews: 32,
    priceFrom: 800,
    verified: true,
    featured: true,
    responseTime: "Replies in ~10 min",
    completedJobs: 240,
    bio: "Ex-special forces close-protection teams, armoured fleet and event security. Discreet by default, formidable when needed.",
    availability: "available",
    avatarColor: colors[1],
    initials: "TM",
  },
  {
    id: "e3",
    name: "Chef Rutendo Madziva",
    business: "Maison Rutendo Private Dining",
    category: "elite",
    services: [
      "Private chef, catering & fine dining",
      "Private event planning & full production",
    ],
    city: "Harare",
    rating: 4.97,
    reviews: 64,
    priceFrom: 450,
    verified: true,
    responseTime: "Replies in ~20 min",
    completedJobs: 130,
    bio: "Cordon Bleu-trained private chef for residences, safari lodges and intimate dinners. Seasonal menus, full FOH team available.",
    availability: "busy",
    avatarColor: colors[2],
    initials: "RM",
  },

  {
    id: "p1",
    name: "Tanaka Moyo",
    business: "Moyo Signature Events",
    category: "events",
    services: ["Event planning", "Décor & styling", "MC & hosting"],
    city: "Harare",
    rating: 4.9,
    reviews: 124,
    priceFrom: 350,
    verified: true,
    featured: true,
    responseTime: "Replies in ~30 min",
    completedJobs: 210,
    bio: "Full-service event house behind 200+ weddings, corporate launches, and gala dinners across Zimbabwe.",
    availability: "available",
    avatarColor: colors[0],
    initials: "TM",
  },
  {
    id: "p2",
    name: "Rumbi Chikomo",
    business: "Stagecraft AV & Production",
    category: "events",
    services: ["Production & AV", "Event coordination", "Security & VIP liaison"],
    city: "Bulawayo",
    rating: 4.8,
    reviews: 86,
    priceFrom: 600,
    verified: true,
    responseTime: "Replies in ~1 hr",
    completedJobs: 142,
    bio: "Concert-grade sound, stage and lighting crews. Trusted by international touring acts.",
    availability: "busy",
    avatarColor: colors[1],
    initials: "RC",
  },
  {
    id: "p3",
    name: "Kuda Sibanda",
    business: "Sibanda Visa & Permits",
    category: "documentation",
    services: ["Visa application support", "Permit application support"],
    city: "Harare",
    rating: 4.95,
    reviews: 58,
    priceFrom: 80,
    verified: true,
    featured: true,
    responseTime: "Replies in ~15 min",
    completedJobs: 320,
    bio: "Document preparation, appointment booking, and submission support for UK, Schengen, USA and SADC visas.",
    availability: "available",
    avatarColor: colors[2],
    initials: "KS",
  },
  {
    id: "p4",
    name: "Nyasha Dube",
    business: "Dube Compliance Partners",
    category: "documentation",
    services: ["Company registration support", "Business compliance support"],
    city: "Harare",
    rating: 4.7,
    reviews: 41,
    priceFrom: 150,
    verified: true,
    responseTime: "Replies in ~2 hrs",
    completedJobs: 95,
    bio: "PBC, PVT and NGO registrations, ZIMRA compliance, and annual returns. Consultancy and document assistance only.",
    availability: "available",
    avatarColor: colors[3],
    initials: "ND",
  },
  {
    id: "p5",
    name: "Tendai Marange",
    business: "Apex Chauffeurs ZW",
    category: "transport",
    services: ["Airport transfers", "Chauffeur services", "Executive transport"],
    city: "Harare",
    rating: 4.85,
    reviews: 173,
    priceFrom: 35,
    verified: true,
    featured: true,
    responseTime: "Replies in ~10 min",
    completedJobs: 410,
    bio: "Late-model executive vehicles with vetted, suited drivers. Flat-rate airport runs across Harare and Vic Falls.",
    availability: "available",
    avatarColor: colors[0],
    initials: "TM",
  },
  {
    id: "p6",
    name: "Brian Hove",
    business: "SwiftMove Logistics",
    category: "transport",
    services: ["Logistics", "Delivery"],
    city: "Bulawayo",
    rating: 4.6,
    reviews: 64,
    priceFrom: 25,
    verified: true,
    responseTime: "Replies in ~45 min",
    completedJobs: 280,
    bio: "Same-day inter-city deliveries, pallets and parcels. Tracked and insured.",
    availability: "available",
    avatarColor: colors[1],
    initials: "BH",
  },
  {
    id: "p7",
    name: "Lloyd Banda",
    business: "The Cutroom Barbershop",
    category: "personal",
    services: ["Barbering", "Grooming"],
    city: "Harare",
    rating: 4.9,
    reviews: 312,
    priceFrom: 12,
    verified: true,
    responseTime: "Replies in ~5 min",
    completedJobs: 1500,
    bio: "Master barbers offering chair and at-home grooming. Beard sculpts, fades, and grooming kits.",
    availability: "available",
    avatarColor: colors[2],
    initials: "LB",
  },
  {
    id: "p8",
    name: "Chiedza Ncube",
    business: "Glow by Chiedza",
    category: "personal",
    services: ["Beauty", "Wellness", "At-home services"],
    city: "Mutare",
    rating: 4.8,
    reviews: 98,
    priceFrom: 20,
    verified: true,
    responseTime: "Replies in ~25 min",
    completedJobs: 540,
    bio: "Mobile bridal makeup, lashes, and skincare. Travels nationwide for events.",
    availability: "available",
    avatarColor: colors[3],
    initials: "CN",
  },
  {
    id: "p9",
    name: "Farai Gumbo",
    business: "Gumbo Digital Studio",
    category: "business",
    services: ["Marketing", "IT support"],
    city: "Harare",
    rating: 4.7,
    reviews: 52,
    priceFrom: 200,
    verified: false,
    responseTime: "Replies in ~3 hrs",
    completedJobs: 70,
    bio: "Brand strategy, websites and social campaigns for SMEs. Verification in progress.",
    availability: "available",
    avatarColor: colors[0],
    initials: "FG",
  },
  {
    id: "p10",
    name: "Patience Sithole",
    business: "Sithole Bookkeeping Co.",
    category: "business",
    services: ["Bookkeeping", "Consulting"],
    city: "Gweru",
    rating: 4.85,
    reviews: 39,
    priceFrom: 90,
    verified: true,
    responseTime: "Replies in ~2 hrs",
    completedJobs: 110,
    bio: "Monthly bookkeeping, payroll and management accounts for small businesses across Zimbabwe.",
    availability: "available",
    avatarColor: colors[1],
    initials: "PS",
  },
];

export const PROVIDERS: Provider[] = RAW_PROVIDERS.map((p) => ({
  ...p,
  initials: initialsOf(p.name),
}));

export const REVIEWS: Review[] = [
  {
    id: "r1",
    providerId: "p1",
    client: "Rachel M.",
    rating: 5,
    date: "2 weeks ago",
    text: "Absolutely flawless wedding coordination. Every detail handled.",
  },
  {
    id: "r2",
    providerId: "p1",
    client: "Tinashe K.",
    rating: 5,
    date: "1 month ago",
    text: "Hosted a 400-person corporate gala. Professional from start to finish.",
  },
  {
    id: "r3",
    providerId: "p3",
    client: "Charity G.",
    rating: 5,
    date: "3 weeks ago",
    text: "Got my UK visa approved first try. They prepared everything.",
  },
  {
    id: "r4",
    providerId: "p5",
    client: "Wellington N.",
    rating: 5,
    date: "5 days ago",
    text: "On time, clean car, suited driver. Best airport transfer in Harare.",
  },
  {
    id: "r5",
    providerId: "p7",
    client: "Mike T.",
    rating: 5,
    date: "1 week ago",
    text: "Best fade in the city. Worth every cent.",
  },
];

export const findProvider = (id: string) => PROVIDERS.find((p) => p.id === id);
export const findCategory = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug);
export const providersByCategory = (slug: string) =>
  PROVIDERS.filter((p) => p.category === slug);
export const reviewsForProvider = (id: string) =>
  REVIEWS.filter((r) => r.providerId === id);
