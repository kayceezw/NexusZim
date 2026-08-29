import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { RequireAuth } from "@/components/require-auth";
import { PhotoUpload } from "@/components/registry/photo-upload";
import {
  DiamondField,
  RegistryChip,
  TierMarker,
  SectionHeading,
} from "@/components/registry";
import {
  OnboardingShell,
  type OnboardingStepKey,
  type OnboardingStepMeta,
} from "@/components/registry/onboarding-shell";
import { OnboardingTierCards } from "@/components/registry/onboarding-tier-cards";
import { OnboardingVerifiedChecklist } from "@/components/registry/onboarding-verified-checklist";
import { OnboardingSuccess } from "@/components/registry/onboarding-success";
import { providerRegistryId } from "@/lib/queries";
import { createCategoryFn } from "@/lib/create-category";
import {
  BadgeCheck,
  Check,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";

export const Route = createFileRoute("/onboarding/provider")({
  head: () => ({ meta: [{ title: "Provider registration - NexusZim" }] }),
  component: () => (
    <RequireAuth roles={["service_provider"]} requireOnboarding={false}>
      <ProviderOnboarding />
    </RequireAuth>
  ),
});

const CITIES = [
  "Harare",
  "Bulawayo",
  "Mutare",
  "Gweru",
  "Masvingo",
  "Victoria Falls",
  "Chitungwiza",
  "Kwekwe",
];

type DbCategory = { id: string; name: string; description: string | null };

type FormState = {
  businessName: string;
  phone: string;
  whatsapp: string;
  sameAsPhone: boolean;
  city: string;
  website: string;
  categoryId: string;
  bio: string;
  photos: string[];
};

const INITIAL: FormState = {
  businessName: "",
  phone: "",
  whatsapp: "",
  sameAsPhone: true,
  city: "Harare",
  website: "",
  categoryId: "",
  bio: "",
  photos: [],
};

// Ordered wizard steps for the shell rail.
const STEPS: OnboardingStepMeta[] = [
  { key: "welcome", label: "Welcome", index: 0, icon: Sparkles },
  { key: "identity", label: "Identity", index: 1, icon: FileText },
  { key: "credentials", label: "Credentials", index: 2, icon: ShieldCheck },
  { key: "finalize", label: "Finalize", index: 3, icon: ClipboardCheck },
];

const DRAFT_KEY = "nx-provider-onboarding-draft";

/** Deterministic display-only SHA256-style digest for a document reference. */
function pseudoDigest(seed: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0xc2b2ae35;
  for (let i = 0; i < seed.length; i++) {
    const c = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ c, 0x85ebca6b) >>> 0;
  }
  const hex = (n: number) => n.toString(16).padStart(8, "0");
  return (hex(h1) + hex(h2) + hex(h1 ^ h2) + hex((h1 + h2) >>> 0)).slice(0, 32);
}

/** Stable provisional reference derived from the user id. */
function provisionalRef(prefix: string, userId: string): string {
  let n = 0;
  for (let i = 0; i < userId.length; i++) n = (n * 31 + userId.charCodeAt(i)) >>> 0;
  return `${prefix}-${String(n % 10000).padStart(4, "0")}`;
}

function fileNameFromUrl(url: string): string {
  try {
    const raw = decodeURIComponent(url.split("/").pop() ?? "document");
    return raw.split("?")[0] || "document";
  } catch {
    return "document";
  }
}

function ProviderOnboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [activeStep, setActiveStep] = useState<OnboardingStepKey>("welcome");
  const [reachedIndex, setReachedIndex] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [catSearch, setCatSearch] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [declared, setDeclared] = useState(false);
  const [success, setSuccess] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const { data: categories = [] } = useQuery<DbCategory[]>({
    queryKey: ["categories-onboarding"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name, description")
        .order("name");
      return data ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });

  // Restore any locally saved draft on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { form?: Partial<FormState>; custom?: string };
      if (parsed.form) setForm((f) => ({ ...f, ...parsed.form }));
      if (parsed.custom) {
        setCustomCategory(parsed.custom);
        setShowCustom(true);
      }
    } catch {
      // Corrupt draft — ignore and continue with defaults.
    }
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function saveDraft() {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ form, custom: showCustom ? customCategory : "" }),
      );
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    } catch {
      // Storage unavailable (private mode / quota) — silently no-op.
    }
  }

  function goToStep(key: OnboardingStepKey) {
    const meta = STEPS.find((s) => s.key === key);
    if (!meta || meta.index > reachedIndex) return;
    setActiveStep(key);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function advanceTo(key: OnboardingStepKey) {
    const meta = STEPS.find((s) => s.key === key);
    if (!meta) return;
    setReachedIndex((r) => Math.max(r, meta.index));
    setActiveStep(key);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---- Validation (identity gathers the substantive contact + category fields) ----
  function validateIdentity(): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.businessName.trim()) errs.businessName = "Registered entity name is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!form.city) errs.city = "City is required";
    if (!form.categoryId && !(showCustom && customCategory.trim())) {
      errs.categoryId = "Please select a category or define your own";
    }
    if (form.bio.trim().length < 60) {
      errs.bio = "Please write at least 60 characters about your entity";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function proceedToCredentials() {
    if (validateIdentity()) advanceTo("credentials");
  }

  async function handleSubmit() {
    if (!user) return;
    if (!declared) return;
    setSubmitting(true);
    setSubmitError(null);

    let categoryId = form.categoryId;

    // If provider defined a custom category, create it first.
    if (showCustom && customCategory.trim() && !categoryId) {
      try {
        const newCat = await createCategoryFn({ data: { name: customCategory.trim() } });
        categoryId = newCat.id;
      } catch (e) {
        setSubmitError((e as Error).message);
        setSubmitting(false);
        return;
      }
    }

    const whatsappNum = form.sameAsPhone ? form.phone : form.whatsapp;

    const { error: e1 } = await supabase.from("provider_profiles").upsert({
      user_id: user.id,
      business_name: form.businessName.trim(),
      category_id: categoryId || null,
      city: form.city,
      phone: form.phone.trim(),
      whatsapp: whatsappNum.trim() || null,
      website: form.website.trim() || null,
      bio: form.bio.trim(),
      photos: form.photos,
      tier: 1,
    });

    if (e1) {
      setSubmitError(e1.message);
      setSubmitting(false);
      return;
    }

    const { error: e2 } = await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", user.id);

    if (e2) {
      setSubmitError(e2.message);
      setSubmitting(false);
      return;
    }

    // Clear any saved draft now that the record is filed.
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }

    await refreshProfile();
    setSubmitting(false);
    setSuccess(true);
  }

  async function completeAndLeave() {
    setSuccess(false);
    navigate({ to: "/provider/dashboard" });
  }

  const selectedCategory = categories.find((c) => c.id === form.categoryId);
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(catSearch.toLowerCase()),
  );
  const categoryLabel =
    showCustom && customCategory ? `${customCategory} (custom)` : (selectedCategory?.name ?? "-");

  const registryId = user ? providerRegistryId(user.id) : "NX-PENDING";
  const tempReq = user ? provisionalRef("TMP-REQ", user.id) : "TMP-REQ-0000";
  const receipt = user ? provisionalRef("REC", user.id) : "REC-0000";

  const attachedDocs = useMemo(
    () => form.photos.map((url) => ({ url, name: fileNameFromUrl(url), sha: pseudoDigest(url) })),
    [form.photos],
  );
  const hasPrimaryLicense = form.photos.length > 0;
  const supplementalCount = Math.max(0, form.photos.length - 1);

  return (
    <>
      <OnboardingShell
        steps={STEPS}
        active={activeStep}
        onStepSelect={goToStep}
        reachedIndex={reachedIndex}
        onSaveDraft={saveDraft}
        draftSaved={draftSaved}
      >
        {activeStep === "welcome" && (
          <WelcomeStep onBegin={() => advanceTo("identity")} refId={registryId} />
        )}

        {activeStep === "identity" && (
          <IdentityStep
            form={form}
            errors={errors}
            set={set}
            categories={filteredCategories}
            catSearch={catSearch}
            setCatSearch={setCatSearch}
            selectedCategory={selectedCategory}
            showCustom={showCustom}
            setShowCustom={setShowCustom}
            customCategory={customCategory}
            setCustomCategory={setCustomCategory}
            onCancel={() => advanceTo("welcome")}
            onProceed={proceedToCredentials}
          />
        )}

        {activeStep === "credentials" && user && (
          <CredentialsStep
            userId={user.id}
            photos={form.photos}
            onPhotos={(photos) => set("photos", photos)}
            hasPrimaryLicense={hasPrimaryLicense}
            supplementalCount={supplementalCount}
            onBack={() => goToStep("identity")}
            onContinue={() => advanceTo("finalize")}
          />
        )}

        {activeStep === "finalize" && (
          <FinalizeStep
            businessName={form.businessName}
            city={form.city}
            registryId={registryId}
            tempReq={tempReq}
            categoryLabel={categoryLabel}
            attachedDocs={attachedDocs}
            declared={declared}
            setDeclared={setDeclared}
            submitting={submitting}
            submitError={submitError}
            onEditIdentity={() => goToStep("identity")}
            onEditCredentials={() => goToStep("credentials")}
            onBack={() => goToStep("credentials")}
            onSubmit={handleSubmit}
          />
        )}
      </OnboardingShell>

      {success && <OnboardingSuccess receipt={receipt} onReturn={completeAndLeave} />}
    </>
  );
}

