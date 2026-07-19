/**
 * NexusZim Live — events, ticketing & venues data layer.
 *
 * Currently backed by curated mock data so the entire vertical works
 * end-to-end without a network. Shaped like an API layer (getters +
 * plain types) so it can be swapped for Supabase queries later.
 */

export type EventCategory =
  | "music"
  | "festival"
  | "business"
  | "arts-theatre"
  | "sports"
  | "family"
  | "nightlife"
  | "food-drink";

export const EVENT_CATEGORIES: { slug: EventCategory; label: string; icon: string }[] = [
  { slug: "music", label: "Music", icon: "Music" },
  { slug: "festival", label: "Festivals", icon: "Tent" },
  { slug: "business", label: "Business", icon: "Briefcase" },
  { slug: "arts-theatre", label: "Arts & Theatre", icon: "Drama" },
  { slug: "sports", label: "Sports", icon: "Trophy" },
  { slug: "family", label: "Family", icon: "Baby" },
  { slug: "nightlife", label: "Nightlife", icon: "MoonStar" },
  { slug: "food-drink", label: "Food & Drink", icon: "UtensilsCrossed" },
];

export type EventStatus = "on-sale" | "selling-fast" | "sold-out" | "coming-soon";

export interface TicketTier {
  id: string;
  name: string;
  price: number; // USD
  description: string;
  remaining: number; // 0 = sold out
  maxPerOrder: number;
  perks?: string[];
}

/** Poster palette for the typographic event artwork. */
export interface PosterPalette {
  bg: string;
  fg: string;
  accent: string;
}

export const POSTER_PALETTES: Record<string, PosterPalette> = {
  forest: { bg: "#081f14", fg: "#f6f5f0", accent: "#e7a020" },
  ink: { bg: "#111311", fg: "#f6f5f0", accent: "#8fd3ae" },
  oxblood: { bg: "#3d0f14", fg: "#f8f2ec", accent: "#e9b44c" },
  indigo: { bg: "#131c3a", fg: "#eef0fa", accent: "#ffb94c" },
  clay: { bg: "#4a2410", fg: "#faf3ea", accent: "#f0c66a" },
  slate: { bg: "#1d2b28", fg: "#f2f5f2", accent: "#d9a03c" },
};

export interface LiveEvent {
  id: string;
  title: string;
  category: EventCategory;
  tagline: string;
  description: string[];
  date: string; // ISO
  doors: string;
  venueId: string;
  organizerId: string;
  status: EventStatus;
  tiers: TicketTier[];
  lineup?: string[];
  tags: string[];
  palette: keyof typeof POSTER_PALETTES;
  featured?: boolean;
  expectedAttendance: string;
  ageRestriction?: string;
}

export type VenueType =
  | "conference"
  | "hotel"
  | "outdoor"
  | "gallery"
  | "stadium"
  | "garden"
  | "rooftop"
  | "theatre";

export const VENUE_TYPES: { slug: VenueType; label: string }[] = [
  { slug: "conference", label: "Conference Centre" },
  { slug: "hotel", label: "Hotel & Ballroom" },
  { slug: "outdoor", label: "Outdoor Grounds" },
  { slug: "gallery", label: "Gallery & Studio" },
  { slug: "stadium", label: "Stadium & Arena" },
  { slug: "garden", label: "Garden & Estate" },
  { slug: "rooftop", label: "Rooftop & Loft" },
  { slug: "theatre", label: "Theatre & Hall" },
];

export interface Venue {
  id: string;
  name: string;
  type: VenueType;
  city: string;
  area: string;
  capacitySeated: number;
  capacityStanding: number;
  priceFromPerDay: number; // USD
  rating: number;
  reviews: number;
  description: string;
  amenities: string[];
  idealFor: string[];
  palette: keyof typeof POSTER_PALETTES;
  featured?: boolean;
  verified: boolean;
}

export interface Organizer {
  id: string;
  name: string;
  verified: boolean;
  eventsHosted: number;
  followers: number;
  bio: string;
}

// ─────────────────────────────────────────────────────────────────
// Organizers
// ─────────────────────────────────────────────────────────────────

