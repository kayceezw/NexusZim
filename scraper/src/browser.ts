/**
 * Playwright-based scraper for JS-heavy social platforms.
 * Handles Google Maps and Facebook — both require a real browser to render results.
 *
 * Google Maps: most reliable, rich business data, no login required.
 * Facebook:    best-effort; shows partial results before the login wall.
 */

import { chromium } from "playwright";
import type { Lead } from "./types.js";

export type BrowserTarget = {
  name: string;
  label: string;
  url: string;
  platform: "google-maps" | "facebook";
  source_name?: string;
};

const ZW_CITIES = [
  "Harare", "Bulawayo", "Mutare", "Gweru", "Kwekwe",
  "Kadoma", "Masvingo", "Chinhoyi", "Victoria Falls", "Bindura", "Chegutu",
];

function extractCity(text: string): string | null {
  for (const city of ZW_CITIES) {
    if (text.toLowerCase().includes(city.toLowerCase())) return city;
  }
  return null;
}

async function withPage<T>(fn: (page: Awaited<ReturnType<Awaited<ReturnType<typeof chromium.launch>>["newPage"]>>) => Promise<T>): Promise<T> {
  const proxyServer = process.env.HTTPS_PROXY;

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    ...(proxyServer ? { proxy: { server: proxyServer } } : {}),
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    locale: "en-GB",
    geolocation: { latitude: -17.8292, longitude: 31.0522 }, // Harare
    permissions: ["geolocation"],
  });

  try {
    const page = await context.newPage();
    return await fn(page);
  } finally {
    await context.close();
    await browser.close();
  }
}

// ─── Google Maps ─────────────────────────────────────────────────────────────

async function scrapeGoogleMaps(target: BrowserTarget): Promise<Lead[]> {
  return withPage(async (page) => {
    await page.goto(target.url, { waitUntil: "domcontentloaded", timeout: 30_000 });

    // Dismiss consent/cookie banner if present
    const consentBtn = page.locator('button:has-text("Accept all"), button:has-text("Agree")').first();
    await consentBtn.click({ timeout: 4_000 }).catch(() => {});

    try {
      await page.waitForSelector('div[role="feed"]', { timeout: 15_000 });
    } catch {
      console.warn(`  SKIP — Google Maps feed did not load: ${target.url}`);
      return [];
    }

    // Scroll inside the results panel to load more listings
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        const feed = document.querySelector('div[role="feed"]');
        if (feed) feed.scrollTop += 1200;
      });
      await page.waitForTimeout(1_200);
    }

    type RawRow = { name: string; details: string; };
    const rows = await page.evaluate((): RawRow[] => {
      const articles = document.querySelectorAll('div[role="article"]');
      return Array.from(articles).map((a) => {
        const name =
          a.getAttribute("aria-label") ||
          (a.querySelector(".qBF1Pd") as HTMLElement | null)?.innerText ||
          "";
        const detailEls = a.querySelectorAll(".W4Efsd");
        const details = Array.from(detailEls)
          .map((el) => (el as HTMLElement).innerText?.trim())
          .filter(Boolean)
          .join(" · ");
        return { name: name.trim(), details };
      });
    });

    console.log(`  Found ${rows.length} Google Maps listings`);

    return rows
      .filter((r) => r.name.length >= 3)
      .map((r) => ({
        business_name: r.name,
        category_guess: target.label,
        city: extractCity(r.details),
        phone: null,   // not shown in Maps list view
        website: null, // not shown in Maps list view
        email: null,
        description: r.details || null,
        source_url: target.url,
        source_name: target.name,
        raw_data: { label: target.label, maps_details: r.details },
      }));
  });
}

// ─── Facebook ────────────────────────────────────────────────────────────────

async function scrapeFacebook(target: BrowserTarget): Promise<Lead[]> {
  return withPage(async (page) => {
    await page.goto(target.url, { waitUntil: "domcontentloaded", timeout: 30_000 });

    // Detect login wall
    const loginWall = await page
      .waitForSelector('[data-testid="royal_login_button"], #login_form, form[action*="login"]', {
        timeout: 5_000,
      })
      .then(() => true)
      .catch(() => false);

    if (loginWall) {
      console.warn(`  SKIP — Facebook requires login: ${target.url}`);
      return [];
    }

    await page.waitForTimeout(3_000);

    type FbRow = { name: string; pageUrl: string; };
    const rows = await page.evaluate((): FbRow[] => {
      const seen = new Set<string>();
      const results: FbRow[] = [];

      // Page search results appear as aria-labelled list items
      document.querySelectorAll('[role="listitem"] a[href*="facebook.com/"]').forEach((el) => {
        const a = el as HTMLAnchorElement;
        const name = (a.getAttribute("aria-label") || a.textContent || "").trim().split("\n")[0];
        const href = a.href.split("?")[0];

        if (name.length < 3 || seen.has(href)) return;
        if (href.includes("/search") || href.endsWith("facebook.com/")) return;
        seen.add(href);
        results.push({ name, pageUrl: href });
      });

      return results.slice(0, 25);
    });

    console.log(`  Found ${rows.length} Facebook page results`);

    return rows.map((r) => ({
      business_name: r.name,
      category_guess: target.label,
      city: null,
      phone: null,
      website: r.pageUrl,
      email: null,
      description: null,
      source_url: target.url,
      source_name: target.name,
      raw_data: { label: target.label, facebook_page: r.pageUrl },
    }));
  });
}

// ─── Dispatcher ──────────────────────────────────────────────────────────────

export async function scrapeBrowserTarget(target: BrowserTarget): Promise<Lead[]> {
  console.log(`\n[${target.source_name ?? target.name}] Fetching (browser): ${target.url}`);

  try {
    switch (target.platform) {
      case "google-maps": return await scrapeGoogleMaps(target);
      case "facebook":    return await scrapeFacebook(target);
    }
  } catch (err) {
    console.warn(`  SKIP — browser error: ${(err as Error).message.split("\n")[0]}`);
  }

  return [];
}
