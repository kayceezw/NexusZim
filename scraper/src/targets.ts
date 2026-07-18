export type { BrowserTarget } from "./browser.js";

export type ScrapeTarget = {
  name: string;
  source_name?: string;
  label: string;        // e.g. "venues", "lodges"
  url: string;
  selectors: {
    listItem: string;   // container per business
    name: string[];     // fallback chain for business name
    phone: string[];
    website: string[];
    address: string[];
    description: string[];
    email: string[];
  };
};

// Zimbabwe category → NexusZim category mapping
export const CATEGORY_MAP: Record<string, string> = {
  venue: "events-production",
  "function hall": "events-production",
  "conference centre": "events-production",
  "event venue": "events-production",
  lodge: "property-services",
  guesthouse: "property-services",
  resort: "property-services",
  hotel: "property-services",
  safari: "property-services",
  "travel agency": "transport-logistics",
  "tour operator": "transport-logistics",
  transport: "transport-logistics",
  logistics: "transport-logistics",
  courier: "transport-logistics",
  security: "business-professional",
  "security company": "business-professional",
  "company registration": "visa-immigration",
  "legal services": "visa-immigration",
  lawyers: "visa-immigration",
  catering: "food-catering",
  restaurant: "food-catering",
};

// ─── yellowpages.co.zw ───────────────────────────────────────────────────────
// Typical ZW directory with category-based listings
const YP_BASE = "https://www.yellowpages.co.zw";
const YP_SELECTORS = {
  listItem: ".listing, .business-listing, .result-item, article.listing, .directory-item, li.item",
  name: [".listing-name", "h2.name", "h3.name", ".business-name", "h2 a", "h3 a", ".title a"],
  phone: [".phone", ".telephone", "[href^='tel:']", ".contact-phone"],
  website: [".website a", "a.website", "[href*='http']:not([href*='yellowpages'])"],
  address: [".address", ".location", ".city", ".suburb"],
  description: [".description", ".tagline", ".bio", ".excerpt", "p.description"],
  email: ["[href^='mailto:']", ".email"],
};

export const TARGETS: ScrapeTarget[] = [
  {
    name: "yellowpages.co.zw",
    label: "venues",
    url: `${YP_BASE}/search?q=function+venue+hall&location=Zimbabwe`,
    selectors: YP_SELECTORS,
  },
  {
    name: "yellowpages.co.zw",
    label: "events-production",
    url: `${YP_BASE}/search?q=events+production+company&location=Zimbabwe`,
    selectors: YP_SELECTORS,
  },
  {
    name: "yellowpages.co.zw",
    label: "lodges",
    url: `${YP_BASE}/search?q=lodge+guesthouse&location=Zimbabwe`,
    selectors: YP_SELECTORS,
  },
  {
    name: "yellowpages.co.zw",
    label: "resorts",
    url: `${YP_BASE}/search?q=resort+safari&location=Zimbabwe`,
    selectors: YP_SELECTORS,
  },
  {
    name: "yellowpages.co.zw",
    label: "travel-agencies",
    url: `${YP_BASE}/search?q=travel+agency+tour+operator&location=Zimbabwe`,
    selectors: YP_SELECTORS,
  },
  {
    name: "yellowpages.co.zw",
    label: "security",
    url: `${YP_BASE}/search?q=security+company&location=Zimbabwe`,
    selectors: YP_SELECTORS,
  },
  {
    name: "yellowpages.co.zw",
    label: "company-registration",
    url: `${YP_BASE}/search?q=company+registration+legal&location=Zimbabwe`,
    selectors: YP_SELECTORS,
  },
  {
    name: "yellowpages.co.zw",
    label: "transport",
    url: `${YP_BASE}/search?q=transport+logistics+courier&location=Zimbabwe`,
    selectors: YP_SELECTORS,
  },
  {
    name: "yellowpages.co.zw",
    label: "catering",
    url: `${YP_BASE}/search?q=catering+food+services&location=Zimbabwe`,
    selectors: YP_SELECTORS,
  },

  // ─── infopages.co.zw ─────────────────────────────────────────────────────
  {
    name: "infopages.co.zw",
    label: "venues",
    url: "https://www.infopages.co.zw/search?cat=venues",
    selectors: {
      listItem: ".listing, .business, .entry, li.result, .card",
      name: ["h2", "h3", ".name", ".title", "a.title"],
      phone: ["[href^='tel:']", ".phone", ".tel"],
      website: ["a.website", ".website a", "a[href^='http']"],
      address: [".address", ".location", ".area"],
      description: [".description", ".summary", "p"],
      email: ["[href^='mailto:']"],
    },
  },
  {
    name: "infopages.co.zw",
    label: "lodges",
    url: "https://www.infopages.co.zw/search?cat=accommodation",
    selectors: {
      listItem: ".listing, .business, .entry, li.result, .card",
      name: ["h2", "h3", ".name", ".title", "a.title"],
      phone: ["[href^='tel:']", ".phone", ".tel"],
      website: ["a.website", ".website a", "a[href^='http']"],
      address: [".address", ".location", ".area"],
      description: [".description", ".summary", "p"],
      email: ["[href^='mailto:']"],
    },
  },
  {
    name: "infopages.co.zw",
    label: "security",
    url: "https://www.infopages.co.zw/search?cat=security",
    selectors: {
      listItem: ".listing, .business, .entry, li.result, .card",
      name: ["h2", "h3", ".name", ".title", "a.title"],
      phone: ["[href^='tel:']", ".phone", ".tel"],
      website: ["a.website", ".website a", "a[href^='http']"],
      address: [".address", ".location", ".area"],
      description: [".description", ".summary", "p"],
      email: ["[href^='mailto:']"],
    },
  },
];

