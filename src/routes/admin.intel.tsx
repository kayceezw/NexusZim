import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/require-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Calendar, MapPin, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/admin/intel")({
  head: () => ({ meta: [{ title: "Admin Intel — NexusZim" }] }),
  component: () => (
    <RequireAuth roles={["admin", "super_admin"]}>
      <AdminIntelPage />
    </RequireAuth>
  ),
});

type Tab = "events" | "venues" | "rates";

function AdminIntelPage() {
  const [tab, setTab] = useState<Tab>("events");

  return (
    <div className="container-page pt-40 pb-20">
      <div className="border-b border-gold/20 pb-10">
        <div className="flex items-center gap-4">
          <span className="h-px w-8 bg-gold/40" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
            Admin · Intel Hub
          </span>
        </div>
        <h1 className="mt-4 font-display text-5xl font-bold text-foreground">
          Manage <span className="italic text-gold">Intelligence.</span>
        </h1>
        <p className="mt-4 font-body text-sm text-foreground/50">
          Add, edit, and remove content that appears in the public Intel Hub.
        </p>
      </div>

      <div className="mt-10 flex gap-8 border-b border-foreground/5 pb-6">
        {(["events", "venues", "rates"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest transition-colors ${
              tab === t ? "text-gold" : "text-foreground/40 hover:text-foreground"
            }`}
          >
            {t === "events" && <Calendar className="h-3.5 w-3.5" />}
            {t === "venues" && <MapPin className="h-3.5 w-3.5" />}
            {t === "rates" && <BarChart3 className="h-3.5 w-3.5" />}
            {t === "events" ? "Events Radar" : t === "venues" ? "Venue Board" : "Market Rates"}
          </button>
        ))}
      </div>

      <div className="py-12">
        {tab === "events" && <EventsTab />}
        {tab === "venues" && <VenuesTab />}
        {tab === "rates" && <RatesTab />}
      </div>
    </div>
  );
}

/* ─── EVENTS TAB ─── */

type EventForm = {
  title: string; date: string; venue: string; city: string;
  genre: string; estimated_attendance: string; ticket_price_range: string; source: string;
};
const EMPTY_EVENT: EventForm = { title: "", date: "", venue: "", city: "", genre: "", estimated_attendance: "", ticket_price_range: "", source: "" };

function EventsTab() {
  const qc = useQueryClient();
  const [form, setForm] = useState<EventForm>(EMPTY_EVENT);
  const [open, setOpen] = useState(false);

  const { data: events } = useQuery({
    queryKey: ["admin", "intel", "events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events_radar").select("*").order("date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async (f: EventForm) => {
      const { error } = await supabase.from("events_radar").insert([f]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Event added to radar");
      setForm(EMPTY_EVENT);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", "intel", "events"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events_radar").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Event removed");
      qc.invalidateQueries({ queryKey: ["admin", "intel", "events"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-foreground uppercase tracking-widest">
          Events Radar ({events?.length ?? 0})
        </h2>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 bg-gold px-6 py-3 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Event
        </button>
      </div>

      {open && (
        <div className="border border-gold/30 bg-card p-8 space-y-6">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gold">New Event</p>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title *" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
            <Field label="Date *" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
            <Field label="Venue" value={form.venue} onChange={(v) => setForm({ ...form, venue: v })} />
            <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <Field label="Genre" value={form.genre} onChange={(v) => setForm({ ...form, genre: v })} />
            <Field label="Est. Attendance" value={form.estimated_attendance} onChange={(v) => setForm({ ...form, estimated_attendance: v })} />
            <Field label="Ticket Price Range" value={form.ticket_price_range} onChange={(v) => setForm({ ...form, ticket_price_range: v })} />
            <Field label="Source" value={form.source} onChange={(v) => setForm({ ...form, source: v })} />
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => add.mutate(form)}
              disabled={!form.title || !form.date || add.isPending}
              className="bg-gold px-8 py-3 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors disabled:opacity-50"
            >
              {add.isPending ? "Saving…" : "Save Event"}
            </button>
            <button onClick={() => setOpen(false)} className="px-6 py-3 font-mono text-xs text-foreground/40 hover:text-foreground transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {(events ?? []).length === 0 && <p className="font-body text-sm text-foreground/30 italic">No events yet. Add one above.</p>}
        {(events ?? []).map((e) => (
          <div key={e.id} className="flex items-start justify-between border border-gold/10 bg-card p-6">
            <div className="space-y-1">
              <p className="font-mono text-[10px] text-gold uppercase tracking-widest">{e.genre ?? "—"} · {e.city ?? "—"}</p>
              <p className="font-display text-xl font-bold text-foreground">{e.title}</p>
              <p className="font-mono text-[10px] text-foreground/40">{e.date} · {e.venue ?? "—"} · {e.estimated_attendance ?? "?"} attendees · {e.ticket_price_range ?? "—"}</p>
            </div>
            <button
              onClick={() => del.mutate(e.id)}
              className="ml-6 shrink-0 text-foreground/20 hover:text-rose-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── VENUES TAB ─── */

type VenueForm = {
  venue_name: string; city: string; available_from: string;
  available_to: string; capacity: string; contact: string;
};
const EMPTY_VENUE: VenueForm = { venue_name: "", city: "", available_from: "", available_to: "", capacity: "", contact: "" };

function VenuesTab() {
  const qc = useQueryClient();
  const [form, setForm] = useState<VenueForm>(EMPTY_VENUE);
  const [open, setOpen] = useState(false);

  const { data: venues } = useQuery({
    queryKey: ["admin", "intel", "venues"],
    queryFn: async () => {
      const { data, error } = await supabase.from("venue_availability").select("*").order("venue_name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async (f: VenueForm) => {
      const { error } = await supabase.from("venue_availability").insert([{
        ...f,
        capacity: f.capacity ? parseInt(f.capacity, 10) : null,
        available_from: f.available_from || null,
        available_to: f.available_to || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Venue added to board");
      setForm(EMPTY_VENUE);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", "intel", "venues"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("venue_availability").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Venue removed");
      qc.invalidateQueries({ queryKey: ["admin", "intel", "venues"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-foreground uppercase tracking-widest">
          Venue Board ({venues?.length ?? 0})
        </h2>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 bg-gold px-6 py-3 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Venue
        </button>
      </div>

      {open && (
        <div className="border border-gold/30 bg-card p-8 space-y-6">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gold">New Venue</p>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Venue Name *" value={form.venue_name} onChange={(v) => setForm({ ...form, venue_name: v })} />
            <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <Field label="Available From" type="date" value={form.available_from} onChange={(v) => setForm({ ...form, available_from: v })} />
            <Field label="Available To" type="date" value={form.available_to} onChange={(v) => setForm({ ...form, available_to: v })} />
            <Field label="Capacity" type="number" value={form.capacity} onChange={(v) => setForm({ ...form, capacity: v })} />
            <Field label="Contact" value={form.contact} onChange={(v) => setForm({ ...form, contact: v })} />
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => add.mutate(form)}
              disabled={!form.venue_name || add.isPending}
              className="bg-gold px-8 py-3 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors disabled:opacity-50"
            >
              {add.isPending ? "Saving…" : "Save Venue"}
            </button>
            <button onClick={() => setOpen(false)} className="px-6 py-3 font-mono text-xs text-foreground/40 hover:text-foreground transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {(venues ?? []).length === 0 && <p className="font-body text-sm text-foreground/30 italic">No venues yet. Add one above.</p>}
        {(venues ?? []).map((v) => (
          <div key={v.id} className="flex items-start justify-between border border-gold/10 bg-card p-6">
            <div className="space-y-1">
              <p className="font-mono text-[10px] text-gold uppercase tracking-widest">{v.city ?? "—"}</p>
              <p className="font-display text-xl font-bold text-foreground">{v.venue_name}</p>
              <p className="font-mono text-[10px] text-foreground/40">
                Capacity: {v.capacity ?? "?"} ·{" "}
                {v.available_from && v.available_to
                  ? `${v.available_from} → ${v.available_to}`
                  : v.available_from || "Available now"}{" "}
                · {v.contact ?? "—"}
              </p>
            </div>
            <button
              onClick={() => del.mutate(v.id)}
              className="ml-6 shrink-0 text-foreground/20 hover:text-rose-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── RATES TAB ─── */

type RateForm = {
  category: string; rate_low: string; rate_high: string; unit: string; notes: string;
};
const EMPTY_RATE: RateForm = { category: "", rate_low: "", rate_high: "", unit: "", notes: "" };

function RatesTab() {
  const qc = useQueryClient();
  const [form, setForm] = useState<RateForm>(EMPTY_RATE);
  const [open, setOpen] = useState(false);

  const { data: rates } = useQuery({
    queryKey: ["admin", "intel", "rates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("market_rate_index").select("*").order("category");
      if (error) throw error;
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async (f: RateForm) => {
      const { error } = await supabase.from("market_rate_index").insert([{
        category: f.category,
        rate_low: f.rate_low ? parseFloat(f.rate_low) : null,
        rate_high: f.rate_high ? parseFloat(f.rate_high) : null,
        unit: f.unit || null,
        notes: f.notes || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rate added to index");
      setForm(EMPTY_RATE);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", "intel", "rates"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("market_rate_index").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rate removed");
      qc.invalidateQueries({ queryKey: ["admin", "intel", "rates"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-foreground uppercase tracking-widest">
          Market Rate Index ({rates?.length ?? 0})
        </h2>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 bg-gold px-6 py-3 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Rate
        </button>
      </div>

      {open && (
        <div className="border border-gold/30 bg-card p-8 space-y-6">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gold">New Rate Entry</p>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Category *" value={form.category} onChange={(v) => setForm({ ...form, category: v })} placeholder="e.g. DJ Services (Standard)" />
            <Field label="Unit" value={form.unit} onChange={(v) => setForm({ ...form, unit: v })} placeholder="e.g. per event" />
            <Field label="Rate Low (USD)" type="number" value={form.rate_low} onChange={(v) => setForm({ ...form, rate_low: v })} />
            <Field label="Rate High (USD)" type="number" value={form.rate_high} onChange={(v) => setForm({ ...form, rate_high: v })} />
          </div>
          <Field label="Notes (optional)" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
          <div className="flex gap-4">
            <button
              onClick={() => add.mutate(form)}
              disabled={!form.category || add.isPending}
              className="bg-gold px-8 py-3 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors disabled:opacity-50"
            >
              {add.isPending ? "Saving…" : "Save Rate"}
            </button>
            <button onClick={() => setOpen(false)} className="px-6 py-3 font-mono text-xs text-foreground/40 hover:text-foreground transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {(rates ?? []).length === 0 && <p className="font-body text-sm text-foreground/30 italic">No rates yet. Add one above.</p>}
        {(rates ?? []).map((r) => (
          <div key={r.id} className="flex items-start justify-between border border-gold/10 bg-card p-6">
            <div className="space-y-1">
              <p className="font-display text-xl font-bold text-foreground">{r.category}</p>
              <p className="font-mono text-[10px] text-foreground/40">
                ${r.rate_low ?? "?"} – ${r.rate_high ?? "?"} · {r.unit ?? "—"}
                {r.notes && ` · ${r.notes}`}
              </p>
              <p className="font-mono text-[9px] text-foreground/20">Updated: {new Date(r.updated_at).toLocaleDateString()}</p>
            </div>
            <button
              onClick={() => del.mutate(r.id)}
              className="ml-6 shrink-0 text-foreground/20 hover:text-rose-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SHARED ─── */

function Field({
  label, value, onChange, type = "text", placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block font-mono text-[9px] font-bold uppercase tracking-widest text-foreground/40 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-background border border-gold/20 p-3 font-body text-sm text-foreground outline-none focus:border-gold placeholder:text-foreground/20"
      />
    </div>
  );
}
