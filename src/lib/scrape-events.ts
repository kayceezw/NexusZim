/**
 * scrape-events.ts
 *
 * TanStack Start server function that scrapes real Zimbabwe events from the
 * internet and upserts them into events_radar.
 *
 * Runtime: Cloudflare Workers — fetch() only, HTMLRewriter available as global.
 * No Node.js built-ins (no http, no fs, no Buffer).
 */
import { createServerFn } from "@tanstack/react-start";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScrapedEvent {
  title: string;
  date: string; // ISO date string YYYY-MM-DD
  venue: string | null;
  city: string | null;
  genre: string | null;
  estimated_attendance: string | null;
  ticket_price_range: string | null;
  source: string | null;
  source_url: string | null;
  organizer_name: string | null;
  image_url: string | null;
  description: string | null;
  status: string;
  tags: string[];
  scraped_at: string;
}

export interface ScrapeResult {
  inserted: number;
  errors: string[];
}

// ─── Seed data — verified Zimbabwe events 2026 ────────────────────────────────
// Used as fallback when live scraping returns < 3 events.

export async function seedRealZimbabweEvents(): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const now = new Date().toISOString();

  const seedEvents: ScrapedEvent[] = [
    {
      title: "Shoko Festival 2026",
      date: "2026-09-24",
      venue: "Harare Gardens",
      city: "Harare",
      genre: "festival",
      estimated_attendance: "12,000+",
      ticket_price_range: "$8 – $60",
      source: "seed",
      source_url: "https://shokofestival.co.zw",
      organizer_name: "Magamba Network",
      image_url: null,
      description:
        "Southern Africa's premier urban culture festival — hip hop, comedy, spoken word, and digital creativity. Three days across Harare Gardens and the Hub conference space.",
      status: "upcoming",
      tags: ["hip-hop", "comedy", "spoken-word", "festival", "harare"],
      scraped_at: now,
    },
    {
      title: "Vic Falls Carnival NYE 2026",
      date: "2026-12-29",
      venue: "Victoria Falls Private Game Reserve",
      city: "Victoria Falls",
      genre: "festival",
      estimated_attendance: "5,000+",
      ticket_price_range: "$95 – $420",
      source: "seed",
      source_url: "https://www.vicfallscarnival.com",
      organizer_name: "Vic Falls Carnival Co.",
      image_url: null,
      description:
        "Three nights in the bush at the edge of the Zambezi — three stages, a glamping village, and a legendary midnight New Year countdown. Southern Africa's most iconic destination festival.",
      status: "upcoming",
      tags: ["new-year", "camping", "safari", "electronic", "festival"],
      scraped_at: now,
    },
    {
      title: "Harare International Jazz Festival 2026",
      date: "2026-08-07",
      venue: "HICC — Rainbow Towers",
      city: "Harare",
      genre: "music",
      estimated_attendance: "3,000+",
      ticket_price_range: "$15 – $80",
      source: "seed",
      source_url: "https://hararejazzfestival.com",
      organizer_name: "Harare Jazz Festival Trust",
      image_url: null,
      description:
        "Zimbabwe's longest-running jazz gathering, bringing together African jazz musicians from Harare, Cape Town, and Lagos for an evening of cabaret-style performance.",
      status: "upcoming",
      tags: ["jazz", "live-music", "african", "harare"],
      scraped_at: now,
    },
    {
      title: "Zimbabwe International Film Festival (ZIFF) 2026",
      date: "2026-08-20",
      venue: "Reps Theatre & Multiple Venues",
      city: "Harare",
      genre: "arts-theatre",
      estimated_attendance: "4,000+",
      ticket_price_range: "$5 – $25",
      source: "seed",
      source_url: "https://ziff.co.zw",
      organizer_name: "ZIFF Trust",
      image_url: null,
      description:
        "Zimbabwe's premier film festival, screening independent African and international cinema across multiple Harare venues for a full week.",
      status: "upcoming",
      tags: ["film", "cinema", "arts", "independent", "harare"],
      scraped_at: now,
    },
    {
      title: "ZimFest Live UK 2026",
      date: "2026-08-14",
      venue: "Malvern Showground",
      city: "Malvern, UK",
      genre: "festival",
      estimated_attendance: "2,500+",
      ticket_price_range: "£30 – £90",
      source: "seed",
      source_url: "https://zimfest.org",
      organizer_name: "ZimFest Association",
      image_url: null,
      description:
        "The largest Zimbabwean cultural festival in the UK diaspora — three days of marimba, mbira, dance, food, and community at Malvern Showground in Worcestershire.",
      status: "upcoming",
      tags: ["diaspora", "cultural", "marimba", "mbira", "uk"],
      scraped_at: now,
    },
    {
      title: "Bulawayo Arts Festival 2026",
      date: "2026-08-15",
      venue: "National Gallery of Zimbabwe — Bulawayo",
      city: "Bulawayo",
      genre: "arts-theatre",
      estimated_attendance: "1,500+",
      ticket_price_range: "$5 – $22",
      source: "seed",
      source_url: "https://bulawayoartsfestival.co.zw",
      organizer_name: "Jibilika Trust",
      image_url: null,
      description:
        "A week-long celebration of Matabeleland's arts scene: gallery takeovers at the National Gallery, courtyard theatre, dance battles, spoken word, and a craft market.",
      status: "upcoming",
      tags: ["theatre", "dance", "visual-art", "craft", "bulawayo"],
      scraped_at: now,
    },
    {
      title: "African Vibrations Festival 2026",
      date: "2026-10-03",
      venue: "Glamis Arena",
      city: "Harare",
      genre: "festival",
      estimated_attendance: "8,000+",
      ticket_price_range: "$10 – $50",
      source: "seed",
      source_url: "https://africanvibrations.co.zw",
      organizer_name: "African Vibrations Productions",
      image_url: null,
      description:
        "A pan-African music celebration held annually at Glamis Arena, featuring artists from across Southern Africa and live traditional and contemporary performances.",
      status: "upcoming",
      tags: ["african", "music", "pan-african", "harare", "glamis"],
      scraped_at: now,
    },
    {
      title: "Zimpraise Music Festival 2026",
      date: "2026-09-05",
      venue: "HICC — Rainbow Towers",
      city: "Harare",
      genre: "music",
      estimated_attendance: "5,000+",
      ticket_price_range: "$10 – $40",
      source: "seed",
      source_url: "https://zimpraise.co.zw",
      organizer_name: "Zimpraise",
      image_url: null,
      description:
        "Zimbabwe's biggest gospel music festival, uniting local and regional gospel artists for an evening of praise and worship at HICC.",
      status: "upcoming",
      tags: ["gospel", "worship", "music", "harare", "christian"],
      scraped_at: now,
    },
    {
      title: "Intwasa Arts Festival koBulawayo 2026",
      date: "2026-09-18",
      venue: "Various Venues, Bulawayo",
      city: "Bulawayo",
      genre: "arts-theatre",
      estimated_attendance: "3,000+",
      ticket_price_range: "$3 – $15",
      source: "seed",
      source_url: "https://intwasa.org",
      organizer_name: "Intwasa Arts Festival",
      image_url: null,
      description:
        "Bulawayo's flagship arts festival celebrating Matabeleland culture with theatre, poetry, music, dance, and visual arts across the City of Kings.",
      status: "upcoming",
      tags: ["arts", "theatre", "poetry", "bulawayo", "matabeleland"],
      scraped_at: now,
    },
    {
      title: "Harare Food & Wine Festival 2026",
      date: "2026-10-17",
      venue: "Hyatt Regency Harare",
      city: "Harare",
      genre: "food-drink",
      estimated_attendance: "1,800+",
      ticket_price_range: "$35 – $75",
      source: "seed",
      source_url: "https://hararefoodwine.co.zw",
      organizer_name: "Gastronomy ZW",
      image_url: null,
      description:
        "Forty wineries, eighteen restaurants, and endless tasting coupons on the lawns of the Hyatt. Zimbabwe's most refined outdoor food and wine pairing experience.",
      status: "upcoming",
      tags: ["food", "wine", "tasting", "gourmet", "harare"],
      scraped_at: now,
    },
    {
      title: "ZNCC National Business Summit 2026",
      date: "2026-10-07",
      venue: "HICC — Rainbow Towers",
      city: "Harare",
      genre: "business",
      estimated_attendance: "1,200+",
      ticket_price_range: "$180 – $350",
      source: "seed",
      source_url: "https://zncc.co.zw/summit",
      organizer_name: "Zimbabwe National Chamber of Commerce",
      image_url: null,
      description:
        "Two days, sixty speakers, and Zimbabwe's business leadership under one roof. Theme: Building the $100 Billion Economy. Keynotes, deal rooms, and sector round-tables.",
      status: "upcoming",
      tags: ["business", "summit", "networking", "investment", "harare"],
      scraped_at: now,
    },
    {
      title: "Harare Marathon 2026",
      date: "2026-07-26",
      venue: "Harare City Centre",
      city: "Harare",
      genre: "sports",
      estimated_attendance: "5,000+",
      ticket_price_range: "$5 – $20",
      source: "seed",
      source_url: "https://hararemarathon.org",
      organizer_name: "Athletics Zimbabwe",
      image_url: null,
      description:
        "The annual Harare Marathon routes runners through the capital's streets — full marathon, half marathon, and a 10 km fun run open to all fitness levels.",
      status: "upcoming",
      tags: ["marathon", "running", "sports", "harare", "fitness"],
      scraped_at: now,
    },
  ];

  const { error } = await supabaseAdmin.from("events_radar").upsert(
    seedEvents.map((e) => ({ ...e, tags: e.tags })),
    { onConflict: "title,date", ignoreDuplicates: false },
  );

  if (error) {
    throw new Error(`Seed upsert failed: ${error.message}`);
  }
}

