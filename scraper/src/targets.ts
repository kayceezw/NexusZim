export type ScrapeTarget = {
  name: string;
  label: string;
  url: string;
  selectors: {
    listItem: string;
    name: string[];
    phone: string[];
    website: string[];
    address: string[];
    description: string[];
    email: string[];
    socialLinks: string[];   // Facebook, Instagram, Twitter, LinkedIn hrefs
  };
};

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

// Shared social link selectors — picks up FB/IG/TW/LI icons any directory includes
const SOCIAL_SELECTORS = [
  "[href*='facebook.com']",
  "[href*='instagram.com']",
  "[href*='twitter.com']",
  "[href*='x.com']",
  "[href*='linkedin.com']",
  "[href*='tiktok.com']",
  "[href*='youtube.com']",
];

// ─── yellowpages.co.zw ───────────────────────────────────────────────────────
const YP_BASE = "https://www.yellowpages.co.zw";
const YP_SELECTORS = {
  listItem: ".listing, .business-listing, .result-item, article.listing, .directory-item, li.item",
  name: [".listing-name", "h2.name", "h3.name", ".business-name", "h2 a", "h3 a", ".title a"],
  phone: [".phone", ".telephone", "[href^='tel:']", ".contact-phone"],
  website: [".website a", "a.website", "[href*='http']:not([href*='yellowpages'])"],
  address: [".address", ".location", ".city", ".suburb"],
  description: [".description", ".tagline", ".bio", ".excerpt", "p.description"],
  email: ["[href^='mailto:']", ".email"],
  socialLinks: SOCIAL_SELECTORS,
};

// ─── infopages.co.zw ─────────────────────────────────────────────────────────
const IP_SELECTORS = {
  listItem: ".listing, .business, .entry, li.result, .card",
  name: ["h2", "h3", ".name", ".title", "a.title"],
  phone: ["[href^='tel:']", ".phone", ".tel"],
  website: ["a.website", ".website a", "a[href^='http']"],
  address: [".address", ".location", ".area"],
  description: [".description", ".summary", "p"],
  email: ["[href^='mailto:']"],
  socialLinks: SOCIAL_SELECTORS,
};

// ─── Bing search — Zimbabwe businesses on Facebook ────────────────────────────
// Bing is more scraper-friendly than Google; results pages include titles + URLs
// which we parse to extract Facebook page references
const BING_SELECTORS = {
  listItem: "#b_results li.b_algo, .b_algo",
  name: ["h2 a", "h2", ".b_title a"],
  phone: [],
  website: ["h2 a", "cite"],
  address: [".b_caption p", ".b_snippet"],
  description: [".b_caption p", ".b_snippet"],
  email: [],
  socialLinks: ["[href*='facebook.com']", "[href*='instagram.com']"],
};

export const TARGETS: ScrapeTarget[] = [
  // ── Directory: yellowpages.co.zw ──────────────────────────────────────────
  { name: "yellowpages.co.zw", label: "venues",              url: `${YP_BASE}/search?q=function+venue+hall&location=Zimbabwe`,         selectors: YP_SELECTORS },
  { name: "yellowpages.co.zw", label: "events-production",   url: `${YP_BASE}/search?q=events+production+company&location=Zimbabwe`,   selectors: YP_SELECTORS },
  { name: "yellowpages.co.zw", label: "lodges",              url: `${YP_BASE}/search?q=lodge+guesthouse&location=Zimbabwe`,            selectors: YP_SELECTORS },
  { name: "yellowpages.co.zw", label: "resorts",             url: `${YP_BASE}/search?q=resort+safari&location=Zimbabwe`,              selectors: YP_SELECTORS },
  { name: "yellowpages.co.zw", label: "travel-agencies",     url: `${YP_BASE}/search?q=travel+agency+tour+operator&location=Zimbabwe`, selectors: YP_SELECTORS },
  { name: "yellowpages.co.zw", label: "security",            url: `${YP_BASE}/search?q=security+company&location=Zimbabwe`,           selectors: YP_SELECTORS },
  { name: "yellowpages.co.zw", label: "company-registration",url: `${YP_BASE}/search?q=company+registration+legal&location=Zimbabwe`, selectors: YP_SELECTORS },
  { name: "yellowpages.co.zw", label: "transport",           url: `${YP_BASE}/search?q=transport+logistics+courier&location=Zimbabwe`, selectors: YP_SELECTORS },
  { name: "yellowpages.co.zw", label: "catering",            url: `${YP_BASE}/search?q=catering+food+services&location=Zimbabwe`,     selectors: YP_SELECTORS },

  // ── Directory: infopages.co.zw ────────────────────────────────────────────
  { name: "infopages.co.zw", label: "venues",    url: "https://www.infopages.co.zw/search?cat=venues",        selectors: IP_SELECTORS },
  { name: "infopages.co.zw", label: "lodges",    url: "https://www.infopages.co.zw/search?cat=accommodation", selectors: IP_SELECTORS },
  { name: "infopages.co.zw", label: "security",  url: "https://www.infopages.co.zw/search?cat=security",      selectors: IP_SELECTORS },

  // ── Social: Bing search for Zimbabwe businesses on Facebook ──────────────
  {
    name: "bing-social",
    label: "venues",
    url: "https://www.bing.com/search?q=site%3Afacebook.com+venue+%22Zimbabwe%22+%22Harare%22",
    selectors: BING_SELECTORS,
  },
  {
    name: "bing-social",
    label: "lodges",
    url: "https://www.bing.com/search?q=site%3Afacebook.com+lodge+%22Zimbabwe%22",
    selectors: BING_SELECTORS,
  },
  {
    name: "bing-social",
    label: "resorts",
    url: "https://www.bing.com/search?q=site%3Afacebook.com+resort+safari+%22Zimbabwe%22",
    selectors: BING_SELECTORS,
  },
  {
    name: "bing-social",
    label: "travel-agencies",
    url: "https://www.bing.com/search?q=site%3Afacebook.com+travel+agency+%22Zimbabwe%22",
    selectors: BING_SELECTORS,
  },
  {
    name: "bing-social",
    label: "security",
    url: "https://www.bing.com/search?q=site%3Afacebook.com+security+company+%22Zimbabwe%22",
    selectors: BING_SELECTORS,
  },
  {
    name: "bing-social",
    label: "events-production",
    url: "https://www.bing.com/search?q=site%3Afacebook.com+events+production+%22Zimbabwe%22+%22Harare%22",
    selectors: BING_SELECTORS,
  },
  {
    name: "bing-social",
    label: "catering",
    url: "https://www.bing.com/search?q=site%3Afacebook.com+catering+%22Zimbabwe%22+%22Harare%22",
    selectors: BING_SELECTORS,
  },
];

export function guessCategory(label: string, description = ""): string {
  const text = `${label} ${description}`.toLowerCase();
  for (const [keyword, cat] of Object.entries(CATEGORY_MAP)) {
    if (text.includes(keyword)) return cat;
  }
  return "business-professional";
}
