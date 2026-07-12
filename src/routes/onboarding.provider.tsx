import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { RequireAuth } from "@/components/require-auth";
import { PhotoUpload } from "@/components/registry/photo-upload";

export const Route = createFileRoute("/onboarding/provider")({
  head: () => ({ meta: [{ title: "Provider registration — NexusZim" }] }),
  component: () => (
    <RequireAuth roles={["service_provider"]} requireOnboarding={false}>
      <ProviderOnboarding />
    </RequireAuth>
  ),
});

const CITIES = ["Harare", "Bulawayo", "Mutare", "Gweru", "Masvingo", "Victoria Falls", "Other"];

type Category = { id: string; name: string };

function ProviderOnboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [city, setCity] = useState("Harare");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("categories")
      .select("id, name")
      .order("name")
      .then(({ data }) => {
        setCategories(data ?? []);
        if (data && data.length > 0) setCategoryId(data[0].id);
      });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);

    const { error: e1 } = await supabase.from("provider_profiles").upsert({
      user_id: user.id,
      business_name: businessName,
      category_id: categoryId || null,
      city,
      phone,
      whatsapp: whatsapp || phone,
      website: website || null,
      bio,
      photos,
      tier: 1,
    });
    if (e1) {
      setError(e1.message);
      setLoading(false);
      return;
    }
    const { error: e2 } = await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", user.id);
    if (e2) {
      setError(e2.message);
      setLoading(false);
      return;
    }
    await refreshProfile();
    navigate({ to: "/provider/dashboard" });
  }

  return (
    <div className="bg-cream pt-24 pb-20 min-h-screen">
      <div className="container-page max-w-2xl">
        {/* Page header */}
        <div className="mb-10">
          <p className="eyebrow text-text-soft mb-3">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            Provider registration
          </p>
          <h1 className="font-display text-4xl text-text" style={{ lineHeight: "1.1" }}>
            Join the register
          </h1>
          <p className="mt-3 font-sans text-base text-text-soft leading-relaxed">
            Complete your profile to appear in the NexusZim directory. You will be listed
            immediately at Tier 1 (Listed). Verification for Tier 2 and above is reviewed by our
            desk.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-0">
          {error && (
            <div className="mb-6 border border-rose-200 bg-rose-50 px-4 py-3 rounded-[3px] font-sans text-sm text-rose-600">
              {error}
            </div>
          )}

          {/* Business details section */}
          <div className="bg-cream-raised border border-hairline rounded-[6px] p-7 space-y-6">
            <p className="eyebrow text-text-soft">
              <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
              Business details
            </p>

            <Field label="Business name" required>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your registered business name"
                className="field-input"
              />
            </Field>

            <Field label="Primary service category" required>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="field-input"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid md:grid-cols-2 gap-6">
              <Field label="City" required>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="field-input"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Phone number" required>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+263..."
                  className="field-input"
                />
              </Field>
            </div>

            <Field label="WhatsApp number" hint="Leave blank to use phone number">
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+263..."
                className="field-input"
              />
            </Field>

            <Field label="Website or portfolio" hint="Optional">
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://"
                className="field-input"
              />
            </Field>

            <Field label="About your business" required>
              <textarea
                required
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your experience, specialties, and what makes your service stand out..."
                className="field-input resize-none"
              />
            </Field>
          </div>

          {/* Photos section */}
          {user && (
            <div className="mt-5 bg-cream-raised border border-hairline rounded-[6px] p-7">
              <div className="mb-5">
                <p className="eyebrow text-text-soft mb-2">
                  <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
                  Proof photos
                </p>
                <p className="font-sans text-[13px] text-text-soft leading-relaxed">
                  Add up to 5 photos of your premises, team, or past work. These appear on your
                  public profile. You can skip this step and add photos later from your dashboard.
                </p>
              </div>

              <PhotoUpload
                userId={user.id}
                photos={photos}
                maxPhotos={5}
                onChange={setPhotos}
                label="Profile photos"
              />
            </div>
          )}

          {/* Tier notice */}
          <div className="mt-5 bg-cream-raised border border-hairline rounded-[6px] px-6 py-5">
            <div className="flex gap-4">
              <span className="inline-block h-2.5 w-2.5 rotate-45 border border-hairline shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text">
                  Tier 1 — Listed
                </p>
                <p className="font-sans text-[12px] text-text-soft leading-relaxed">
                  Your profile enters the register immediately as Listed. To advance to Verified or
                  Trust Certified, the NexusZim desk will contact you with document requirements.
                  Verification is free.
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold py-4 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit application"}
            </button>
            <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft/50">
              You pay the provider directly. NexusZim never holds your money.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
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
    </div>
  );
}