export const ORGANIZERS: Organizer[] = [
  {
    id: "org-magamba",
    name: "Magamba Network",
    verified: true,
    eventsHosted: 42,
    followers: 18400,
    bio: "Creative activism collective behind Zimbabwe's biggest urban culture festival.",
  },
  {
    id: "org-jibilika",
    name: "Jibilika Trust",
    verified: true,
    eventsHosted: 31,
    followers: 9600,
    bio: "Youth arts organisation championing dance and street culture since 2007.",
  },
  {
    id: "org-vfc",
    name: "Vic Falls Carnival Co.",
    verified: true,
    eventsHosted: 12,
    followers: 22100,
    bio: "Producers of Southern Africa's iconic new-year festival on the edge of the falls.",
  },
  {
    id: "org-znccm",
    name: "ZNCC Events",
    verified: true,
    eventsHosted: 58,
    followers: 7300,
    bio: "The commercial events arm of the Zimbabwe National Chamber of Commerce.",
  },
  {
    id: "org-reps",
    name: "Reps Theatre",
    verified: true,
    eventsHosted: 120,
    followers: 5400,
    bio: "Harare's home of live theatre for over 90 years.",
  },
  {
    id: "org-gastro",
    name: "Gastronomy ZW",
    verified: false,
    eventsHosted: 9,
    followers: 3100,
    bio: "Curators of Zimbabwe's most ambitious food and drink experiences.",
  },
];

// ─────────────────────────────────────────────────────────────────
// Venues
// ─────────────────────────────────────────────────────────────────

