/**
 * NexusZim daily web scraper
 * Targets Zimbabwe business directories → writes leads to scraper_queue table
 *
 * Usage:
 *   bun run scrape            # live run, writes to Supabase
 *   DRY_RUN=true bun run scrape   # dry run, logs only
 */

import { load } from "cheerio";
import { gotScraping } from "got-scraping";
import { createClient } from "@supabase/supabase-js";
import { TARGETS, guessCategory, type ScrapeTarget } from "./targets.js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const DRY_RUN = process.env.DRY_RUN === "true";
const DELAY_MS = 2500; // polite delay between requests

if (!DRY_RUN && (!SUPABASE_URL || !SUPABASE_KEY)) {
  console.error("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = !DRY_RUN
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

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
  raw_data: Record<string, string>;
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

function extractWebsite($item: ReturnType<ReturnType<typeof load>>, selectors: string[], sourceDomain: string): string | null {
  for (const sel of selectors) {
    const els = $item.find(sel);
    for (let i = 0; i < els.length; i++) {
      const href = els.eq(i).attr("href") ?? "";
      if (href.startsWith("http") && !href.includes(sourceDomain)) {
        return href.trim();
      }
    }
  }
  return null;
}

function extractCity(address: string | null): string | null {
  if (!address) return null;
  const ZW_CITIES = ["Harare", "Bulawayo", "Mutare", "Gweru", "Kwekwe", "Kadoma", "Masvingo", "Chinhoyi", "Victoria Falls", "Bindura", "Chegutu"];
  for (const city of ZW_CITIES) {
    if (address.toLowerCase().includes(city.toLowerCase())) return city;
  }
  return address.split(",")[0]?.trim() || null;
}

async function scrapeTarget(target: ScrapeTarget): Promise<Lead[]> {
  const leads: Lead[] = [];
  console.log(`\n[${target.source_name ?? target.name}] Fetching: ${target.url}`);

  let html: string;
  try {
    const res = await gotScraping({
      url: target.url,
      headers: {
        "Accept-Language": "en-GB,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml",
      },
      timeout: { request: 15_000 },
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
    if (!rawName || rawName.length < 3) return; // skip blanks

    const rawAddress = pickFirst($el, target.selectors.address);
    const rawPhone = pickFirst($el, target.selectors.phone);
    const rawEmail = pickFirst($el, target.selectors.email);
    const rawDesc = pickFirst($el, target.selectors.description);
    const website = extractWebsite($el, target.selectors.website, target.name);
    const city = extractCity(rawAddress);
    const category = guessCategory(target.label, rawDesc ?? "");

    leads.push({
      business_name: rawName,
      category_guess: category,
      city,
      phone: rawPhone,
      website,
      email: rawEmail,
      description: rawDesc,
      source_url: target.url,
      source_name: target.name,
      raw_data: {
        label: target.label,
        address: rawAddress ?? "",
      },
    });
  });

  console.log(`  Extracted ${leads.length} leads`);
  return leads;
}

async function upsertLeads(leads: Lead[]): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;

  for (const lead of leads) {
    if (DRY_RUN) {
      console.log(`  [DRY] ${lead.business_name} | ${lead.city ?? "?"} | ${lead.category_guess}`);
      inserted++;
      continue;
    }

    const { error } = await supabase!
      .from("scraper_queue")
      .upsert(lead, { onConflict: "business_name,source_url", ignoreDuplicates: true });

    if (error) {
      if (error.code === "23505") {
        skipped++; // duplicate
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
  console.log(`\n========================================`);
  console.log(`NexusZim Scraper — ${new Date().toISOString()}`);
  console.log(`Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE"}`);
  console.log(`Targets: ${TARGETS.length}`);
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

    if (i < TARGETS.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n========================================`);
  console.log(`Done — ${totalInserted} new leads, ${totalSkipped} duplicates skipped`);
  console.log(`========================================\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
