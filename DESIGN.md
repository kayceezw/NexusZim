---
name: NexusZim Design System
colors:
  surface: '#FFFFFF'
  surface-dim: '#dbdad5'
  surface-bright: '#fbf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ee'
  surface-container: '#f0eee9'
  surface-container-high: '#eae8e3'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c19'
  on-surface-variant: '#414943'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#717972'
  outline-variant: '#c1c9c1'
  surface-tint: '#3b674f'
  primary: '#00301c'
  on-primary: '#ffffff'
  primary-container: '#1a4731'
  on-primary-container: '#86b598'
  inverse-primary: '#a1d1b4'
  secondary: '#815500'
  on-secondary: '#ffffff'
  secondary-container: '#feb234'
  on-secondary-container: '#6d4700'
  tertiary: '#002070'
  on-tertiary: '#ffffff'
  tertiary-container: '#0032a3'
  on-tertiary-container: '#8fa6ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bdeecf'
  primary-fixed-dim: '#a1d1b4'
  on-primary-fixed: '#002112'
  on-primary-fixed-variant: '#234f38'
  secondary-fixed: '#ffddb2'
  secondary-fixed-dim: '#ffb94c'
  on-secondary-fixed: '#291800'
  on-secondary-fixed-variant: '#624000'
  tertiary-fixed: '#dce1ff'
  tertiary-fixed-dim: '#b7c4ff'
  on-tertiary-fixed: '#001551'
  on-tertiary-fixed-variant: '#0039b5'
  background: '#fbf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e4e2dd'
  text-primary: '#1C1C1C'
  text-secondary: '#6B7280'
  border-light: '#E5E7EB'
  badge-listed-bg: '#F3F4F6'
  badge-verified-bg: '#DBEAFE'
  badge-certified-bg: '#FEF3C7'
  badge-certified-text: '#92400E'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is built on the pillars of **Trust, Groundedness, and Accessibility**. It serves as a modern digital directory for the Zimbabwean service economy, transitioning word-of-mouth reliability into a verified digital ecosystem. The aesthetic avoids the "sterile corporate" feel in favor of a "well-run government registry"—authoritative yet approachable.

The design style is **Corporate / Modern** with a focus on high-clarity information architecture. It prioritizes legibility and immediate recognition of trust signals over decorative elements. 

**Key Principles:**
- **Clarity Over Flair:** No gradients, decorative illustrations, or "bubble" UI. Every element serves a functional purpose.
- **Verification First:** The verification tier is the most important visual asset. It must be prominent in every view.
- **Mobile-First Utility:** Designed for efficiency on mobile devices, acknowledging the importance of quick contact via WhatsApp and phone.
- **Tactile Trust:** Uses clean borders and subtle shadows to create a sense of organized, tangible records.

## Colors

The palette is rooted in a **Deep Forest Green**, evoking stability and growth, paired with a **Warm Amber** for critical calls to action and high-tier trust signals.

- **Primary (Deep Forest Green):** Used for navigation, primary buttons, and section headers to establish authority.
- **Secondary (Warm Amber):** Reserved for high-conversion CTAs (like "Contact on WhatsApp") and the "Trust Certified" badge.
- **Tertiary (Blue):** Specifically used for the "Verified" tier to align with standard digital verification patterns.
- **Neutral (Warm Off-White):** Applied to page backgrounds to reduce eye strain and provide a softer, more "paper-like" feel compared to pure white.
- **Surface (White):** Used for cards and panels to create a clear layer of separation from the background.

## Typography

The system utilizes two typefaces to balance character with utility.

- **Plus Jakarta Sans** is used for all headlines and display text. Its modern, slightly geometric humanist character provides an approachable yet professional personality.
- **Inter** is used for all body copy, data, and UI labels. It is chosen for its exceptional legibility at small sizes and its neutral, systematic feel.
- **Data & Badges:** Tier labels and status chips use Inter SemiBold with uppercase tracking to ensure they are immediately distinguishable from standard body text.

## Layout & Spacing

The design system employs a **Fixed Grid** on desktop (max 1200px) and a **Fluid Grid** on mobile.

- **Grid System:** A 12-column grid for desktop, a 6-column grid for tablets, and a 2-column grid for mobile handsets.
- **Spacing Rhythm:** Based on a 4px baseline. Most components use 8px (sm), 16px (md), or 24px (lg) increments for internal padding and external margins.
- **Breakpoints:**
  - Mobile: < 640px (Margins: 16px, Gutters: 12px)
  - Tablet: 640px - 1024px (Margins: 24px, Gutters: 16px)
  - Desktop: > 1024px (Margins: Auto/32px, Gutters: 24px)
- **Reflow Rules:** Filters move from a left-side sidebar on desktop to a bottom-sheet trigger on mobile. Provider cards occupy 100% width on mobile screens to maximize legibility.

## Elevation & Depth

To maintain a grounded and trustworthy feel, this design system avoids heavy shadows and complex light sources.

- **Tonal Layering:** The primary method for showing depth. Surface-white cards sit on the warm off-white background.
- **Low-Contrast Outlines:** All cards and input fields use a 1px border (`#E5E7EB`).
- **Interactive Elevation:**
  - **Resting State:** 1px border, no shadow or a very subtle 2px blur "micro-shadow."
  - **Hover State:** A slightly more pronounced ambient shadow (8px blur, 4% opacity) to indicate interactivity without feeling "floaty."
- **Flat Overlays:** Modals and mobile bottom sheets use a solid 40% black backdrop overlay to focus attention, emphasizing the "registry" feel.

## Shapes

The shape language is conservative to reinforce the product's reliability. 

- **Corners:** A "Soft" (`0.25rem` / `4px`) radius is the standard for most UI components like inputs and small buttons. 
- **Cards:** Use a slightly larger `8px` radius to provide a modern, contained look for provider information.
- **Pills:** Verification badges use a full pill-shape (circular ends) to differentiate them from functional buttons and clickable cards.
- **Strictness:** Avoid excessively large radii or "bubble" shapes which can diminish the perceived seriousness of a professional marketplace.

## Components

### Verification Badges (The Core Trust Signal)
Badges must be displayed as pill shapes with 12px SemiBold uppercase text.
- **Tier 1 (Listed):** Grey background (`#F3F4F6`), grey text (`#6B7280`).
- **Tier 2 (Verified):** Blue background (`#DBEAFE`), blue text (`#1D4ED8`).
- **Tier 3 (Trust Certified):** Amber background (`#FEF3C7`), dark amber text (`#92400E`). **Must** include a shield icon prepended to the text.

### Buttons
- **Primary:** Forest green background, white text. High emphasis.
- **CTA (Amber):** Warm amber background, near-black text. Reserved for the "Contact on WhatsApp" action.
- **Outline:** Forest green border (1.5px), transparent background, forest green text. Used for secondary actions like "Call" or "View Profile."

### Input Fields
Standardized with a 1px border (`#D1D5DB`). On focus, the border changes to Forest Green. Labels are always positioned above the field in Inter SemiBold 14px.

### Provider Cards
White surface, 1px border, 8px radius. The verification badge is always placed in the top right or immediately adjacent to the name. On mobile, cards take up full width to ensure the contact buttons are large, tappable targets.

### Progress Bars (Onboarding)
Uses a thick Forest Green track. Steps are indicated by labels above the bar, with the current step clearly highlighted.

### Category Chips
Small, 4px rounded containers used for quick-filtering. They use a light grey background that switches to Forest Green when selected.