export const VENUES: Venue[] = [
  {
    id: "ven-hicc",
    name: "HICC — Rainbow Towers",
    type: "conference",
    city: "Harare",
    area: "CBD",
    capacitySeated: 4500,
    capacityStanding: 6000,
    priceFromPerDay: 3800,
    rating: 4.7,
    reviews: 86,
    description:
      "Zimbabwe's flagship conference centre. A 4,500-seat auditorium, six breakaway halls, in-house AV, and hotel accommodation in the same complex — the default choice for national summits, award shows and large-scale productions.",
    amenities: [
      "In-house AV & rigging",
      "6 breakaway halls",
      "On-site hotel (305 rooms)",
      "Secure parking (800)",
      "Backup power",
      "Catering kitchens",
      "Load-in dock",
      "Fibre internet",
    ],
    idealFor: ["Conferences", "Award ceremonies", "Concerts", "Exhibitions"],
    palette: "indigo",
    featured: true,
    verified: true,
  },
  {
    id: "ven-gardens",
    name: "Harare Gardens Main Lawn",
    type: "outdoor",
    city: "Harare",
    area: "CBD / Park Lane",
    capacitySeated: 2000,
    capacityStanding: 15000,
    priceFromPerDay: 2200,
    rating: 4.4,
    reviews: 54,
    description:
      "The city's historic central park. Sweeping lawns under mature jacarandas with room for 15,000 — the stage for Zimbabwe's biggest open-air festivals, carnivals and public celebrations.",
    amenities: [
      "15,000 standing capacity",
      "Multiple stage positions",
      "Vendor village zones",
      "City-centre access",
      "Perimeter fencing options",
      "Water points",
    ],
    idealFor: ["Festivals", "Concerts", "Public celebrations", "Fun runs"],
    palette: "forest",
    featured: true,
    verified: true,
  },
  {
    id: "ven-glamis",
    name: "Glamis Arena",
    type: "stadium",
    city: "Harare",
    area: "Exhibition Park, Samora Machel Ave",
    capacitySeated: 8000,
    capacityStanding: 25000,
    priceFromPerDay: 5500,
    rating: 4.3,
    reviews: 41,
    description:
      "The largest purpose-built show arena in the country, inside Exhibition Park. Full drive-in load access, hard standing for mega-stages, and capacity for 25,000 — where international tours land in Harare.",
    amenities: [
      "25,000 capacity",
      "Drive-in stage access",
      "Broadcast positions",
      "Ticket gate infrastructure",
      "Adjacent exhibition halls",
      "Dedicated power feeds",
    ],
    idealFor: ["Stadium concerts", "International tours", "Trade fairs"],
    palette: "ink",
    verified: true,
  },
  {
    id: "ven-meikles",
    name: "Hyatt Regency Harare (Meikles) Ballroom",
    type: "hotel",
    city: "Harare",
    area: "Jason Moyo Ave, CBD",
    capacitySeated: 600,
    capacityStanding: 900,
    priceFromPerDay: 2800,
    rating: 4.8,
    reviews: 112,
    description:
      "A century-old grand dame reborn. Crystal-chandeliered ballroom with five-star banqueting, valet service and suites upstairs — Harare's address for galas, weddings and state dinners.",
    amenities: [
      "5-star banqueting",
      "Bridal & VIP suites",
      "Valet parking",
      "In-house florist & décor",
      "Sommelier service",
      "Grand piano",
    ],
    idealFor: ["Galas", "Weddings", "State dinners", "Product launches"],
    palette: "oxblood",
    featured: true,
    verified: true,
  },
  {
    id: "ven-natgallery",
    name: "National Gallery of Zimbabwe",
    type: "gallery",
    city: "Bulawayo",
    area: "Main Street",
    capacitySeated: 250,
    capacityStanding: 450,
    priceFromPerDay: 950,
    rating: 4.6,
    reviews: 38,
    description:
      "A heritage gallery in the heart of Bulawayo. Colonnaded courtyard and exhibition wings that turn openings, recitals and intimate festivals into occasions.",
    amenities: [
      "Exhibition lighting",
      "Courtyard stage",
      "Curatorial support",
      "Climate-controlled wings",
      "Heritage architecture",
    ],
    idealFor: ["Exhibition openings", "Recitals", "Poetry & spoken word"],
    palette: "slate",
    verified: true,
  },
  {
    id: "ven-vfreserve",
    name: "Victoria Falls Private Game Reserve",
    type: "garden",
    city: "Victoria Falls",
    area: "Zambezi Drive",
    capacitySeated: 800,
    capacityStanding: 6000,
    priceFromPerDay: 4200,
    rating: 4.9,
    reviews: 67,
    description:
      "Festival grounds inside a private reserve ten minutes from the falls. Elephants at sunset, stages under the stars — the most spectacular event backdrop in Southern Africa.",
    amenities: [
      "Bush festival grounds",
      "Glamping village",
      "Game-drive add-ons",
      "Shuttle fleet",
      "Full bar concessions",
      "Helipad",
    ],
    idealFor: ["Destination festivals", "Incentive events", "Luxury weddings"],
    palette: "clay",
    featured: true,
    verified: true,
  },
  {
    id: "ven-reps",
    name: "Reps Theatre",
    type: "theatre",
    city: "Harare",
    area: "Belgravia",
    capacitySeated: 400,
    capacityStanding: 400,
    priceFromPerDay: 750,
    rating: 4.7,
    reviews: 93,
    description:
      "Zimbabwe's oldest working theatre. A proper proscenium stage, raked seating for 400, full fly tower and a bar with nine decades of stories.",
    amenities: [
      "Proscenium stage & fly tower",
      "Professional lighting rig",
      "Dressing rooms",
      "Box office system",
      "Members' bar",
      "Rehearsal space",
    ],
    idealFor: ["Theatre", "Comedy nights", "Recitals", "Film screenings"],
    palette: "oxblood",
    verified: true,
  },
  {
    id: "ven-umodzi",
    name: "The Venue @ Avondale Rooftop",
    type: "rooftop",
    city: "Harare",
    area: "Avondale",
    capacitySeated: 180,
    capacityStanding: 350,
    priceFromPerDay: 1100,
    rating: 4.5,
    reviews: 47,
    description:
      "A skyline rooftop above Avondale with sunset views over the northern suburbs. Built-in bar, DJ booth and festoon lighting — made for launches, sundowners and club nights.",
    amenities: [
      "Skyline terrace",
      "Built-in bar & DJ booth",
      "Festoon & stage lighting",
      "Weather canopy",
      "Lift access",
    ],
    idealFor: ["Product launches", "Sundowners", "Club nights", "Private parties"],
    palette: "indigo",
    verified: true,
  },
  {
    id: "ven-christmaspass",
    name: "Christmas Pass Hotel Grounds",
    type: "hotel",
    city: "Mutare",
    area: "Christmas Pass",
    capacitySeated: 500,
    capacityStanding: 3000,
    priceFromPerDay: 1400,
    rating: 4.2,
    reviews: 29,
    description:
      "Terraced gardens overlooking the Mutare valley with conference rooms and accommodation on site. Manicaland's hub for expos, weddings and corporate off-sites.",
    amenities: [
      "Valley-view terraces",
      "On-site accommodation",
      "Conference rooms",
      "Marquee-ready lawns",
      "Ample parking",
    ],
    idealFor: ["Expos", "Weddings", "Corporate retreats"],
    palette: "forest",
    verified: true,
  },
];