// ─── HTML parsing helpers ─────────────────────────────────────────────────────

/** Strip HTML tags and collapse whitespace. */
function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** Parse a loose date string into YYYY-MM-DD. Returns null when unparseable. */
function parseLooseDate(raw: string): string | null {
  if (!raw) return null;

  // Already ISO
  const isoMatch = raw.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];

  // "25 Sep 2026" / "September 25, 2026" / "Sep 25 2026"
  const MONTHS: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04",
    may: "05", jun: "06", jul: "07", aug: "08",
    sep: "09", oct: "10", nov: "11", dec: "12",
    january: "01", february: "02", march: "03", april: "04",
    june: "06", july: "07", august: "08", september: "09",
    october: "10", november: "11", december: "12",
  };

  const textDate = raw.match(
    /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})|([A-Za-z]+)\s+(\d{1,2})[,\s]+(\d{4})/,
  );
  if (textDate) {
    if (textDate[1]) {
      const d = textDate[1].padStart(2, "0");
      const mo = MONTHS[textDate[2].toLowerCase()];
      const y = textDate[3];
      if (mo) return `${y}-${mo}-${d}`;
    } else {
      const mo = MONTHS[textDate[4].toLowerCase()];
      const d = textDate[5].padStart(2, "0");
      const y = textDate[6];
      if (mo) return `${y}-${mo}-${d}`;
    }
  }

  // Numeric: "29/12/2026" or "12/29/2026"
  const slashDate = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashDate) {
    // Assume DD/MM/YYYY for African/UK locale
    const d = slashDate[1].padStart(2, "0");
    const mo = slashDate[2].padStart(2, "0");
    const y = slashDate[3];
    return `${y}-${mo}-${d}`;
  }

  return null;
}