// ─── Social media — browser-rendered targets ─────────────────────────────────

import type { BrowserTarget } from "./browser.js";

const GM_BASE = "https://www.google.com/maps/search";
const FB_BASE = "https://www.facebook.com/search/pages/?q";

export const BROWSER_TARGETS: BrowserTarget[] = [
  // Google Maps — reliable, no login, rich name+address data
  {
    name: "google-maps",
    source_name: "google.com/maps",
    label: "venues",
    url: `${GM_BASE}/event+venue+function+hall+harare+zimbabwe`,
    platform: "google-maps",
  },
  {
    name: "google-maps",
    source_name: "google.com/maps",
    label: "lodges",
    url: `${GM_BASE}/lodge+guesthouse+harare+zimbabwe`,
    platform: "google-maps",
  },
  {
    name: "google-maps",
    source_name: "google.com/maps",
    label: "resorts",
    url: `${GM_BASE}/resort+safari+lodge+zimbabwe`,
    platform: "google-maps",
  },
  {
    name: "google-maps",
    source_name: "google.com/maps",
    label: "travel-agencies",
    url: `${GM_BASE}/travel+agency+tour+operator+harare+zimbabwe`,
    platform: "google-maps",
  },
  {
    name: "google-maps",
    source_name: "google.com/maps",
    label: "security",
    url: `${GM_BASE}/security+company+harare+zimbabwe`,
    platform: "google-maps",
  },
  {
    name: "google-maps",
    source_name: "google.com/maps",
    label: "catering",
    url: `${GM_BASE}/catering+company+harare+zimbabwe`,
    platform: "google-maps",
  },
  {
    name: "google-maps",
    source_name: "google.com/maps",
    label: "transport",
    url: `${GM_BASE}/transport+logistics+courier+harare+zimbabwe`,
    platform: "google-maps",
  },

  // Facebook Business Pages — best-effort, partial results before login wall
  {
    name: "facebook.com",
    label: "venues",
    url: `${FB_BASE}=event+venue+function+hall+zimbabwe`,
    platform: "facebook",
  },
  {
    name: "facebook.com",
    label: "lodges",
    url: `${FB_BASE}=lodge+guesthouse+zimbabwe`,
    platform: "facebook",
  },
  {
    name: "facebook.com",
    label: "events-production",
    url: `${FB_BASE}=events+production+company+zimbabwe`,
    platform: "facebook",
  },
  {
    name: "facebook.com",
    label: "security",
    url: `${FB_BASE}=security+company+zimbabwe`,
    platform: "facebook",
  },
  {
    name: "facebook.com",
    label: "catering",
    url: `${FB_BASE}=catering+company+harare+zimbabwe`,
    platform: "facebook",
  },
];

// Guess NexusZim category from scraped label/description
export function guessCategory(label: string, description = ""): string {
  const text = `${label} ${description}`.toLowerCase();
  for (const [keyword, cat] of Object.entries(CATEGORY_MAP)) {
    if (text.includes(keyword)) return cat;
  }
  return "business-professional";
}
