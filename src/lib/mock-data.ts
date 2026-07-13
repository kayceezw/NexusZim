export type CategorySlug =
  | "elite-concierge"
  | "events-production"
  | "visa-immigration"
  | "company-registration"
  | "transport-logistics"
  | "beauty-grooming-wellness"
  | "fitness-personal-training"
  | "fashion-tailoring-styling"
  | "business-professional"
  | "property-services"
  | "health-medical"
  | "education-tutoring"
  | "food-catering"
  | "repairs-home-services";

export interface Category {
  slug: CategorySlug;
  name: string;
  tagline: string;
  description: string;
  icon: string; // lucide name
  subCategories: string[];
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
  tier: 1 | 2 | 3 | 4;
  featured?: boolean;
  responseTime: string;
  completedJobs: number;
  avatarColor: string;
  initials: string;
  bio: string;
  availability: "available" | "busy" | "booked";
  portfolioUrls?: string[];
  verifiedAt?: string;
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
    slug: "elite-concierge",
    name: "Elite Concierge",
    tagline: "Discreet, high-touch services for VIP clients.",
    description:
      "An invitation-level tier of vetted specialists handling lifestyle, security, travel, private events and family-office support for high-net-worth clients.",
    icon: "Crown",
    accent: "gold",
    subCategories: [
      "Personal Assistants & Errands",
      "VIP / Airport Meet & Greet",
      "Household Staff Placement",
      "Personal Security & Close Protection",
    ],
  },
  {
    slug: "events-production",
    name: "Events & Production",
    tagline: "Plan, produce, and execute unforgettable events.",
    description:
      "Event planning, coordination, AV and production, MC, decor, catering, security, and VIP liaison teams.",
    icon: "PartyPopper",
    accent: "teal",
    subCategories: [
      "Wedding Planning & Coordination",
      "Corporate Events & Conferences",
      "Photography & Videography",
      "Decor, Hire & Catering",
      "Sound, Lighting & AV",
    ],
  },
  {
    slug: "visa-immigration",
    name: "Visa & Immigration Support",
    tagline: "Visa applications and immigration assistance, done right.",
    description:
      "Visa applications, appointment booking, document preparation, certified translation, notary, and affidavit services.",
    icon: "Stamp",
    accent: "primary",
    subCategories: [
      "Visa Applications & Appointments",
      "Document Prep & Certified Translation",
      "Notary & Affidavits",
    ],
  },
  {
    slug: "company-registration",
    name: "Company Registration & Compliance",
    tagline: "Formal business registration and regulatory compliance.",
    description:
      "Business registration, ZIMRA compliance, annual returns, licensing, and regulatory consultancy for PBC, PVT, and NGO entities.",
    icon: "Building2",
    accent: "primary",
    subCategories: ["Business Registration", "Tax & Regulatory Compliance", "Licensing"],
  },
  {
    slug: "transport-logistics",
    name: "Transport & Logistics",
    tagline: "Move people and goods, on time and on spec.",
    description:
      "Airport transfers, chauffeur and executive transport, freight, courier, relocation, and corporate fleet management.",
    icon: "Car",
    accent: "accent",
    subCategories: [
      "Car Hire & Chauffeur Services",
      "Freight, Courier & Relocation",
      "Fleet & Corporate Transport",
    ],
  },
  {
    slug: "beauty-grooming-wellness",
    name: "Beauty, Grooming & Wellness",
    tagline: "Look and feel your best, from Harare to Victoria Falls.",
    description:
      "Salons, barbershops, bridal makeup, mobile beauty, spa, skincare, and wellness practitioners.",
    icon: "Scissors",
    accent: "gold",
    subCategories: ["Salons & Barbers", "Spa & Skincare", "Wellness Practitioners"],
  },
  {
    slug: "fitness-personal-training",
    name: "Fitness & Personal Training",
    tagline: "Structured training, real results, qualified coaches.",
    description:
      "Personal trainers, corporate fitness programmes, studio memberships, and nutrition and coaching services.",
    icon: "Dumbbell",
    accent: "teal",
    subCategories: ["Personal Trainers", "Studios & Gyms", "Nutrition & Coaching"],
  },
  {
    slug: "fashion-tailoring-styling",
    name: "Fashion, Tailoring & Styling",
    tagline: "Custom cuts, personal styling, and master tailoring.",
    description:
      "Made-to-measure tailoring, personal stylists, fashion designers, and alteration specialists.",
    icon: "Shirt",
    accent: "gold",
    subCategories: ["Tailors & Designers", "Personal Stylists", "Alterations"],
  },
  {
    slug: "business-professional",
    name: "Business & Professional Services",
    tagline: "Specialists in legal, finance, digital, and advisory work.",
    description:
      "Legal services, accounting, tax, marketing, design, IT, web development, and business consulting.",
    icon: "Briefcase",
    accent: "teal",
    subCategories: [
      "Legal Services",
      "Accounting & Tax",
      "Marketing, Design & Branding",
      "IT, Web & Software",
      "Business Consulting & Advisory",
    ],
  },
  {
    slug: "property-services",
    name: "Property Services",
    tagline: "Find, move, renovate, and maintain property in Zimbabwe.",
    description:
      "Real estate agents, movers and relocation specialists, home renovation contractors, and cleaning services.",
    icon: "Home",
    accent: "primary",
    subCategories: [
      "Real Estate Agents",
      "Movers & Relocation",
      "Home Renovation",
      "Cleaning Services",
    ],
  },
  {
    slug: "health-medical",
    name: "Health & Medical",
    tagline: "Private clinical care, dental, and specialist referrals.",
    description:
      "Private clinics, specialist consultations, dental services, and medical concierge and referral coordination.",
    icon: "Stethoscope",
    accent: "primary",
    subCategories: [
      "Private Clinics & Specialists",
      "Dental",
      "Medical Concierge & Referrals",
    ],
  },
  {
    slug: "education-tutoring",
    name: "Education & Tutoring",
    tagline: "Private tutoring and school placement from qualified educators.",
    description:
      "Subject tutors, exam preparation, school placement consultants, and academic advisory services.",
    icon: "GraduationCap",
    accent: "accent",
    subCategories: ["Private Tutors & Exam Prep", "School Placement Consultants"],
  },
  {
    slug: "food-catering",
    name: "Food & Catering",
    tagline: "Private chefs, catering crews, and meal solutions.",
    description:
      "Private chef services, full catering companies for events and corporate functions, and meal preparation services.",
    icon: "UtensilsCrossed",
    accent: "gold",
    subCategories: ["Private Chefs", "Catering Companies", "Meal Prep Services"],
  },
  {
    slug: "repairs-home-services",
    name: "Repairs & Home Services",
    tagline: "Qualified tradespeople for electrical, plumbing, and solar.",
    description:
      "Electricians, plumbers, appliance repair specialists, and generator and solar installation technicians.",
    icon: "Wrench",
    accent: "accent",
    subCategories: [
      "Electricians & Plumbers",
      "Appliance Repair",
      "Generator & Solar Installation",
    ],
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
    category: "elite-concierge",
    services: [
      "Personal Assistants & Errands",
      "VIP / Airport Meet & Greet",
      "Household Staff Placement",
    ],
    city: "Harare",
    rating: 5.0,
    reviews: 47,
    priceFrom: 1500,
    tier: 4,
    featured: true,
    responseTime: "Replies in ~5 min",
    completedJobs: 180,
    bio: "Bespoke concierge desk for diplomats, executives and HNW families. NDA-bound team handling lifestyle, travel and protocol end to end.",
    availability: "available",
    avatarColor: colors[3],
    initials: "AM",
    verifiedAt: "2025-01-12",
  },
  {
    id: "e2",
    name: "Captain Tatenda Mhuriro",
    business: "Onyx Protective Services",
    category: "elite-concierge",
    services: [
      "Personal Security & Close Protection",
      "VIP / Airport Meet & Greet",
    ],
    city: "Harare",
    rating: 4.95,
    reviews: 32,
    priceFrom: 800,
    tier: 4,
    featured: true,
    responseTime: "Replies in ~10 min",
    completedJobs: 240,
    bio: "Ex-special forces close-protection teams, armoured fleet and event security. Discreet by default, formidable when needed.",
    availability: "available",
    avatarColor: colors[1],
    initials: "TM",
    verifiedAt: "2024-11-05",
  },
  {
    id: "e3",
    name: "Chef Rutendo Madziva",
    business: "Maison Rutendo Private Dining",
    category: "food-catering",
    services: ["Private Chefs", "Catering Companies"],
    city: "Harare",
    rating: 4.97,
    reviews: 64,
    priceFrom: 450,
    tier: 4,
    featured: false,
    responseTime: "Replies in ~20 min",
    completedJobs: 130,
    bio: "Cordon Bleu-trained private chef for residences, safari lodges and intimate dinners. Seasonal menus, full FOH team available.",
    availability: "busy",
    avatarColor: colors[2],
    initials: "RM",
    verifiedAt: "2025-02-20",
  },
  {
    id: "p1",
    name: "Tanaka Moyo",
    business: "Moyo Signature Events",
    category: "events-production",
    services: ["Wedding Planning & Coordination", "Decor, Hire & Catering"],
    city: "Harare",
    rating: 4.9,
    reviews: 124,
    priceFrom: 350,
    tier: 3,
    featured: true,
    responseTime: "Replies in ~30 min",
    completedJobs: 210,
    bio: "Full-service event house behind 200+ weddings, corporate launches, and gala dinners across Zimbabwe.",
    availability: "available",
    avatarColor: colors[0],
    initials: "TM",
    verifiedAt: "2024-06-15",
  },
  {
    id: "p2",
    name: "Rumbi Chikomo",
    business: "Stagecraft AV & Production",
    category: "events-production",
    services: ["Sound, Lighting & AV", "Corporate Events & Conferences"],
    city: "Bulawayo",
    rating: 4.8,
    reviews: 86,
    priceFrom: 600,
    tier: 3,
    featured: false,
    responseTime: "Replies in ~1 hr",
    completedJobs: 142,
    bio: "Concert-grade sound, stage and lighting crews. Trusted by international touring acts.",
    availability: "busy",
    avatarColor: colors[1],
    initials: "RC",
    verifiedAt: "2024-08-22",
  },
  {
    id: "p3",
    name: "Kuda Sibanda",
    business: "Sibanda Visa & Permits",
    category: "visa-immigration",
    services: ["Visa Applications & Appointments", "Document Prep & Certified Translation"],
    city: "Harare",
    rating: 4.95,
    reviews: 58,
    priceFrom: 80,
    tier: 3,
    featured: true,
    responseTime: "Replies in ~15 min",
    completedJobs: 320,
    bio: "Document preparation, appointment booking, and submission support for UK, Schengen, USA and SADC visas.",
    availability: "available",
    avatarColor: colors[2],
    initials: "KS",
    verifiedAt: "2024-03-10",
  },
  {
    id: "p4",
    name: "Nyasha Dube",
    business: "Dube Compliance Partners",
    category: "company-registration",
    services: ["Business Registration", "Tax & Regulatory Compliance"],
    city: "Harare",
    rating: 4.7,
    reviews: 41,
    priceFrom: 150,
    tier: 2,
    featured: false,
    responseTime: "Replies in ~2 hrs",
    completedJobs: 95,
    bio: "PBC, PVT and NGO registrations, ZIMRA compliance, and annual returns. Consultancy and document assistance only.",
    availability: "available",
    avatarColor: colors[3],
    initials: "ND",
    verifiedAt: "2025-04-01",
  },
  {
    id: "p5",
    name: "Tendai Marange",
    business: "Apex Chauffeurs ZW",
    category: "transport-logistics",
    services: ["Car Hire & Chauffeur Services", "Fleet & Corporate Transport"],
    city: "Harare",
    rating: 4.85,
    reviews: 173,
    priceFrom: 35,
    tier: 3,
    featured: true,
    responseTime: "Replies in ~10 min",
    completedJobs: 410,
    bio: "Late-model executive vehicles with vetted, suited drivers. Flat-rate airport runs across Harare and Vic Falls.",
    availability: "available",
    avatarColor: colors[0],
    initials: "TM",
    verifiedAt: "2024-09-30",
  },
  {
    id: "p6",
    name: "Brian Hove",
    business: "SwiftMove Logistics",
    category: "transport-logistics",
    services: ["Freight, Courier & Relocation"],
    city: "Bulawayo",
    rating: 4.6,
    reviews: 64,
    priceFrom: 25,
    tier: 2,
    featured: false,
    responseTime: "Replies in ~45 min",
    completedJobs: 280,
    bio: "Same-day inter-city deliveries, pallets and parcels. Tracked and insured.",
    availability: "available",
    avatarColor: colors[1],
    initials: "BH",
    verifiedAt: "2025-01-15",
  },
  {
    id: "p7",
    name: "Lloyd Banda",
    business: "The Cutroom Barbershop",
    category: "beauty-grooming-wellness",
    services: ["Salons & Barbers"],
    city: "Harare",
    rating: 4.9,
    reviews: 312,
    priceFrom: 12,
    tier: 3,
    featured: false,
    responseTime: "Replies in ~5 min",
    completedJobs: 1500,
    bio: "Master barbers offering chair and at-home grooming. Beard sculpts, fades, and grooming kits.",
    availability: "available",
    avatarColor: colors[2],
    initials: "LB",
    verifiedAt: "2023-12-12",
  },
  {
    id: "p8",
    name: "Chiedza Ncube",
    business: "Glow by Chiedza",
    category: "beauty-grooming-wellness",
    services: ["Spa & Skincare", "Wellness Practitioners"],
    city: "Mutare",
    rating: 4.8,
    reviews: 98,
    priceFrom: 20,
    tier: 2,
    featured: false,
    responseTime: "Replies in ~25 min",
    completedJobs: 540,
    bio: "Mobile bridal makeup, lashes, and skincare. Travels nationwide for events.",
    availability: "available",
    avatarColor: colors[3],
    initials: "CN",
    verifiedAt: "2025-05-05",
  },
  {
    id: "p9",
    name: "Farai Gumbo",
    business: "Gumbo Digital Studio",
    category: "business-professional",
    services: ["Marketing, Design & Branding", "IT, Web & Software"],
    city: "Harare",
    rating: 4.7,
    reviews: 52,
    priceFrom: 200,
    tier: 1,
    featured: false,
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
    category: "business-professional",
    services: ["Accounting & Tax", "Business Consulting & Advisory"],
    city: "Gweru",
    rating: 4.85,
    reviews: 39,
    priceFrom: 90,
    tier: 3,
    featured: false,
    responseTime: "Replies in ~2 hrs",
    completedJobs: 110,
    bio: "Monthly bookkeeping, payroll and management accounts for small businesses across Zimbabwe.",
    availability: "available",
    avatarColor: colors[1],
    initials: "PS",
    verifiedAt: "2024-05-20",
  },
  {
    id: "p11",
    name: "Simba Ndlovu",
    business: "Falls Luxury Concierge",
    category: "elite-concierge",
    services: [
      "VIP / Airport Meet & Greet",
      "Personal Assistants & Errands",
      "Household Staff Placement",
    ],
    city: "Victoria Falls",
    rating: 4.98,
    reviews: 28,
    priceFrom: 1200,
    tier: 4,
    featured: true,
    responseTime: "Replies in ~8 min",
    completedJobs: 95,
    bio: "Safari and adventure concierge for HNW travellers. Handling VVIP lodges, bespoke itineraries, and full-service logistics across Vic Falls and Hwange.",
    availability: "available",
    avatarColor: colors[0],
    initials: "SN",
    verifiedAt: "2025-03-14",
  },
  {
    id: "p12",
    name: "Melody Chigwanda",
    business: "Chigwanda Photography Studio",
    category: "events-production",
    services: ["Photography & Videography", "Wedding Planning & Coordination"],
    city: "Harare",
    rating: 4.92,
    reviews: 201,
    priceFrom: 280,
    tier: 3,
    featured: true,
    responseTime: "Replies in ~20 min",
    completedJobs: 385,
    bio: "Award-winning event photographer and videographer. Weddings, corporate launches, galas. Drone and studio capabilities. Pan-African portfolio.",
    availability: "available",
    avatarColor: colors[2],
    initials: "MC",
    verifiedAt: "2024-07-01",
  },
  {
    id: "p13",
    name: "Tafadzwa Gono",
    business: "Gono Wellness & Fitness",
    category: "fitness-personal-training",
    services: ["Personal Trainers", "Nutrition & Coaching"],
    city: "Bulawayo",
    rating: 4.88,
    reviews: 77,
    priceFrom: 30,
    tier: 3,
    featured: false,
    responseTime: "Replies in ~15 min",
    completedJobs: 310,
    bio: "Mobile personal trainer and wellness consultant. Tailored programmes for executives, corporate groups, and pre-event physical prep.",
    availability: "available",
    avatarColor: colors[3],
    initials: "TG",
    verifiedAt: "2025-01-09",
  },
  {
    id: "p14",
    name: "Constance Zvobgo",
    business: "Zvobgo Legal & Docs",
    category: "company-registration",
    services: ["Business Registration", "Tax & Regulatory Compliance", "Licensing"],
    city: "Masvingo",
    rating: 4.75,
    reviews: 55,
    priceFrom: 120,
    tier: 3,
    featured: false,
    responseTime: "Replies in ~1 hr",
    completedJobs: 148,
    bio: "Specialising in SME and NGO legal registration, ZIMRA returns, and immigration permit facilitation for the Southern Lowveld region.",
    availability: "available",
    avatarColor: colors[1],
    initials: "CZ",
    verifiedAt: "2024-11-20",
  },
  {
    id: "p15",
    name: "Kudzai Mupfumi",
    business: "Mupfumi Digital Agency",
    category: "business-professional",
    services: ["Marketing, Design & Branding", "IT, Web & Software", "Business Consulting & Advisory"],
    city: "Harare",
    rating: 4.8,
    reviews: 63,
    priceFrom: 250,
    tier: 2,
    featured: false,
    responseTime: "Replies in ~2 hrs",
    completedJobs: 88,
    bio: "Full-service digital agency: brand identity, social media strategy, website development, and SEO for growth-stage Zimbabwean businesses.",
    availability: "available",
    avatarColor: colors[0],
    initials: "KM",
    verifiedAt: "2025-02-05",
  },
  {
    id: "p16",
    name: "Fortune Chikomba",
    business: "VF Transfers & Logistics",
    category: "transport-logistics",
    services: ["Car Hire & Chauffeur Services", "Freight, Courier & Relocation"],
    city: "Victoria Falls",
    rating: 4.9,
    reviews: 112,
    priceFrom: 45,
    tier: 3,
    featured: false,
    responseTime: "Replies in ~12 min",
    completedJobs: 520,
    bio: "Specialist airport-to-lodge transfers and inter-city courier across Matabeleland North. 24/7 operations, safari-ready 4x4 fleet.",
    availability: "available",
    avatarColor: colors[2],
    initials: "FC",
    verifiedAt: "2024-10-15",
  },
  {
    id: "p17",
    name: "Rudo Mazvimbakupa",
    business: "Rudo Bridal & Beauty",
    category: "beauty-grooming-wellness",
    services: ["Salons & Barbers", "Spa & Skincare"],
    city: "Harare",
    rating: 5.0,
    reviews: 156,
    priceFrom: 80,
    tier: 4,
    featured: true,
    responseTime: "Replies in ~10 min",
    completedJobs: 420,
    bio: "Elite bridal hair and makeup artist. Fluent in afro-textured hair artistry, editorial looks, and full bridal party glam. Books 6 months ahead.",
    availability: "busy",
    avatarColor: colors[3],
    initials: "RM",
    verifiedAt: "2023-09-28",
  },
  {
    id: "p18",
    name: "Innocent Chisaka",
    business: "Chisaka Secure Logistics",
    category: "elite-concierge",
    services: [
      "Personal Security & Close Protection",
      "VIP / Airport Meet & Greet",
    ],
    city: "Bulawayo",
    rating: 4.93,
    reviews: 41,
    priceFrom: 600,
    tier: 4,
    featured: false,
    responseTime: "Replies in ~15 min",
    completedJobs: 178,
    bio: "Bulawayo's top close-protection and secure transport provider. Mixed close-protection and logistics team available for high-value asset movement.",
    availability: "available",
    avatarColor: colors[1],
    initials: "IC",
    verifiedAt: "2024-12-03",
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
  {
    id: "r6",
    providerId: "e1",
    client: "Ambassador K. Choto",
    rating: 5,
    date: "3 weeks ago",
    text: "Handled a diplomatic delegation of 12 flawlessly. Airport protocols, hotel, dining — all seamless. Will not use anyone else.",
  },
  {
    id: "r7",
    providerId: "e2",
    client: "Harare International School",
    rating: 5,
    date: "1 month ago",
    text: "Provided venue security for our 800-guest gala. Absolutely professional team, discreet and effective.",
  },
  {
    id: "r8",
    providerId: "p12",
    client: "Tariro & David M.",
    rating: 5,
    date: "2 weeks ago",
    text: "Melody captured our wedding in a way we didn't think was possible. Every detail preserved. Worth every dollar.",
  },
  {
    id: "r9",
    providerId: "p11",
    client: "CEO — Standard Resources Ltd",
    rating: 5,
    date: "4 weeks ago",
    text: "Organized a 5-day executive retreat in Vic Falls on 48-hour notice. Safari, helicopter transfers, private chef. Exceptional.",
  },
  {
    id: "r10",
    providerId: "p5",
    client: "Funmilayo A.",
    rating: 5,
    date: "6 days ago",
    text: "Arrived 10 minutes early, immaculate vehicle, professional driver. Set the tone for our entire Zimbabwe visit.",
  },
];

export const findProvider = (id: string) => PROVIDERS.find((p) => p.id === id);
export const findCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const providersByCategory = (slug: string) => PROVIDERS.filter((p) => p.category === slug);
export const reviewsForProvider = (id: string) => REVIEWS.filter((r) => r.providerId === id);