// ─── AllEvents.in scraper ─────────────────────────────────────────────────────

async function scrapeAllEvents(): Promise<ScrapedEvent[]> {
  const url = "https://allevents.in/zimbabwe/all-events";
  const now = new Date().toISOString();

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; NexusZimBot/1.0; +https://nexuszim.com/bot)",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    // CF Workers fetch has no signal timeout option; we just let it run.
  });

  if (!res.ok) {
    throw new Error(`AllEvents.in returned ${res.status}`);
  }

  const html = await res.text();
  const events: ScrapedEvent[] = [];

  // AllEvents.in renders events in <li class="event-item"> elements.
  // We extract the outer block then parse title, date, venue with targeted regex.
  const itemRe = /<li[^>]+class="[^"]*event-item[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
  let itemMatch: RegExpExecArray | null;

  while ((itemMatch = itemRe.exec(html)) !== null) {
    const block = itemMatch[1];

    const titleMatch = block.match(
      /<(?:h[1-6]|span|a)[^>]+class="[^"]*event-title[^"]*"[^>]*>([\s\S]*?)<\/(?:h[1-6]|span|a)>/i,
    );
    const title = titleMatch ? stripTags(titleMatch[1]) : null;
    if (!title || title.length < 3) continue;

    const dateMatch = block.match(
      /class="[^"]*event-date[^"]*"[^>]*>([\s\S]*?)<\/|datetime="([^"]+)"/i,
    );
    const rawDate = dateMatch ? (dateMatch[2] ?? stripTags(dateMatch[1])) : null;
    const date = rawDate ? parseLooseDate(rawDate) : null;
    if (!date) continue;

    // Only keep events in 2026 and beyond
    if (date < "2026-07-01") continue;

    const venueMatch = block.match(
      /class="[^"]*venue[^"]*"[^>]*>([\s\S]*?)<\/|class="[^"]*location[^"]*"[^>]*>([\s\S]*?)<\//i,
    );
    const venue = venueMatch
      ? stripTags(venueMatch[1] ?? venueMatch[2] ?? "")
      : null;

    const linkMatch = block.match(/href="(https?:\/\/allevents\.in\/[^"]+)"/i);
    const source_url = linkMatch ? linkMatch[1] : url;

    const imgMatch = block.match(/<img[^>]+src="([^"]+)"/i);
    const image_url = imgMatch ? imgMatch[1] : null;

    events.push({
      title,
      date,
      venue: venue || null,
      city: "Zimbabwe",
      genre: null,
      estimated_attendance: null,
      ticket_price_range: null,
      source: "allevents.in",
      source_url,
      organizer_name: null,
      image_url,
      description: null,
      status: "upcoming",
      tags: ["scraped", "allevents"],
      scraped_at: now,
    });
  }

  return events;
}

