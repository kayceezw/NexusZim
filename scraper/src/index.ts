/**
 * NexusZim daily web scraper
 * Targets Zimbabwe business directories + social media (via Bing) →
 * writes leads to scraper_queue table for admin review.
 *
 * Usage:
 *   bun run scrape                # live run, writes to Supabase
 *   DRY_RUN=true bun run scrape   # dry run, logs only
 */

import { load } from "cheerio";
import { gotScraping } from "got-scraping";
import { createClient } from "@supabase/supabase-js";
import { TARGETS, guessCategory, type ScrapeTarget } from "./targets.js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const DRY_RUN = process.env.DRY_RUN === "true";
const DELAY_MS = 3000; // polite delay between requests

if (!DRY_RUN && (!SUPABASE_URL || !SUPABASE_KEY)) {
  console.error("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = !DRY_RUN ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

type Lead = {
  business_name: string;
  category_guess: string;
  city: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  description: string | null;
  source_url: string;
  source_name: string;
  raw_data: Record<string, unknown>;
};

function pickFirst($item: ReturnType<ReturnType<typeof load>>, selectors: string[]): string | null {
  for (const sel of selectors) {
    const el = $item.find(sel).first();
    if (!el.length) continue;
    const text = sel.includes("href")
      ? (el.attr("href") ?? "").replace(/^tel:|^mailto:/, "").trim()
      : el.text().trim();
    if (text) return text;
  }
  return null;
}

function extractWebsite(
  $item: ReturnType<ReturnType<typeof load>>,
  selectors: string[],
  sourceDomain: string,
): string | null {
  const SOCIAL_DOMAINS = ["facebook.com", "instagram.com", "twitter.com", "x.com", "linkedin.com", "tiktok.com", "youtube.com"];
  for (const sel of selectors) {
    const els = $item.find(sel);
    for (let i = 0; i < els.length; i++) {
      const href = els.eq(i).attr("href") ?? "";
      if (
        href.startsWith("http") &&
        !href.includes(sourceDomain) &&
        !SOCIAL_DOMAINS.some((d) => href.includes(d))
      ) {
        return href.trim();
      }
    }
  }
  return null;
}

function extractSocialLinks(
  $item: ReturnType<ReturnType<typeof load>>,
  selectors: string[],
): Record<string, string> {
  const links: Record<string, string> = {};
  const platformMap: Record<string, string> = {
    "facebook.com": "facebook",
    "instagram.com": "instagram",
    "twitter.com": "twitter",
    "x.com": "twitter",
    "linkedin.com": "linkedin",
    "tiktok.com": "tiktok",
    "youtube.com": "youtube",
  };

  for (const sel of selectors) {
    const els = $item.find(sel);
    for (let i = 0; i < els.length; i++) {
      const href = (els.eq(i).attr("href") ?? "").trim();
      if (!href) continue;
      for (const [domain, platform] of Object.entries(platformMap)) {
        if (href.includes(domain) && !links[platform]) {
          links[platform] = href;
          break;
        }
      }
    }
  }
  return links;
}

function extractCity(address: string | null): string | null {
  if (!address) return null;
  const ZW_CITIES = [
    "Harare", "Bulawayo", "Mutare", "Gweru", "Kwekwe", "Kadoma",
    "Masvingo", "Chinhoyi", "Victoria Falls", "Bindura", "Chegutu",
  ];
  for (const city of ZW_CITIES) {
    if (address.toLowerCase().includes(city.toLowerCase())) return city;
  }
  return address.split(",")[0]?.trim() || null;
}

async function scrapeTarget(target: ScrapeTarget): Promise<Lead[]> {
  const leads: Lead[] = [];
  const isSocial = target.name.startsWith("bing-");
  console.log(`\n[${target.name}${isSocial ? " 📱" : ""}] ${target.label} → ${target.url}`);

  let html: string;
  try {
    const res = await gotScraping({
      url: target.url,
      headers: {
        "Accept-Language": "en-GB,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      timeout: { request: 20_000 },
    });
    html = res.body as string;
  } catch (err) {
    console.warn(`  SKIP — fetch failed: ${(err as Error).message}`);
    return leads;
  }

  const $ = load(html);
  const items = $(target.selectors.listItem);
  console.log(`  Found ${items.length} listing elements`);

  items.each((_i, el) => {
    const $el = $(el);

    const rawName = pickFirst($el, target.selectors.name);
    if (!rawName || rawName.length < 3) return;

    const rawAddress = pickFirst($el, target.selectors.address);
    const rawPhone = pickFirst($el, target.selectors.phone);
    const rawEmail = pickFirst($el, target.selectors.email);
    const rawDesc = pickFirst($el, target.selectors.description);
    const website = extractWebsite($el, target.selectors.website, target.name);
    const socialLinks = extractSocialLinks($el, target.selectors.socialLinks);
    const city = extractCity(rawAddress);
    const category = guessCategory(target.label, rawDesc ?? "");

    // For Bing social results, use the Facebook page URL as the website if no other website found
    const finalWebsite = website ?? (socialLinks.facebook ?? null);

    leads.push({
      business_name: rawName,
      category_guess: category,
      city,
      phone: rawPhone,
      website: finalWebsite,
      email: rawEmail,
      description: rawDesc,
      source_url: target.url,
      source_name: target.name,
      raw_data: {
        label: target.label,
        address: rawAddress ?? "",
        social: socialLinks,
        is_social_lead: isSocial,
      },
    });
  });

  console.log(`  Extracted ${leads.length} leads${Object.keys(leads.flatMap ? {} : {}).length > 0 ? " (with social links)" : ""}`);
  return leads;
}

async function upsertLeads(leads: Lead[]): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;

  for (const lead of leads) {
    if (DRY_RUN) {
      const social = lead.raw_data.social as Record<string, string>;
      const socialStr = Object.keys(social).length ? ` [${Object.keys(social).join(", ")}]` : "";
      console.log(`  [DRY] ${lead.business_name} | ${lead.city ?? "?"} | ${lead.category_guess}${socialStr}`);
      inserted++;
      continue;
    }

    const { error } = await supabase!
      .from("scraper_queue")
      .upsert(lead, { onConflict: "business_name,source_url", ignoreDuplicates: true });

    if (error) {
      if (error.code === "23505") {
        skipped++;
      } else {
        console.warn(`  WARN: ${lead.business_name} — ${error.message}`);
        skipped++;
      }
    } else {
      inserted++;
    }
  }

  return { inserted, skipped };
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const directoryTargets = TARGETS.filter((t) => !t.name.startsWith("bing-"));
  const socialTargets = TARGETS.filter((t) => t.name.startsWith("bing-"));

  console.log(`\n========================================`);
  console.log(`NexusZim Scraper — ${new Date().toISOString()}`);
  console.log(`Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE"}`);
  console.log(`Directory targets: ${directoryTargets.length}`);
  console.log(`Social targets:    ${socialTargets.length}`);
  console.log(`========================================`);

  let totalInserted = 0;
  let totalSkipped = 0;

  for (let i = 0; i < TARGETS.length; i++) {
    const target = TARGETS[i];
    const leads = await scrapeTarget(target);

    if (leads.length > 0) {
      const { inserted, skipped } = await upsertLeads(leads);
      totalInserted += inserted;
      totalSkipped += skipped;
      console.log(`  → Saved ${inserted} new, skipped ${skipped} duplicates`);
    }

    if (i < TARGETS.length - 1) await sleep(DELAY_MS);
  }

  console.log(`\n========================================`);
  console.log(`Done — ${totalInserted} new leads, ${totalSkipped} duplicates skipped`);
  console.log(`========================================\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