/* ============================== Welcome ============================== */

function WelcomeStep({ onBegin, refId }: { onBegin: () => void; refId: string }) {
  return (
    <div className="relative overflow-hidden rounded-[6px] border border-border bg-card p-6 sm:p-10">
      <DiamondField className="opacity-50" />
      <div className="relative">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
            <BadgeCheck className="h-8 w-8" strokeWidth={1.5} />
          </span>
          <SectionHeading
            align="center"
            eyebrow="Provider accreditation"
            title="Establish Your Authority"
            subcopy="NexusZim is the official register of accredited service providers. Complete your accreditation to enter the register and build verifiable trust with clients across Zimbabwe."
          />
        </div>

        <div className="mt-8">
          <OnboardingTierCards />
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onBegin}
            className="flex items-center justify-center gap-2 rounded-[3px] bg-gold px-8 py-3.5 font-sans text-sm font-semibold uppercase tracking-[0.08em] text-forest-ink transition-colors hover:bg-gold-deep"
          >
            Begin accreditation
            <ChevronRight className="h-4 w-4" />
          </button>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60">
            REF: {refId}
          </p>
          <p className="max-w-md text-center font-sans text-[11px] leading-relaxed text-muted-foreground/70">
            NexusZim is an accreditation registry and does not handle or intermediate client funds.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================== Identity ============================== */

const ENTITY_TYPES = [
  "Sole Trader",
  "Private Limited Company (PBC/PLC)",
  "Partnership",
  "Cooperative",
  "Non-Governmental Organisation",
  "Other",
];

function IdentityStep({
  form,
  errors,
  set,
  categories,
  catSearch,
  setCatSearch,
  selectedCategory,
  showCustom,
  setShowCustom,
  customCategory,
  setCustomCategory,
  onCancel,
  onProceed,
}: {
  form: FormState;
  errors: Partial<Record<keyof FormState, string>>;
  set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  categories: DbCategory[];
  catSearch: string;
  setCatSearch: (v: string) => void;
  selectedCategory: DbCategory | undefined;
  showCustom: boolean;
  setShowCustom: (v: boolean) => void;
  customCategory: string;
  setCustomCategory: (v: string) => void;
  onCancel: () => void;
  onProceed: () => void;
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeading
          eyebrow="Entity Registration / Step 1: Identity & Contact Details"
          title="Entity Registration"
          subcopy="Provide your entity's legal identity and official contact details for the register."
        />
        <RegistryChip value="FORM-001A" size="md" className="shrink-0" />
      </div>

      {/* --- Professional Identity --- */}
      <FormSection title="Professional Identity">
        <Field label="Registered entity name" required error={errors.businessName}>
          <input
            type="text"
            required
            value={form.businessName}
            onChange={(e) => set("businessName", e.target.value)}
            placeholder="Your registered business name"
            className="field-input"
          />
        </Field>
        <p className="font-sans text-[12px] leading-relaxed text-muted-foreground">
          Enter the entity name exactly as it appears on your registration documents.
        </p>
      </FormSection>

      {/* --- Business Registration (category as entity type / service classification) --- */}
      <FormSection title="Business Registration">
        <Field label="Registration number" hint="Optional">
          <input
            type="text"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
            placeholder="e.g. 12345/2024 or website / portfolio URL"
            className="field-input font-mono uppercase tracking-[0.04em]"
          />
        </Field>
        <p className="-mt-2 font-sans text-[11px] leading-relaxed text-muted-foreground/70">
          Your CIPZ registration reference or a public portfolio URL used to corroborate your entity.
        </p>

        <Field label="Service category" required error={errors.categoryId}>
          {!showCustom ? (
            <div className="space-y-3">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40"
                  strokeWidth={1.5}
                />
                <input
                  type="text"
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  placeholder="Search categories..."
                  className="field-input pl-10"
                />
              </div>
              <div className="max-h-[300px] space-y-1.5 overflow-y-auto pr-1">
                {categories.length === 0 && (
                  <p className="py-4 text-center font-sans text-sm italic text-muted-foreground">
                    No match. Try defining your own below.
                  </p>
                )}
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      set("categoryId", cat.id);
                      setShowCustom(false);
                    }}
                    className={`w-full rounded-[6px] border px-4 py-3 text-left transition-all ${
                      form.categoryId === cat.id
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-display text-[15px] text-foreground">{cat.name}</p>
                      {form.categoryId === cat.id && (
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                      )}
                    </div>
                    {cat.description && (
                      <p className="mt-0.5 line-clamp-1 font-sans text-[12px] leading-snug text-muted-foreground">
                        {cat.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCustom(true);
                  set("categoryId", "");
                }}
                className="group w-full rounded-[6px] border border-dashed border-border px-4 py-3 text-left transition-colors hover:border-primary"
              >
                <p className="font-sans text-[13px] text-muted-foreground transition-colors group-hover:text-primary">
                  My category isn't listed.{" "}
                  <span className="font-semibold">Define my own</span>
                </p>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-[6px] border border-gold/30 bg-gold/5 px-4 py-3">
                <p className="font-sans text-[13px] leading-relaxed text-muted-foreground">
                  Describe your service category in a few words. It will be added to the platform
                  register.
                </p>
              </div>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Solar Panel Installation, Drone Photography..."
                className="field-input"
                maxLength={60}
              />
              <button
                type="button"
                onClick={() => {
                  setShowCustom(false);
                  setCustomCategory("");
                }}
                className="font-sans text-[12px] text-muted-foreground transition-colors hover:text-primary"
              >
                Back to category list
              </button>
            </div>
          )}
        </Field>

        <Field label="Entity type" hint="Optional">
          <select
            defaultValue=""
            className="field-input"
            aria-label="Entity type"
          >
            <option value="">Select entity type</option>
            {ENTITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      </FormSection>

      {/* --- Official Contact --- */}
      <FormSection title="Official Contact">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="City" required error={errors.city}>
            <select
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              className="field-input"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Phone number" required error={errors.phone}>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+263 77 123 4567"
              className="field-input"
            />
          </Field>
        </div>

        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={form.sameAsPhone}
              onChange={(e) => set("sameAsPhone", e.target.checked)}
              className="accent-forest"
            />
            <span className="font-sans text-[13px] text-muted-foreground">
              WhatsApp number is the same as phone
            </span>
          </label>
          {!form.sameAsPhone && (
            <Field label="WhatsApp number">
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
                placeholder="+263 77 123 4567"
                className="field-input"
              />
            </Field>
          )}
        </div>

        <Field
          label="Entity profile"
          required
          error={errors.bio}
          hint={`${form.bio.length} / 500 chars (min 60)`}
        >
          <textarea
            required
            rows={5}
            value={form.bio}
            onChange={(e) => set("bio", e.target.value.slice(0, 500))}
            placeholder="Describe your experience, specialties, and what makes your service stand out..."
            className="field-input resize-none"
          />
        </Field>
      </FormSection>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[3px] border border-border px-6 py-3 font-sans text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onProceed}
          className="flex flex-1 items-center justify-center gap-2 rounded-[3px] bg-gold py-3 font-sans text-sm font-semibold text-forest-ink transition-colors hover:bg-gold-deep"
        >
          Proceed to Credentials
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ============================== Credentials ============================== */

function CredentialsStep({
  userId,
  photos,
  onPhotos,
  hasPrimaryLicense,
  supplementalCount,
  onBack,
  onContinue,
}: {
  userId: string;
  photos: string[];
  onPhotos: (photos: string[]) => void;
  hasPrimaryLicense: boolean;
  supplementalCount: number;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Entity Registration / Step 2"
        title="Credentials & Documentation"
        subcopy="Attach your professional license and any supplemental certifications. Documents are optional to enter the register and can be added later for Verified status."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Primary license — the required (in-spirit) proof zone */}
          <div className="rounded-[6px] border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="eyebrow text-foreground">
                <span className="inline-block h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" />
                Primary professional license
              </p>
              <span className="rounded-[3px] bg-gold/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-gold-deep">
                Required for Verified
              </span>
            </div>
            <p className="mb-4 flex items-center gap-2 font-sans text-[12px] leading-relaxed text-muted-foreground">
              <UploadCloud className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={1.75} />
              Upload a clear scan of your primary license or trade registration. Accepted as image
              files.
            </p>
            <PhotoUpload
              userId={userId}
              photos={photos}
              maxPhotos={6}
              onChange={onPhotos}
              label="License & supporting documents"
            />
          </div>

          {/* Supplemental certifications — optional, listed rows */}
          <div className="rounded-[6px] border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="eyebrow text-foreground">
                <span className="inline-block h-1.5 w-1.5 shrink-0 rotate-45 border border-current" />
                Supplemental certifications
              </p>
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground/60">
                Optional
              </span>
            </div>
            {photos.length <= 1 ? (
              <p className="rounded-[6px] border border-dashed border-border px-4 py-6 text-center font-sans text-[12px] text-muted-foreground/70">
                No supplemental documents yet. Add more files in the license zone above to strengthen
                your accreditation tier.
              </p>
            ) : (
              <ul className="divide-y divide-hairline">
                {photos.slice(1).map((url) => (
                  <li key={url} className="flex items-center gap-3 py-2.5">
                    <FileText className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} />
                    <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-foreground">
                      {fileNameFromUrl(url)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onPhotos(photos.filter((p) => p !== url))}
                      className="shrink-0 rounded-[3px] p-1 text-muted-foreground transition-colors hover:text-destructive"
                      aria-label="Remove document"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <OnboardingVerifiedChecklist
            hasPrimaryLicense={hasPrimaryLicense}
            supplementalCount={supplementalCount}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-[3px] border border-border px-6 py-3 font-sans text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="flex flex-1 items-center justify-center gap-2 rounded-[3px] bg-gold py-3 font-sans text-sm font-semibold text-forest-ink transition-colors hover:bg-gold-deep"
        >
          Continue to Finalize
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ============================== Finalize ============================== */

function FinalizeStep({
  businessName,
  city,
  registryId,
  tempReq,
  categoryLabel,
  attachedDocs,
  declared,
  setDeclared,
  submitting,
  submitError,
  onEditIdentity,
  onEditCredentials,
  onBack,
  onSubmit,
}: {
  businessName: string;
  city: string;
  registryId: string;
  tempReq: string;
  categoryLabel: string;
  attachedDocs: { url: string; name: string; sha: string }[];
  declared: boolean;
  setDeclared: (v: boolean) => void;
  submitting: boolean;
  submitError: string | null;
  onEditIdentity: () => void;
  onEditCredentials: () => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-xl">
        <SectionHeading
          align="center"
          eyebrow="Entity Registration / Final Step"
          title="Submission Review"
          subcopy="Review your entity details and attached credentials before filing for the official record."
        />
      </div>

      {/* Bento summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Entity Identity — span 2 */}
        <div className="rounded-[6px] border border-border bg-card p-5 md:col-span-2">
          <div className="mb-4 flex items-center justify-between border-b border-hairline pb-3">
            <p className="eyebrow text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 shrink-0 rotate-45 border border-current" />
              Entity Identity
            </p>
            <button
              type="button"
              onClick={onEditIdentity}
              className="font-sans text-[11px] text-primary transition-colors hover:text-gold-deep"
            >
              Edit
            </button>
          </div>
          <dl className="space-y-3">
            <SummaryRow label="Legal name" value={businessName || "-"} />
            <div className="flex items-start gap-4">
              <dt className="w-32 shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                Registration ID
              </dt>
              <dd className="flex-1">
                <RegistryChip value={registryId} size="sm" copyable />
              </dd>
            </div>
            <SummaryRow label="Service category" value={categoryLabel} />
            <SummaryRow label="Registered city" value={city || "-"} />
          </dl>
        </div>

        {/* Status — gold elite-border */}
        <div className="elite-border relative overflow-hidden rounded-[6px] bg-gold/[0.05] p-5">
          <DiamondField tone="gold" className="opacity-60" />
          <div className="relative flex h-full flex-col">
            <p className="eyebrow text-gold-deep">
              <span className="inline-block h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" />
              Status
            </p>
            <div className="mt-3 flex-1">
              <TierMarker tier={1} variant="full" />
              <p className="mt-3 font-display text-lg text-foreground">Pending Review</p>
              <p className="mt-1 font-sans text-[12px] leading-relaxed text-muted-foreground">
                Enters the register on submission; verification follows.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground/60">
                Request ref
              </span>
              <RegistryChip value={tempReq} tone="gold" size="sm" />
            </div>
          </div>
        </div>

        {/* Attached Credentials — span 3 */}
        <div className="rounded-[6px] border border-border bg-card p-5 md:col-span-3">
          <div className="mb-4 flex items-center justify-between border-b border-hairline pb-3">
            <p className="eyebrow text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 shrink-0 rotate-45 border border-current" />
              Attached Credentials
            </p>
            <button
              type="button"
              onClick={onEditCredentials}
              className="font-sans text-[11px] text-primary transition-colors hover:text-gold-deep"
            >
              Edit
            </button>
          </div>
          {attachedDocs.length === 0 ? (
            <p className="py-4 text-center font-sans text-[12px] text-muted-foreground/70">
              No documents attached. You can add credentials later for Verified status.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {attachedDocs.map((doc) => (
                <li
                  key={doc.url}
                  className="flex items-center gap-3 rounded-[6px] border border-border bg-background px-3 py-2.5"
                >
                  <FileText className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} />
                  <span className="w-40 shrink-0 truncate font-sans text-[13px] text-foreground">
                    {doc.name}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground/70">
                    SHA256: {doc.sha}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Declaration of Truthfulness */}
      <div className="rounded-[6px] border border-l-4 border-border border-l-primary bg-card p-5">
        <p className="eyebrow text-foreground">
          <span className="inline-block h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" />
          Declaration of Truthfulness
        </p>
        <p className="mt-2 font-sans text-[13px] leading-relaxed text-muted-foreground">
          I confirm that the information and documents provided are true and accurate to the best of
          my knowledge. I understand that NexusZim is an accreditation registry and does not handle
          or intermediate client funds, and that misrepresentation may result in removal from the
          register.
        </p>
        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={declared}
            onChange={(e) => setDeclared(e.target.checked)}
            className="mt-0.5 accent-forest"
          />
          <span className="font-sans text-[13px] font-medium text-foreground">
            I declare the above and consent to registry review.
          </span>
        </label>
      </div>

      {submitError && (
        <div className="rounded-[3px] border border-destructive/30 bg-destructive/10 px-4 py-3 font-sans text-sm text-destructive">
          {submitError}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-[3px] border border-border px-6 py-3 font-sans text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting || !declared}
          className="flex flex-1 items-center justify-center gap-2 rounded-[3px] bg-gold py-3 font-sans text-sm font-semibold text-forest-ink transition-colors hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            "Filing official record..."
          ) : (
            <>
              Submit for Official Record
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ============================== Shared field bits ============================== */

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <dt className="w-32 shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </dt>
      <dd className="flex-1 font-sans text-[13px] leading-relaxed text-foreground">{value}</dd>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5">
      <h3 className="border-b border-hairline pb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  error,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-gold">*</span>}
        {hint && (
          <span className="ml-2 font-sans text-[11px] normal-case tracking-normal text-muted-foreground/60">
            {hint}
          </span>
        )}
      </label>
      {children}
      {error && <p className="font-sans text-[12px] text-destructive">{error}</p>}
    </div>
  );
}