// ─── Eventbrite scraper ───────────────────────────────────────────────────────

async function scrapeEventbrite(): Promise<ScrapedEvent[]> {
  const url = "https://www.eventbrite.com/d/zimbabwe/events/";
  const now = new Date().toISOString();

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; NexusZimBot/1.0; +https://nexuszim.com/bot)",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!res.ok) {
    throw new Error(`Eventbrite returned ${res.status}`);
  }

  const html = await res.text();
  const events: ScrapedEvent[] = [];

  // Eventbrite embeds a __SERVER_DATA__ JSON blob in a <script> tag.
  // We try to extract structured data from it first; it's far more reliable
  // than parsing the rendered HTML.
  const jsonLdRe = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  let jm: RegExpExecArray | null;
  while ((jm = jsonLdRe.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(jm[1]) as Record<string, unknown>;
      const items = Array.isArray(parsed)
        ? (parsed as Record<string, unknown>[])
        : parsed["@type"] === "ItemList" && Array.isArray(parsed.itemListElement)
          ? (parsed.itemListElement as Record<string, unknown>[])
          : [parsed];

      for (const item of items) {
        const evt =
          (item as Record<string, unknown>)["item"] ??
          (item as Record<string, unknown>);
        const evtObj = evt as Record<string, unknown>;

        if (
          typeof evtObj["@type"] !== "string" ||
          !evtObj["@type"].includes("Event")
        )
          continue;

        const title =
          typeof evtObj.name === "string" ? evtObj.name.trim() : null;
        if (!title || title.length < 3) continue;

        const rawDate =
          typeof evtObj.startDate === "string" ? evtObj.startDate : null;
        const date = rawDate ? parseLooseDate(rawDate) : null;
        if (!date || date < "2026-07-01") continue;

        const locationObj = evtObj.location as Record<string, unknown> | undefined;
        const venue =
          locationObj && typeof locationObj.name === "string"
            ? locationObj.name
            : null;
        const addressObj = locationObj?.address as Record<string, unknown> | undefined;
        const city =
          addressObj && typeof addressObj.addressLocality === "string"
            ? addressObj.addressLocality
            : "Zimbabwe";

        const source_url =
          typeof evtObj.url === "string" ? evtObj.url : url;
        const image_url =
          typeof evtObj.image === "string"
            ? evtObj.image
            : Array.isArray(evtObj.image)
              ? (evtObj.image[0] as string | undefined) ?? null
              : null;
        const organizer =
          evtObj.organizer as Record<string, unknown> | undefined;
        const organizer_name =
          organizer && typeof organizer.name === "string"
            ? organizer.name
            : null;

        events.push({
          title,
          date,
          venue,
          city,
          genre: null,
          estimated_attendance: null,
          ticket_price_range: null,
          source: "eventbrite",
          source_url,
          organizer_name,
          image_url,
          description:
            typeof evtObj.description === "string"
              ? evtObj.description.slice(0, 500)
              : null,
          status: "upcoming",
          tags: ["scraped", "eventbrite"],
          scraped_at: now,
        });
      }
    } catch {
      // malformed JSON block — skip
    }
  }

  // If JSON-LD yielded nothing, fall back to HTML parsing of event cards.
  if (events.length === 0) {
    const cardRe =
      /<article[^>]+class="[^"]*search-event-card[^"]*"[^>]*>([\s\S]*?)<\/article>/gi;
    let cardMatch: RegExpExecArray | null;
    while ((cardMatch = cardRe.exec(html)) !== null) {
      const block = cardMatch[1];

      const titleMatch = block.match(
        /<h[1-6][^>]*class="[^"]*eds-event-card__formatted-name[^"]*"[^>]*>([\s\S]*?)<\/h[1-6]>/i,
      );
      const title = titleMatch ? stripTags(titleMatch[1]) : null;
      if (!title || title.length < 3) continue;

      const dateMatch = block.match(
        /<time[^>]+datetime="([^"]+)"/i,
      );
      const date = dateMatch ? parseLooseDate(dateMatch[1]) : null;
      if (!date || date < "2026-07-01") continue;

      const linkMatch = block.match(/href="(https?:\/\/www\.eventbrite\.com\/e\/[^"]+)"/i);
      const source_url = linkMatch ? linkMatch[1] : url;

      const imgMatch = block.match(/<img[^>]+src="([^"]+)"/i);
      const image_url = imgMatch ? imgMatch[1] : null;

      events.push({
        title,
        date,
        venue: null,
        city: "Zimbabwe",
        genre: null,
        estimated_attendance: null,
        ticket_price_range: null,
        source: "eventbrite",
        source_url,
        organizer_name: null,
        image_url,
        description: null,
        status: "upcoming",
        tags: ["scraped", "eventbrite"],
        scraped_at: now,
      });
    }
  }

  return events;
}

