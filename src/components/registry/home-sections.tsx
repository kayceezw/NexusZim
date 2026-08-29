import { Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarCheck,
  Circle,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  Home,
  ListChecks,
  Plane,
  Scissors,
  ShieldCheck,
  Shirt,
  Sparkles,
  Stethoscope,
  Truck,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import {
  DiamondField,
  RegistryChip,
  NexusZimLogo,
} from "@/components/registry";
import type { CategoryWithCount } from "@/lib/queries";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────────
 * SCREEN 1 helpers — home-scoped presentational pieces.
 * These are intentionally namespaced with `home-` to avoid collisions with
 * other page agents working in `src/components/registry/`.
 * ──────────────────────────────────────────────────────────────────────── */

/* Section 2 — The Verification Standard: three tier cards. */

type TierCardData = {
  tier: 1 | 2 | 3;
  code: string;
  name: string;
  description: string;
  icon: LucideIcon;
};

const TIER_CARDS: TierCardData[] = [
  {
    tier: 1,
    code: "TIER_01",
    name: "Listed",
    description:
      "The entry standard. The provider's identity and business details are recorded on the public register.",
    icon: Circle,
  },
  {
    tier: 2,
    code: "TIER_02",
    name: "Verified",
    description:
      "Identity documents and business registration are checked and confirmed against official records.",
    icon: ShieldCheck,
  },
  {
    tier: 3,
    code: "TIER_03",
    name: "Trust Certified",
    description:
      "The highest standard. A full portfolio audit, rating history and continuous review of the provider's record.",
    icon: BadgeCheck,
  },
];

export function VerificationStandard() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {TIER_CARDS.map((card, i) => (
        <TierStandardCard key={card.code} card={card} index={i} />
      ))}
    </div>
  );
}

function TierStandardCard({ card, index }: { card: TierCardData; index: number }) {
  const Icon = card.icon;
  const isVerified = card.tier === 2;
  const isCertified = card.tier === 3;

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[var(--radius)] bg-card p-6 animate-fade-up",
        "shadow-[var(--elev-sm)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--elev-md)]",
        isCertified ? "elite-border" : "border border-border",
      )}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* Verified: primary accent bar. Certified: gold accent bar + diamond field. */}
      {isVerified && (
        <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-primary" />
      )}
      {isCertified && (
        <>
          <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-gold" />
          <DiamondField tone="gold" className="opacity-[0.5]" />
        </>
      )}

      <div className="relative flex flex-1 flex-col">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full border",
            isCertified
              ? "border-gold/40 bg-gold/[0.08] text-gold-deep"
              : isVerified
                ? "border-primary/30 bg-primary/[0.06] text-primary"
                : "border-border bg-surface text-muted-foreground",
          )}
        >
          <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
        </div>

        <h3
          className={cn(
            "mt-5 font-display text-2xl leading-tight tracking-[-0.01em]",
            isCertified ? "text-gold-deep" : "text-foreground",
          )}
        >
          {card.name}
        </h3>

        <p className="mt-2 flex-1 font-sans text-sm leading-relaxed text-muted-foreground">
          {card.description}
        </p>

        <div className="mt-5">
          <RegistryChip value={card.code} tone={isCertified ? "gold" : "default"} size="sm" />
        </div>
      </div>
    </div>
  );
}

/* Section 3 — Traceable Trust: the decorative Certificate of Accreditation. */

export function CertificateOfAccreditation({ registryId }: { registryId: string }) {
  return (
    <div className="relative overflow-hidden rounded-[var(--radius)] elite-border bg-card p-8 shadow-[var(--elev-md)]">
      <DiamondField tone="gold" className="opacity-[0.55]" />

      {/* Logo watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-4 select-none opacity-[0.06]"
        style={{ transform: "scale(2.4)", transformOrigin: "top right" }}
      >
        <NexusZimLogo variant="color" size="lg" asLink={false} />
      </div>

      <div className="relative flex flex-col items-center text-center">
        <span aria-hidden className="mb-6 inline-block h-3 w-3 rotate-45 bg-gold" />

        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold-deep">
          Certificate of Accreditation
        </p>

        <div className="my-5 h-px w-16 bg-border" aria-hidden />

        <h3 className="font-display text-3xl leading-tight tracking-[-0.01em] text-foreground">
          NexusZim Authority
        </h3>
        <p className="mt-2 max-w-xs font-sans text-sm leading-relaxed text-muted-foreground">
          This record is entered on the official NexusZim register and is traceable to a unique,
          permanent registry identifier.
        </p>

        {/* Dashed mono ID box */}
        <div className="mt-6 w-full rounded-[var(--radius-sm)] border border-dashed border-gold/50 bg-gold/[0.04] px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Registry Identifier
          </p>
          <p className="mt-1 font-mono text-base font-medium uppercase tracking-[0.08em] text-foreground">
            {registryId}
          </p>
        </div>

        {/* Gold seal badge */}
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/[0.08] px-3 py-1.5">
          <BadgeCheck className="h-4 w-4 text-gold" strokeWidth={2} aria-hidden />
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold-deep">
            Official Seal
          </span>
        </div>
      </div>
    </div>
  );
}

/* Section 4 — Categories of Excellence: tile grid. */

const CATEGORY_ICON: Record<string, LucideIcon> = {
  "elite-concierge": Sparkles,
  "events-production": CalendarCheck,
  "visa-immigration": Plane,
  "company-registration": Building2,
  "transport-logistics": Truck,
  "beauty-grooming-wellness": Scissors,
  "fitness-personal-training": Dumbbell,
  "fashion-tailoring-styling": Shirt,
  "business-professional": Briefcase,
  "property-services": Home,
  "health-medical": Stethoscope,
  "education-tutoring": GraduationCap,
  "food-catering": UtensilsCrossed,
  "repairs-home-services": Wrench,
};

function iconForCategory(slug: string): LucideIcon {
  return CATEGORY_ICON[slug] ?? HeartPulse;
}

export function CategoryExcellenceGrid({ categories }: { categories: CategoryWithCount[] }) {
  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-[var(--radius)] border border-dashed border-border py-16">
        <p className="flex items-center gap-2 font-sans text-sm text-muted-foreground">
          <ListChecks className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Categories are being added to the register.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
      {categories.map((category, i) => {
        const Icon = iconForCategory(category.slug);
        return (
          <Link
            key={category.id}
            to="/categories/$slug"
            params={{ slug: category.slug }}
            className={cn(
              "group flex h-48 flex-col items-center justify-center gap-4 rounded-[var(--radius)] border border-border bg-card p-4 text-center animate-fade-up",
              "shadow-[var(--elev-sm)] transition-all duration-200",
              "hover:-translate-y-1 hover:border-primary hover:shadow-[var(--elev-md)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            )}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface text-primary transition-colors duration-200 group-hover:border-primary/40 group-hover:bg-primary/[0.06]">
              <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
            </span>
            <span className="font-sans text-[12px] font-semibold uppercase leading-snug tracking-[0.1em] text-foreground">
              {category.name}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60">
              {category.provider_count} on register
            </span>
          </Link>
        );
      })}
    </div>
  );
}