// ─────────────────────────────────────────────────────────────────
// Events
// ─────────────────────────────────────────────────────────────────

export const LIVE_EVENTS: LiveEvent[] = [
  {
    id: "evt-shoko-2026",
    title: "Shoko Festival 2026",
    category: "festival",
    tagline: "Southern Africa's home of urban culture — hip hop, comedy, spoken word.",
    description: [
      "For its 15th edition, Shoko takes over Harare with three days of hip hop, spoken word, comedy and digital culture. The festival that launched a generation of Zimbabwean artists returns with its biggest international line-up yet.",
      "Expect the Peace in the Hood mega-concert, the Hub conference for creatives, and late-night ciphers across the city. Day passes cover all daytime programming; the full pass adds both headline concerts.",
    ],
    date: "2026-09-24T16:00:00",
    doors: "16:00",
    venueId: "ven-gardens",
    organizerId: "org-magamba",
    status: "on-sale",
    tiers: [
      {
        id: "t-shoko-day",
        name: "Day Pass",
        price: 8,
        description: "All daytime stages and the Hub conference, one day.",
        remaining: 1400,
        maxPerOrder: 8,
      },
      {
        id: "t-shoko-full",
        name: "Full Festival Pass",
        price: 25,
        description: "All three days including both headline concerts.",
        remaining: 620,
        maxPerOrder: 6,
        perks: ["Both headline concerts", "Festival wristband", "Priority entry lanes"],
      },
      {
        id: "t-shoko-vip",
        name: "VIP Pass",
        price: 60,
        description: "Raised viewing deck, VIP bar, artist meet & greets.",
        remaining: 84,
        maxPerOrder: 4,
        perks: [
          "Raised viewing deck",
          "Dedicated VIP bar",
          "Artist meet & greet",
          "Festival merch pack",
        ],
      },
    ],
    lineup: ["Holy Ten", "Sampa the Great", "Winky D", "Feli Nandi", "MuseYamwa", "Probeatz"],
    tags: ["hip hop", "comedy", "spoken word", "conference"],
    palette: "forest",
    featured: true,
    expectedAttendance: "12,000+",
  },
  {
    id: "evt-vfc-nye",
    title: "Vic Falls Carnival — NYE Edition",
    category: "festival",
    tagline: "Three nights in the bush, one unforgettable new year at the falls.",
    description: [
      "The carnival returns to the private game reserve for its signature New Year run: three stages, a glamping village, sunrise pool sessions and the famous midnight countdown with the Zambezi as your backdrop.",
      "Travel packages with Victoria Falls hotels and shuttle transfers are available through NexusZim's verified transport partners.",
    ],
    date: "2026-12-29T14:00:00",
    doors: "14:00",
    venueId: "ven-vfreserve",
    organizerId: "org-vfc",
    status: "selling-fast",
    tiers: [
      {
        id: "t-vfc-ga",
        name: "3-Day General",
        price: 95,
        description: "Full festival access, all three nights.",
        remaining: 180,
        maxPerOrder: 6,
      },
      {
        id: "t-vfc-glamp",
        name: "3-Day + Glamping",
        price: 260,
        description: "Festival pass plus a furnished 2-person tent in the village.",
        remaining: 42,
        maxPerOrder: 2,
        perks: [
          "Furnished 2-person tent",
          "Hot showers",
          "Dedicated camp bar",
          "Morning coffee cart",
        ],
      },
      {
        id: "t-vfc-vip",
        name: "VIP Safari",
        price: 420,
        description: "VIP deck, open bar, sunset game drive for two.",
        remaining: 0,
        maxPerOrder: 2,
        perks: ["VIP viewing deck", "Open premium bar", "Sunset game drive", "Backstage tours"],
      },
    ],
    lineup: ["Black Coffee", "Makhadzi", "Jah Prayzah", "DJ Zinhle", "Bantu Continua"],
    tags: ["new year", "camping", "safari", "electronic"],
    palette: "clay",
    featured: true,
    expectedAttendance: "5,000+",
    ageRestriction: "18+",
  },
  {
    id: "evt-hiphop-awards",
    title: "Zim Hip Hop Awards 2026",
    category: "music",
    tagline: "The culture's biggest night — red carpet, live cyphers, 21 award categories.",
    description: [
      "The 15th annual Zim Hip Hop Awards celebrates the artists, producers and video directors who carried the culture this year. A full live show with performances from every nominated headliner.",
      "Black tie meets streetwear. Doors open early for the red carpet; the main show starts 20:00 sharp.",
    ],
    date: "2026-08-08T18:00:00",
    doors: "18:00",
    venueId: "ven-hicc",
    organizerId: "org-jibilika",
    status: "on-sale",
    tiers: [
      {
        id: "t-zhha-ga",
        name: "General Seating",
        price: 20,
        description: "Reserved auditorium seating, upper tiers.",
        remaining: 900,
        maxPerOrder: 8,
      },
      {
        id: "t-zhha-premium",
        name: "Premium Floor",
        price: 45,
        description: "Floor seating close to the stage and red carpet.",
        remaining: 210,
        maxPerOrder: 6,
        perks: ["Front-section floor seats", "Welcome drink"],
      },
      {
        id: "t-zhha-table",
        name: "VIP Table (seats 8)",
        price: 480,
        description: "Full table for eight with bottle service at the stage edge.",
        remaining: 6,
        maxPerOrder: 1,
        perks: ["Seats 8 guests", "Bottle service", "After-party access", "Programme & gift bags"],
      },
    ],
    lineup: ["Holy Ten", "Saintfloew", "Voltz JT", "Bagga", "Ti Gonzi"],
    tags: ["awards", "hip hop", "red carpet"],
    palette: "ink",
    featured: true,
    expectedAttendance: "3,500+",
  },
  {
    id: "evt-byo-arts",
    title: "Bulawayo Arts Festival",
    category: "arts-theatre",
    tagline: "A week of theatre, dance and visual art in the City of Kings.",
    description: [
      "Intwasa's sister festival transforms the National Gallery and surrounding streets into a week-long celebration of Matabeleland's artists: gallery takeovers, courtyard theatre, dance battles and craft markets.",
    ],
    date: "2026-08-15T10:00:00",
    doors: "10:00",
    venueId: "ven-natgallery",
    organizerId: "org-jibilika",
    status: "on-sale",
    tiers: [
      {
        id: "t-baf-day",
        name: "Day Ticket",
        price: 5,
        description: "All gallery exhibitions and courtyard performances, one day.",
        remaining: 380,
        maxPerOrder: 10,
      },
      {
        id: "t-baf-week",
        name: "Festival Week Pass",
        price: 22,
        description: "Unlimited access across all seven days.",
        remaining: 120,
        maxPerOrder: 4,
        perks: ["All 7 days", "Opening night reception", "Printed catalogue"],
      },
    ],
    lineup: ["Iyasa", "Umkhathi Theatre Works", "Sandra Ndebele", "Asaph"],
    tags: ["theatre", "dance", "visual art", "craft market"],
    palette: "slate",
    expectedAttendance: "1,500+",
  },
  {
    id: "evt-zncc-summit",
    title: "ZNCC National Business Summit",
    category: "business",
    tagline: "Two days. 60 speakers. Zimbabwe's boardroom under one roof.",
    description: [
      "The Chamber's flagship summit brings together CEOs, policymakers and investors for two days of keynotes, deal rooms and sector round-tables on the theme 'Building the $100B Economy'.",
      "Delegate passes include all sessions, lunches and the networking cocktail. Corporate tables include branding and a private deal room slot.",
    ],
    date: "2026-10-07T08:00:00",
    doors: "07:30",
    venueId: "ven-hicc",
    organizerId: "org-znccm",
    status: "on-sale",
    tiers: [
      {
        id: "t-zncc-delegate",
        name: "Delegate Pass",
        price: 180,
        description: "Both days, all sessions, lunches and cocktail evening.",
        remaining: 460,
        maxPerOrder: 10,
        perks: ["All keynotes & round-tables", "Lunch both days", "Networking cocktail"],
      },
      {
        id: "t-zncc-exec",
        name: "Executive Pass",
        price: 350,
        description: "Delegate benefits plus deal-room access and speaker dinners.",
        remaining: 90,
        maxPerOrder: 4,
        perks: ["Deal-room access", "Speaker dinner seats", "Front-row reserved seating"],
      },
    ],
    tags: ["summit", "networking", "investment"],
    palette: "indigo",
    expectedAttendance: "1,200+",
  },
  {
    id: "evt-reps-inspector",
    title: "An Inspector Calls — Reps Theatre",
    category: "arts-theatre",
    tagline: "Priestley's masterpiece, staged by Zimbabwe's oldest company.",
    description: [
      "Reps' 2026 season opens with J.B. Priestley's thriller of conscience and class. A three-week run with the full company, period staging and live foley.",
      "Evening shows Wednesday–Saturday at 19:00, matinees Sunday at 15:00.",
    ],
    date: "2026-08-05T19:00:00",
    doors: "18:15",
    venueId: "ven-reps",
    organizerId: "org-reps",
    status: "on-sale",
    tiers: [
      {
        id: "t-reps-std",
        name: "Standard Seat",
        price: 12,
        description: "Raked auditorium seating, rows F–P.",
        remaining: 240,
        maxPerOrder: 8,
      },
      {
        id: "t-reps-premium",
        name: "Premium Stalls",
        price: 18,
        description: "Rows A–E, centre stalls.",
        remaining: 60,
        maxPerOrder: 6,
        perks: ["Best sightlines", "Interval drink voucher"],
      },
    ],
    tags: ["theatre", "drama", "classic"],
    palette: "oxblood",
    expectedAttendance: "400 / show",
  },
  {
    id: "evt-mutare-expo",
    title: "Mutare Business Expo",
    category: "business",
    tagline: "Manicaland's marketplace — 200 exhibitors, three days of trade.",
    description: [
      "The eastern region's biggest trade show returns to Christmas Pass with 200+ exhibitors across agriculture, mining supply, tourism and SME services. Free-flowing expo floor with ticketed masterclass tracks.",
    ],
    date: "2026-09-10T09:00:00",
    doors: "09:00",
    venueId: "ven-christmaspass",
    organizerId: "org-znccm",
    status: "on-sale",
    tiers: [
      {
        id: "t-expo-entry",
        name: "Expo Entry",
        price: 3,
        description: "Expo floor access, one day.",
        remaining: 2600,
        maxPerOrder: 10,
      },
      {
        id: "t-expo-master",
        name: "Masterclass Track",
        price: 25,
        description: "Expo entry plus all masterclass sessions, one day.",
        remaining: 140,
        maxPerOrder: 5,
        perks: ["All masterclasses", "Workbook & materials", "Lunch voucher"],
      },
    ],
    tags: ["trade", "SME", "exhibition"],
    palette: "forest",
    expectedAttendance: "8,000+",
  },
  {
    id: "evt-rooftop-sessions",
    title: "Avondale Rooftop Sessions: Amapiano Edition",
    category: "nightlife",
    tagline: "Sunset to sunrise above the city — strictly amapiano.",
    description: [
      "The monthly rooftop series turns up its flagship edition: four selectors, log-drum bass under festoon lights, and the best skyline in Harare. Limited capacity, always sells out.",
    ],
    date: "2026-08-01T17:00:00",
    doors: "17:00",
    venueId: "ven-umodzi",
    organizerId: "org-magamba",
    status: "selling-fast",
    tiers: [
      {
        id: "t-roof-early",
        name: "Early Bird",
        price: 10,
        description: "Entry before 19:00.",
        remaining: 0,
        maxPerOrder: 4,
      },
      {
        id: "t-roof-ga",
        name: "General",
        price: 15,
        description: "Full-night access.",
        remaining: 64,
        maxPerOrder: 6,
      },
      {
        id: "t-roof-booth",
        name: "Skyline Booth (6 guests)",
        price: 150,
        description: "Reserved booth with skyline view and bottle service.",
        remaining: 2,
        maxPerOrder: 1,
        perks: ["Seats 6", "Bottle service", "Skip-the-line entry"],
      },
    ],
    lineup: ["DJ Sarge", "Naiboi ZW", "Tempss", "C-Nile"],
    tags: ["amapiano", "rooftop", "sunset"],
    palette: "indigo",
    featured: true,
    expectedAttendance: "350",
    ageRestriction: "18+",
  },
  {
    id: "evt-castle-derby",
    title: "Castle Challenge Cup — Dynamos vs Highlanders",
    category: "sports",
    tagline: "The Battle of Zimbabwe returns to Glamis Arena.",
    description: [
      "The country's fiercest football rivalry, staged as a cup showpiece with pre-match entertainment, half-time legends parade and family stands. Gates open three hours before kick-off.",
    ],
    date: "2026-09-27T15:00:00",
    doors: "12:00",
    venueId: "ven-glamis",
    organizerId: "org-znccm",
    status: "on-sale",
    tiers: [
      {
        id: "t-derby-rest",
        name: "Rest of Ground",
        price: 5,
        description: "Open terraces, first-come standing.",
        remaining: 14000,
        maxPerOrder: 10,
      },
      {
        id: "t-derby-grand",
        name: "Grandstand",
        price: 12,
        description: "Covered seated grandstand.",
        remaining: 3200,
        maxPerOrder: 8,
      },
      {
        id: "t-derby-vvip",
        name: "VVIP Hospitality",
        price: 80,
        description: "Halfway-line suite with lunch and open bar.",
        remaining: 48,
        maxPerOrder: 4,
        perks: ["Halfway-line suite", "Buffet lunch", "Open bar", "Secure parking"],
      },
    ],
    tags: ["football", "derby", "cup final"],
    palette: "ink",
    expectedAttendance: "22,000+",
  },
  {
    id: "evt-harare-wine",
    title: "Harare Wine & Food Affair",
    category: "food-drink",
    tagline: "40 wineries, 18 kitchens, one golden afternoon.",
    description: [
      "Gastronomy ZW's signature tasting festival pairs Southern African wineries with Harare's most exciting kitchens on the lawns of the Hyatt. Tasting coupons included with every ticket; masterclasses run hourly.",
    ],
    date: "2026-10-17T12:00:00",
    doors: "12:00",
    venueId: "ven-meikles",
    organizerId: "org-gastro",
    status: "coming-soon",
    tiers: [
      {
        id: "t-wine-ga",
        name: "Tasting Ticket",
        price: 35,
        description: "Entry plus 12 tasting coupons and a keepsake glass.",
        remaining: 500,
        maxPerOrder: 6,
        perks: ["12 tasting coupons", "Keepsake glass"],
      },
      {
        id: "t-wine-connoisseur",
        name: "Connoisseur",
        price: 75,
        description: "Unlimited pours, reserved masterclass seats, chef's table lunch.",
        remaining: 80,
        maxPerOrder: 4,
        perks: ["Unlimited tasting pours", "Reserved masterclass seats", "Chef's table lunch"],
      },
    ],
    tags: ["wine", "tasting", "masterclass"],
    palette: "oxblood",
    expectedAttendance: "1,800",
    ageRestriction: "18+",
  },
  {
    id: "evt-family-funday",
    title: "Great Zimbabwe Family Fun Day",
    category: "family",
    tagline: "Bouncy castles to bush walks — a full day out for the whole clan.",
    description: [
      "A family festival on the Christmas Pass terraces: kids' zones, pony rides, craft workshops, a farmers' market and an evening open-air movie under the stars. Under-5s free.",
    ],
    date: "2026-08-22T09:00:00",
    doors: "09:00",
    venueId: "ven-christmaspass",
    organizerId: "org-gastro",
    status: "on-sale",
    tiers: [
      {
        id: "t-fun-child",
        name: "Child (5–15)",
        price: 2,
        description: "All kids' zones and workshops.",
        remaining: 800,
        maxPerOrder: 10,
      },
      {
        id: "t-fun-adult",
        name: "Adult",
        price: 5,
        description: "Full grounds access.",
        remaining: 1200,
        maxPerOrder: 10,
      },
      {
        id: "t-fun-family",
        name: "Family Bundle (2+3)",
        price: 12,
        description: "Two adults and three children, plus a picnic-spot reservation.",
        remaining: 150,
        maxPerOrder: 3,
        perks: ["Reserved picnic spot", "Popcorn vouchers for the movie night"],
      },
    ],
    tags: ["kids", "outdoor", "market", "movie night"],
    palette: "forest",
    expectedAttendance: "3,000+",
  },
  {
    id: "evt-jazz-invitational",
    title: "Harare International Jazz Invitational",
    category: "music",
    tagline: "One night, five bands, the ballroom at its best.",
    description: [
      "An evening of African jazz in the Hyatt ballroom: Zimbabwe's finest players joined by guests from Cape Town and Lagos. Cabaret seating with table service throughout.",
    ],
    date: "2026-11-14T19:00:00",
    doors: "18:00",
    venueId: "ven-meikles",
    organizerId: "org-reps",
    status: "on-sale",
    tiers: [
      {
        id: "t-jazz-cabaret",
        name: "Cabaret Seat",
        price: 40,
        description: "Shared cabaret table, full table service.",
        remaining: 260,
        maxPerOrder: 8,
      },
      {
        id: "t-jazz-table",
        name: "Private Table (6)",
        price: 300,
        description: "Reserved table for six with a welcome bottle of MCC.",
        remaining: 12,
        maxPerOrder: 2,
        perks: ["Seats 6", "Welcome bottle of MCC", "Best-in-room placement"],
      },
    ],
    lineup: ["Filbert Marova Trio", "Hope Masike", "The Cool Crooners", "Nduduzo Makhathini"],
    tags: ["jazz", "live band", "cabaret"],
    palette: "slate",
    expectedAttendance: "700",
  },
];

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

