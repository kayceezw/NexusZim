import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { RequireAuth } from "@/components/require-auth";
import { PhotoUpload } from "@/components/registry/photo-upload";
import { CheckCircle2, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/onboarding/provider")({
  head: () => ({ meta: [{ title: "Provider registration — NexusZim" }] }),
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

const STEPS = [
  { num: 1, label: "Business identity" },
  { num: 2, label: "Service category" },
  { num: 3, label: "About & photos" },
  { num: 4, label: "Review & submit" },
];

function ProviderOnboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validateStep1(): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.businessName.trim()) errs.businessName = "Business name is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!form.city) errs.city = "City is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep2(): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.categoryId) errs.categoryId = "Please select a service category";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep3(): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (form.bio.trim().length < 60)
      errs.bio = "Please write at least 60 characters about your business";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function goNext() {
    const valid =
      step === 1 ? validateStep1() : step === 2 ? validateStep2() : step === 3 ? validateStep3() : true;
    if (valid) setStep((s) => s + 1);
  }

  async function handleSubmit() {
    if (!user) return;
    setSubmitting(true);
    setSubmitError(null);

    const whatsappNum = form.sameAsPhone ? form.phone : form.whatsapp;

    const { error: e1 } = await supabase.from("provider_profiles").upsert({
      user_id: user.id,
      business_name: form.businessName.trim(),
      category_id: form.categoryId || null,
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

    await refreshProfile();
    navigate({ to: "/provider/dashboard" });
  }

  const selectedCategory = categories.find((c) => c.id === form.categoryId);

  return (
    <div className="bg-cream pt-16 pb-20 min-h-screen">
      {/* Dark header strip */}
      <div className="bg-forest border-b border-cream/10">
        <div className="container-page max-w-2xl py-8">
          <p className="eyebrow text-cream/40 mb-2">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            Provider registration
          </p>
          <h1 className="font-display text-3xl text-cream">Join the register</h1>
        </div>
      </div>

      <div className="container-page max-w-2xl py-10">
        {/* Step progress */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => step > s.num && setStep(s.num)}
                disabled={step <= s.num}
                className="flex flex-col items-center gap-1 min-w-0"
              >
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-mono font-bold transition-colors ${
                    s.num < step
                      ? "bg-forest text-cream"
                      : s.num === step
                        ? "bg-gold text-forest-ink"
                        : "bg-hairline text-text-soft"
                  }`}
                >
                  {s.num < step ? <CheckCircle2 className="h-4 w-4" /> : s.num}
                </div>
                <span
                  className={`font-mono text-[9px] uppercase tracking-[0.06em] hidden sm:block ${
                    s.num === step ? "text-forest font-bold" : "text-text-soft/60"
                  }`}
                >
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 ${s.num < step ? "bg-forest" : "bg-hairline"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Business identity */}
        {step === 1 && (
          <StepCard
            title="Business identity"
            subtitle="Tell us about your business."
            step={1}
            total={4}
          >
            <Field label="Business name" required error={errors.businessName}>
              <input
                type="text"
                autoFocus
                required
                value={form.businessName}
                onChange={(e) => set("businessName", e.target.value)}
                placeholder="Your registered business name"
                className="field-input"
              />
            </Field>

            <div className="grid sm:grid-cols-2 gap-5">
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
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.sameAsPhone}
                  onChange={(e) => set("sameAsPhone", e.target.checked)}
                  className="accent-forest"
                />
                <span className="font-sans text-[13px] text-text-soft">
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

            <Field label="Website or portfolio" hint="Optional">
              <input
                type="url"
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
                placeholder="https://yourbusiness.co.zw"
                className="field-input"
              />
            </Field>

            <StepNav onNext={goNext} />
          </StepCard>
        )}

        {/* Step 2: Category selection */}
        {step === 2 && (
          <StepCard
            title="Service category"
            subtitle="What type of services do you provide?"
            step={2}
            total={4}
          >
            {errors.categoryId && (
              <p className="text-rose-600 font-sans text-[12px] mb-2">{errors.categoryId}</p>
            )}
            <div className="grid sm:grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => set("categoryId", cat.id)}
                  className={`text-left p-4 rounded-[6px] border transition-all ${
                    form.categoryId === cat.id
                      ? "border-forest bg-forest/5 ring-1 ring-forest"
                      : "border-hairline bg-cream-raised hover:border-forest/40"
                  }`}
                >
                  <p className="font-display text-base text-text">{cat.name}</p>
                  {cat.description && (
                    <p className="mt-1 font-sans text-[12px] text-text-soft leading-snug line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                  {form.categoryId === cat.id && (
                    <div className="mt-2 flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.06em] text-forest">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Selected
                    </div>
                  )}
                </button>
              ))}
            </div>

            <StepNav onBack={() => setStep(1)} onNext={goNext} />
          </StepCard>
        )}

        {/* Step 3: Bio + photos */}
        {step === 3 && (
          <StepCard
            title="About your business"
            subtitle="Help clients understand what you offer."
            step={3}
            total={4}
          >
            <Field
              label="Business bio"
              required
              error={errors.bio}
              hint={`${form.bio.length} / 500 chars (min 60)`}
            >
              <textarea
                required
                rows={6}
                value={form.bio}
                onChange={(e) => set("bio", e.target.value.slice(0, 500))}
                placeholder="Describe your experience, specialties, and what makes your service stand out..."
                className="field-input resize-none"
              />
            </Field>

            {user && (
              <div>
                <p className="eyebrow text-text-soft mb-3">
                  <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
                  Proof photos
                  <span className="ml-2 normal-case font-sans text-[11px] text-text-soft/60 tracking-normal">
                    Optional — you can add these later
                  </span>
                </p>
                <PhotoUpload
                  userId={user.id}
                  photos={form.photos}
                  maxPhotos={5}
                  onChange={(photos) => set("photos", photos)}
                  label="Premises or work photos"
                />
              </div>
            )}

            <StepNav onBack={() => setStep(2)} onNext={goNext} />
          </StepCard>
        )}

        {/* Step 4: Review & submit */}
        {step === 4 && (
          <StepCard
            title="Review & submit"
            subtitle="Confirm your details before joining the register."
            step={4}
            total={4}
          >
            <div className="bg-cream border border-hairline rounded-[6px] divide-y divide-hairline">
              <ReviewRow label="Business name" value={form.businessName} onEdit={() => setStep(1)} />
              <ReviewRow label="City" value={form.city} onEdit={() => setStep(1)} />
              <ReviewRow label="Phone" value={form.phone} onEdit={() => setStep(1)} />
              <ReviewRow
                label="WhatsApp"
                value={form.sameAsPhone ? form.phone : form.whatsapp || "—"}
                onEdit={() => setStep(1)}
              />
              {form.website && (
                <ReviewRow label="Website" value={form.website} onEdit={() => setStep(1)} />
              )}
              <ReviewRow
                label="Category"
                value={selectedCategory?.name ?? "—"}
                onEdit={() => setStep(2)}
              />
              <div className="flex items-start gap-4 px-5 py-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-soft w-28 shrink-0 mt-0.5">
                  Bio
                </span>
                <p className="font-sans text-[13px] text-text flex-1 leading-relaxed line-clamp-3">
                  {form.bio || "—"}
                </p>
                <button
                  onClick={() => setStep(3)}
                  className="font-sans text-[11px] text-forest hover:text-gold-deep shrink-0"
                >
                  Edit
                </button>
              </div>
              {form.photos.length > 0 && (
                <div className="flex items-center gap-4 px-5 py-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-soft w-28 shrink-0">
                    Photos
                  </span>
                  <span className="font-sans text-[13px] text-text flex-1">
                    {form.photos.length} photo{form.photos.length !== 1 ? "s" : ""} uploaded
                  </span>
                </div>
              )}
            </div>

            {/* Tier notice */}
            <div className="border border-hairline rounded-[6px] px-5 py-4">
              <div className="flex gap-3">
                <span className="inline-block h-2 w-2 rotate-45 border border-hairline shrink-0 mt-1" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text mb-1">
                    Tier 1 — Listed (free)
                  </p>
                  <p className="font-sans text-[12px] text-text-soft leading-relaxed">
                    Your profile enters the register immediately. The NexusZim desk will contact you
                    with document requirements for Verified (Tier 2) and Trust Certified (Tier 3)
                    status.
                  </p>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="border border-rose-200 bg-rose-50 px-4 py-3 rounded-[3px] font-sans text-sm text-rose-600">
                {submitError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="border border-hairline px-6 py-3 rounded-[3px] font-sans text-sm text-text-soft hover:border-forest hover:text-forest transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-gold py-3 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  "Submitting application..."
                ) : (
                  <>
                    Submit application
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </StepCard>
        )}
      </div>
    </div>
  );
}

function StepCard({
  title,
  subtitle,
  step,
  total,
  children,
}: {
  title: string;
  subtitle: string;
  step: number;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft/60">
          Step {step} of {total}
        </p>
        <h2 className="font-display text-2xl text-text mt-1">{title}</h2>
        <p className="font-sans text-[13px] text-text-soft mt-1">{subtitle}</p>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function StepNav({
  onBack,
  onNext,
  nextLabel = "Continue",
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
}) {
  return (
    <div className="flex gap-3 pt-2">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="border border-hairline px-6 py-3 rounded-[3px] font-sans text-sm text-text-soft hover:border-forest hover:text-forest transition-colors"
        >
          ← Back
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        className="flex-1 bg-gold py-3 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors flex items-center justify-center gap-2"
      >
        {nextLabel}
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-soft w-28 shrink-0">
        {label}
      </span>
      <span className="font-sans text-[13px] text-text flex-1">{value}</span>
      <button
        onClick={onEdit}
        className="font-sans text-[11px] text-forest hover:text-gold-deep transition-colors shrink-0"
      >
        Edit
      </button>
    </div>
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
      <label className="block font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft">
        {label}
        {required && <span className="text-gold ml-1">*</span>}
        {hint && (
          <span className="ml-2 normal-case tracking-normal text-text-soft/60 font-sans text-[11px]">
            {hint}
          </span>
        )}
      </label>
      {children}
      {error && <p className="font-sans text-[12px] text-rose-600">{error}</p>}
    </div>
  );
}