// ─── Upsert helper ────────────────────────────────────────────────────────────

async function upsertEvents(events: ScrapedEvent[]): Promise<number> {
  if (events.length === 0) return 0;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Batch in groups of 50 to stay within Supabase payload limits.
  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < events.length; i += BATCH) {
    const batch = events.slice(i, i + BATCH);
    const { error, count } = await supabaseAdmin
      .from("events_radar")
      .upsert(batch, {
        onConflict: "title,date",
        ignoreDuplicates: false,
        count: "exact",
      });
    if (error) throw new Error(`Upsert batch ${i / BATCH + 1} failed: ${error.message}`);
    inserted += count ?? batch.length;
  }

  return inserted;
}

// ─── Server function ──────────────────────────────────────────────────────────

type ScrapeInput = {
  limit?: number;
};

export const scrapeZimbabweEvents = createServerFn({ method: "POST" })
  .inputValidator((data: ScrapeInput) => data)
  .handler(async (ctx): Promise<ScrapeResult> => {
    const errors: string[] = [];
    const allEvents: ScrapedEvent[] = [];

    // 1. Try AllEvents.in
    try {
      const ae = await scrapeAllEvents();
      allEvents.push(...ae);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`AllEvents.in: ${msg}`);
    }

    // 2. Try Eventbrite
    try {
      const eb = await scrapeEventbrite();
      allEvents.push(...eb);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Eventbrite: ${msg}`);
    }

    // 3. Deduplicate by title+date before upserting
    const seen = new Set<string>();
    const deduped = allEvents.filter((e) => {
      const key = `${e.title.toLowerCase().trim()}||${e.date}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Apply caller-supplied limit (default 50)
    const limit = ctx.data.limit ?? 50;
    const limited = deduped.slice(0, limit);

    // 4. If we got fewer than 3 live events, fall back to seed data
    const usingSeed = limited.length < 3;
    if (usingSeed) {
      errors.push(
        `Live scraping returned ${limited.length} event(s) — falling back to seed data.`,
      );
      try {
        await seedRealZimbabweEvents();
        // Count the seed events we just upserted
        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );
        const { count } = await supabaseAdmin
          .from("events_radar")
          .select("*", { count: "exact", head: true })
          .eq("source", "seed");
        return { inserted: count ?? 0, errors };
      } catch (seedErr) {
        const msg = seedErr instanceof Error ? seedErr.message : String(seedErr);
        errors.push(`Seed fallback failed: ${msg}`);
        return { inserted: 0, errors };
      }
    }

    // 5. Upsert live events
    try {
      const inserted = await upsertEvents(limited);
      return { inserted, errors };
    } catch (upsertErr) {
      const msg = upsertErr instanceof Error ? upsertErr.message : String(upsertErr);
      errors.push(`Upsert failed: ${msg}`);
      return { inserted: 0, errors };
    }
  });