export const SERVICE_FEE_RATE = 0.08; // 8% platform fee, shown all-in DICE-style
export const SERVICE_FEE_MIN = 0.5; // USD minimum per ticket

export function ticketFee(price: number): number {
  if (price === 0) return 0;
  return Math.max(price * SERVICE_FEE_RATE, SERVICE_FEE_MIN);
}

export function allInPrice(price: number): number {
  return price + ticketFee(price);
}

export function getEvent(id: string): LiveEvent | undefined {
  return LIVE_EVENTS.find((e) => e.id === id);
}

export function getVenue(id: string): Venue | undefined {
  return VENUES.find((v) => v.id === id);
}

export function getOrganizer(id: string): Organizer | undefined {
  return ORGANIZERS.find((o) => o.id === id);
}

export function eventsAtVenue(venueId: string): LiveEvent[] {
  return LIVE_EVENTS.filter((e) => e.venueId === venueId);
}

export function relatedEvents(event: LiveEvent, limit = 3): LiveEvent[] {
  const venue = getVenue(event.venueId);
  return LIVE_EVENTS.filter((e) => e.id !== event.id)
    .map((e) => {
      let score = 0;
      if (e.category === event.category) score += 3;
      const eCity = getVenue(e.venueId)?.city;
      if (venue && eCity === venue.city) score += 2;
      if (e.featured) score += 1;
      return { e, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.e);
}

export function eventCity(event: LiveEvent): string {
  return getVenue(event.venueId)?.city ?? "";
}

export function eventPriceFrom(event: LiveEvent): number {
  const open = event.tiers.filter((t) => t.remaining > 0);
  const pool = open.length > 0 ? open : event.tiers;
  return Math.min(...pool.map((t) => t.price));
}

export function categoryLabel(slug: EventCategory): string {
  return EVENT_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export function venueTypeLabel(slug: VenueType): string {
  return VENUE_TYPES.find((t) => t.slug === slug)?.label ?? slug;
}

export function formatEventDate(iso: string, opts?: { weekday?: boolean }): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    ...(opts?.weekday !== false ? { weekday: "short" } : {}),
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatEventTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function formatMoney(usd: number): string {
  return usd % 1 === 0 ? `$${usd}` : `$${usd.toFixed(2)}`;
}

export const STATUS_META: Record<
  EventStatus,
  { label: string; tone: "open" | "warn" | "closed" | "soon" }
> = {
  "on-sale": { label: "On Sale", tone: "open" },
  "selling-fast": { label: "Selling Fast", tone: "warn" },
  "sold-out": { label: "Sold Out", tone: "closed" },
  "coming-soon": { label: "Coming Soon", tone: "soon" },
};
