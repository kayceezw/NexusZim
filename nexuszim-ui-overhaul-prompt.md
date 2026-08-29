# NexusZim UI/UX Overhaul: Implementation Prompt

You are overhauling the NexusZim frontend (TanStack Start + React + Tailwind v4, repo: kayceezw/NexusZim). The current UI reads as AI-generated. Replace it with the "Registry" design system described below. A reference implementation exists in `nexuszim-redesign.html`; match its look, spacing, and voice exactly. Work screen by screen. Do not touch backend logic, Supabase queries, or routing structure unless a screen change requires it.

## Design thesis
NexusZim's product is verification. The UI treats every provider as **a matter of record**: registry numbers, dated verification ledgers, tier hallmarks. Trust is shown, never claimed.

## Hard rules (never violate)
1. NexusZim is a connection-and-verification platform. **No payment custody.** Copy must never imply NexusZim holds, escrows, or processes client money. Standard line: "You pay the provider directly. NexusZim never holds your money."
2. The official two-tone interlocking diamond mark: **geometry is never altered.** Only tagline text may change. Diamond *motifs* (rotated squares in hallmarks, bullets, tier marks) are fine as derived elements.
3. Tier names are exactly: **Listed / Verified / Trust Certified.** Never invent tiers or rename them.
4. Tagline: "Excellence, Delivered."
5. **No em dashes anywhere in visible copy.** Use commas, colons, semicolons, or split into two sentences. Normal hyphens in compound words are fine.

## Tokens (Tailwind v4 @theme)
```css
@theme {
  --color-forest: #0F3323;       /* primary */
  --color-forest-ink: #081F14;   /* deepest surface */
  --color-forest-soft: #1A4630;  /* raised dark surface, image placeholders */
  --color-gold: #E7A020;         /* accent, spend sparingly */
  --color-gold-deep: #B87F1A;    /* hover/pressed */
  --color-cream: #F6F5F0;        /* page ground */
  --color-cream-raised: #FDFCF9; /* cards */
  --color-hairline: #DEDACB;
  --color-text: #14251C;
  --color-text-soft: #5C6B60;
  --font-display: "Instrument Serif", Georgia, serif;
  --font-ui: "Archivo", system-ui, sans-serif;
  --font-data: "Spline Sans Mono", ui-monospace, monospace;
  --radius-sm: 3px;  /* registry aesthetic: near-square corners */
  --radius-md: 6px;
}
```
Fonts via Google Fonts: Instrument Serif (400, 400 italic), Archivo (400 to 700), Spline Sans Mono (400, 500). Remove Inter and any gradient utilities.

## Typography roles
- **Display (Instrument Serif):** h1 to h3, provider names, tier names, pull quotes. Line-height about 1.05, slight negative tracking on large sizes. Italic plus gold-deep for one emphasized phrase per hero, maximum.
- **UI (Archivo):** body, buttons, nav, forms. 15 to 16px body.
- **Data (Spline Sans Mono):** registry numbers, dates, eyebrows, counts, ledger values, footer legal. 11 to 13px, letter-spacing .06em to .14em, uppercase for eyebrows.

## Photography system
Build one `ImageSlot` component. Every image in the product goes through it: `object-fit: cover`, fixed aspect ratio per context, `--radius-md`, `--color-forest-soft` placeholder state with a small rotated-square outline while loading or when no image exists. Photography direction: real premises, real streets, real people at work in Zimbabwe. Documentary, natural light, no stock-photo handshakes, no AI-generated imagery.

Slots by screen:
- **Home:** "On the ground" editorial band after the tiers section, one wide 16:10 image (verification desk visiting premises) plus one 4:3 image (Harare or Bulawayo street) with a gold-rule caption.
- **Directory:** 64px square provider logo slot at the left of every result row.
- **Provider profile:** 21:6 banner under the page header (provider supplied), plus a "Premises" gallery of three 4:3 photos captioned as taken by the NexusZim verification desk during inspection, with the date. This gallery is only shown for Trust Certified providers; it is proof, not decoration.
- **Provider dashboard:** logo and premises photo upload states reuse the same component.

