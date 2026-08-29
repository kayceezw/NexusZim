// Registry redesign shared primitives. Page agents import from here:
//   import { DiamondField, RegistryChip, TierMarker, SectionHeading } from "@/components/registry";

export { DiamondField } from "./diamond-field";
export { RegistryChip } from "./registry-chip";
export { TierMarker } from "./tier-marker";
export type { TierMarkerTier } from "./tier-marker";
export { SectionHeading } from "./section-heading";

// Re-export existing registry pieces for a single import surface.
export { Hallmark, TierBadge } from "./hallmark";
export type { TierLevel } from "./hallmark";
export { NexusZimLogo } from "./logo";
export { Ledger, LedgerRow } from "./ledger";
export type { LedgerEntry } from "./ledger";
export { RatingDisplay, StarInput } from "./star-rating";
