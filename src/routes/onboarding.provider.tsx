import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { RequireAuth } from "@/components/require-auth";

export const Route = createFileRoute("/onboarding/provider")({
  head: () => ({ meta: [{ title: "Provider onboarding — NexusZim" }] }),
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
    <div className="container-page grid min-h-[80vh] place-items-center py-12">
      <form onSubmit={onSubmit} className="w-full max-w-xl rounded-2xl border border-border bg-card p-8">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-gold">
          Become a NexusZim provider
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold">Set up your business profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You'll be visible to clients once verified by our team.
        </p>

        {error && (
          <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Business name</span>
            <input required value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Category</span>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input" required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">City</span>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="input">
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Phone</span>
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+263..." className="input" />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">WhatsApp number (optional)</span>
            <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Leave blank to use phone number" className="input" />
            <span className="mt-1 block text-xs text-muted-foreground">Clients will tap a WhatsApp button to message you directly.</span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Website (optional)</span>
            <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" className="input" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Short bio</span>
            <textarea required rows={4} value={bio} onChange={(e) => setBio(e.target.value)} className="input" placeholder="Years of experience, services offered, what makes you stand out." />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 block w-full rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground hover:bg-accent disabled:opacity-60"
        >
          {loading ? "Saving..." : "Submit for verification"}
        </button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          You'll get access to your provider dashboard right away. Listings go live after admin review.
        </p>
      </form>
      <style>{`
        .input { width: 100%; border-radius: 0.625rem; border: 1px solid var(--border); background: var(--background); padding: 0.65rem 0.85rem; font-size: 0.875rem; }
        .input:focus { border-color: var(--ring); outline: none; }
      `}</style>
    </div>
  );
}