## Component rules
- **Hallmark (tier badge):** bordered chip, mono uppercase text, leading 45-degree rotated square. Trust Certified is gold border and fill; Verified is forest; Listed is outline-only diamond, muted. One hallmark component with a tier prop; never ad-hoc badges.
- **Verification ledger:** key/value rows separated by hairlines. Keys in UI font (text-soft), values in data font with a check prefix and a real date. Appears on: home specimen card, directory result rows (condensed "On file:" line), provider profile (full sticky panel on forest-ink).
- **Registry number:** every provider surface shows `NX-YYYY-NNNNN` in data font.
- **Buttons:** 3px radius. Primary is gold background with forest-ink text, hover gold-deep. Ghost is a 1px forest border, hover fills forest. The arrow shifts 3px on hover. No pill buttons, no gradients, no shadows on buttons.
- **Cards/rows:** cream-raised background, 1px hairline border, 6px radius. Hover: border becomes forest, 1px lift, a 3px gold left rule appears. One subtle shadow maximum, on the hero specimen card only.
- **Section rhythm:** 84 to 92px vertical padding, sections separated by hairline borders or full forest/forest-ink color blocks. An eyebrow (diamond dot plus mono uppercase) opens every section.

## Screen-by-screen
1. **Home:** asymmetric hero (editorial headline left, specimen registry card right; no centered hero). Proof strip with four real stats separated by hairlines. Tiers section on forest-ink as a numbered ledger (TIER 01/02/03; this sequence is real, so numbering is earned). "On the ground" photo band. Category index as a bordered grid (hairline cells, hover cream-raised). Three-step how-it-works. Provider CTA on forest. Footer on forest-ink with "A ZimDataPulse company."
2. **Directory/search:** forest header with search bar (gold submit button). Left filter rail: tier, city, specialty checkboxes with mono counts. Results as registry rows (not uniform photo cards): logo slot, name plus hallmark, meta line, condensed "On file:" ledger line, registry number top right, "Open record" link.
3. **Provider profile:** breadcrumb, large display name, hallmark plus registry number, "Request an introduction" CTA with a response-time note, wide banner image. Two columns: about, premises gallery, services, and reviews on the left; a sticky Verification Record panel (forest-ink) on the right listing every dated check plus the next review date. Reviews as gold-left-border pull quotes attributed "reference confirmed by NexusZim." Payment disclaimer note below the panel (hard rule 1).
4. **Onboarding/dashboard (provider side):** frame progress as advancing through the registry: "Complete document verification to reach Tier 02." Reuse the ledger, hallmark, and image slot components.

## Copy voice
Institutional, plain, specific. Zimbabwean vernacular where real: CR14/CR6, ITF 263, Harare CBD, Bulawayo. Say what was checked and when. Ban: "Discover," "Unlock," "Empower," "seamless," "trusted by thousands," emoji, exclamation marks, em dashes.

## Anti-AI-tells checklist (verify before finishing each screen)
- [ ] No centered hero with two pill buttons
- [ ] No uniform 3-card grid with icon circles
- [ ] No Inter, no gradients, no rounded-2xl, no shadow-lg everywhere
- [ ] No em dashes in any visible text
- [ ] Every number and stat is real or clearly flagged as placeholder for KC
- [ ] Gold appears in at most 3 places per viewport
- [ ] Focus-visible states present; prefers-reduced-motion respected
- [ ] Responsive to 360px

## Process
1. Run `backup.sh` and commit a checkpoint before starting.
2. Install fonts and tokens first; build Hallmark, Ledger, Button, RegistryRow, and ImageSlot as shared components.
3. Overhaul screens in the order above; screenshot and self-critique each against the reference HTML before moving on.
4. Do not modify the `complete_provider_onboarding` flow logic; apply migrations in order if any schema touch is needed (it should not be).
