import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Layers,
  ExternalLink,
  Phone,
  Globe,
  MapPin,
  RefreshCw,
  Filter,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
} from "lucide-react";

export const Route = createFileRoute("/admin/scraper")({
  head: () => ({ meta: [{ title: "Scraper Queue — NexusZim Admin" }] }),
  component: () => (
    <RequireAuth roles={["admin", "super_admin"]}>
      <ScraperQueuePage />
    </RequireAuth>
  ),
});

type QueueStatus = "pending" | "approved" | "rejected" | "duplicate";

type SocialData = {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  tiktok?: string;
  youtube?: string;
};

type QueueItem = {
  id: string;
  business_name: string;
  category_guess: string | null;
  city: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  description: string | null;
  source_url: string;
  source_name: string;
  status: QueueStatus;
  scraped_at: string;
  raw_data: { social?: SocialData; is_social_lead?: boolean; label?: string; address?: string } | null;
};

const STATUS_TABS: { id: QueueStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "duplicate", label: "Duplicates" },
];

const CATEGORY_LABELS: Record<string, string> = {
  "events-production": "Events & Production",
  "transport-logistics": "Transport & Logistics",
  "property-services": "Property & Lodges",
  "visa-immigration": "Legal & Registration",
  "food-catering": "Food & Catering",
  "business-professional": "Business Professional",
  "beauty-grooming-wellness": "Beauty & Wellness",
  "health-medical": "Health & Medical",
  "education-tutoring": "Education",
  "repairs-home-services": "Repairs & Home Services",
};

function ScraperQueuePage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<QueueStatus | "all">("pending");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: items, isLoading, refetch } = useQuery({
    queryKey: ["scraper-queue", statusFilter, categoryFilter],
    queryFn: async () => {
      let q = supabase
        .from("scraper_queue")
        .select("*")
        .order("scraped_at", { ascending: false })
        .limit(200);

      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      if (categoryFilter !== "all") q = q.eq("category_guess", categoryFilter);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as QueueItem[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["scraper-stats"],
    queryFn: async () => {
      const [pending, approved, rejected, total] = await Promise.all([
        supabase.from("scraper_queue").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("scraper_queue").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("scraper_queue").select("*", { count: "exact", head: true }).eq("status", "rejected"),
        supabase.from("scraper_queue").select("*", { count: "exact", head: true }),
      ]);
      return {
        pending: pending.count ?? 0,
        approved: approved.count ?? 0,
        rejected: rejected.count ?? 0,
        total: total.count ?? 0,
      };
    },
    refetchInterval: 30_000,
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: QueueStatus }) => {
      const { error } = await supabase
        .from("scraper_queue")
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scraper-queue"] });
      qc.invalidateQueries({ queryKey: ["scraper-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Approve: update status AND create a bare provider profile for follow-up
  const approve = useMutation({
    mutationFn: async (item: QueueItem) => {
      // 1. Mark as approved
      const { error: qErr } = await supabase
        .from("scraper_queue")
        .update({ status: "approved", reviewed_at: new Date().toISOString() })
        .eq("id", item.id);
      if (qErr) throw qErr;

      // 2. Look up category id
      const { data: catRow } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", item.category_guess ?? "business-professional")
        .maybeSingle();

      // 3. Insert into provider_profiles as unverified tier-1 lead
      if (catRow?.id) {
        const { error: pErr } = await supabase.from("provider_profiles").upsert(
          {
            business_name: item.business_name,
            city: item.city,
            phone: item.phone,
            website: item.website,
            bio: item.description,
            category_id: catRow.id,
            tier: 1,
            verified: false,
          },
          { onConflict: "user_id", ignoreDuplicates: true },
        );
        if (pErr && pErr.code !== "23505") {
          console.warn("Provider insert warning:", pErr.message);
        }
      }
    },
    onSuccess: (_, item) => {
      toast.success(`${item.business_name} approved and added to registry`);
      qc.invalidateQueries({ queryKey: ["scraper-queue"] });
      qc.invalidateQueries({ queryKey: ["scraper-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const pendingCount = stats?.pending ?? 0;

  return (
    <div className="bg-cream pt-16 min-h-screen animate-page-enter">
      {/* Header */}
      <div className="bg-forest border-b border-cream/10">
        <div className="container-page py-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-cream/40 mb-3">
                <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
                Admin · Intelligence
              </p>
              <h1 className="font-display text-3xl text-cream">
                Scraper <em className="italic text-gold">Queue.</em>
              </h1>
              <p className="mt-2 font-sans text-[13px] text-cream/50 max-w-md">
                Daily-scraped Zimbabwe service providers awaiting your review. Approve to add to the
                registry, reject to discard.
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 border border-cream/20 px-4 py-2.5 rounded-[3px] font-mono text-[10px] uppercase tracking-widest text-cream/70 hover:border-cream/50 hover:text-cream transition-colors mt-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>

          {/* Back link */}
          <div className="mt-5">
            <Link
              to="/admin"
              className="font-mono text-[10px] uppercase tracking-widest text-cream/40 hover:text-cream transition-colors"
            >
              ← Admin overview
            </Link>
          </div>
        </div>
      </div>

      <div className="container-page py-8 space-y-8">
        {/* Stats strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total scraped", value: stats?.total ?? "—" },
            { label: "Pending review", value: pendingCount, highlight: pendingCount > 0 },
            { label: "Approved", value: stats?.approved ?? "—" },
            { label: "Rejected", value: stats?.rejected ?? "—" },
          ].map((s) => (
            <div
              key={s.label}
              className={`bg-cream-raised border rounded-[6px] p-5 ${
                s.highlight ? "border-amber-300 bg-amber-50/40" : "border-hairline"
              }`}
            >
              <p className={`font-display text-4xl ${s.highlight ? "text-amber-500" : "text-gold"}`}>
                {s.value}
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-text-soft">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex gap-0 border-b border-hairline overflow-x-auto no-scrollbar">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${
                  statusFilter === tab.id
                    ? "border-forest text-forest"
                    : "border-transparent text-text-soft hover:text-text"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Filter className="h-3.5 w-3.5 text-text-soft" strokeWidth={1.5} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="font-mono text-[10px] uppercase tracking-widest text-text-soft border border-hairline rounded-[3px] bg-cream px-3 py-2 focus:outline-none focus:border-forest"
            >
              <option value="all">All categories</option>
              {Object.entries(CATEGORY_LABELS).map(([slug, label]) => (
                <option key={slug} value={slug}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Queue list */}
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="border border-hairline rounded-[6px] p-5 bg-cream-raised animate-pulse h-24" />
            ))}
          </div>
        ) : !items?.length ? (
          <div className="border border-dashed border-hairline rounded-[6px] p-14 text-center bg-cream-raised">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-3" strokeWidth={1.5} />
            <p className="font-display text-xl text-text">Queue empty</p>
            <p className="mt-1 font-sans text-sm text-text-soft">
              No {statusFilter !== "all" ? statusFilter : ""} items.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <QueueCard
                key={item.id}
                item={item}
                onApprove={() => approve.mutate(item)}
                onReject={() => setStatus.mutate({ id: item.id, status: "rejected" })}
                onDuplicate={() => setStatus.mutate({ id: item.id, status: "duplicate" })}
                isPending={approve.isPending || setStatus.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SocialLinks({ rawData }: { rawData: QueueItem["raw_data"] }) {
  const social = rawData?.social;
  if (!social || !Object.keys(social).length) return null;

  const PLATFORMS = [
    { key: "facebook",  Icon: Facebook,  color: "text-blue-600",  label: "Facebook" },
    { key: "instagram", Icon: Instagram, color: "text-pink-500",  label: "Instagram" },
    { key: "twitter",   Icon: Twitter,   color: "text-sky-500",   label: "Twitter/X" },
    { key: "linkedin",  Icon: Linkedin,  color: "text-blue-700",  label: "LinkedIn" },
    { key: "youtube",   Icon: Youtube,   color: "text-red-500",   label: "YouTube" },
  ] as const;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {PLATFORMS.map(({ key, Icon, color, label }) => {
        const url = social[key as keyof SocialData];
        if (!url) return null;
        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title={label}
            className={`flex items-center gap-1 ${color} opacity-70 hover:opacity-100 transition-opacity`}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span className="font-mono text-[9px] uppercase tracking-widest">{label}</span>
          </a>
        );
      })}
    </div>
  );
}

function QueueCard({
  item,
  onApprove,
  onReject,
  onDuplicate,
  isPending,
}: {
  item: QueueItem;
  onApprove: () => void;
  onReject: () => void;
  onDuplicate: () => void;
  isPending: boolean;
}) {
  const statusColors: Record<QueueStatus, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-100 text-rose-600 border-rose-200",
    duplicate: "bg-slate-100 text-slate-500 border-slate-200",
  };

  return (
    <div
      className={`flex flex-col gap-4 border rounded-[6px] p-5 md:flex-row md:items-start md:justify-between transition-colors ${
        item.status === "pending"
          ? "border-amber-200 bg-amber-50/20 hover:border-amber-300"
          : "border-hairline bg-cream-raised"
      }`}
    >
      {/* Info */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-display text-lg text-text">{item.business_name}</p>
          <span
            className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 border rounded-[3px] ${statusColors[item.status]}`}
          >
            {item.status}
          </span>
          {item.category_guess && (
            <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 border border-hairline text-text-soft rounded-[3px]">
              {CATEGORY_LABELS[item.category_guess] ?? item.category_guess}
            </span>
          )}
        </div>

        {item.description && (
          <p className="font-sans text-[13px] text-text-soft leading-relaxed line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-[12px] text-text-soft">
          {item.city && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" strokeWidth={1.5} />
              {item.city}
            </span>
          )}
          {item.phone && (
            <a
              href={`tel:${item.phone}`}
              className="flex items-center gap-1 hover:text-forest transition-colors"
            >
              <Phone className="h-3 w-3" strokeWidth={1.5} />
              {item.phone}
            </a>
          )}
          {item.website && (
            <a
              href={item.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-forest transition-colors"
            >
              <Globe className="h-3 w-3" strokeWidth={1.5} />
              {item.website.replace(/^https?:\/\//, "").slice(0, 30)}
            </a>
          )}
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-text-soft/50 hover:text-forest transition-colors"
          >
            <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
            {item.source_name}
          </a>
        </div>

        {/* Social links */}
        <SocialLinks rawData={item.raw_data} />

        <p className="font-mono text-[9px] text-text-soft/40 uppercase tracking-widest">
          Scraped{" "}
          {new Date(item.scraped_at).toLocaleDateString("en-ZW", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Actions — only for pending */}
      {item.status === "pending" && (
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={onApprove}
            disabled={isPending}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-[3px] font-mono text-[9px] uppercase tracking-widest transition-colors disabled:opacity-60"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approve
          </button>
          <button
            onClick={onDuplicate}
            disabled={isPending}
            className="flex items-center gap-1.5 border border-slate-300 text-slate-500 hover:bg-slate-50 px-4 py-2 rounded-[3px] font-mono text-[9px] uppercase tracking-widest transition-colors disabled:opacity-60"
          >
            <Layers className="h-3.5 w-3.5" />
            Duplicate
          </button>
          <button
            onClick={onReject}
            disabled={isPending}
            className="flex items-center gap-1.5 border border-rose-300 text-rose-500 hover:bg-rose-50 px-4 py-2 rounded-[3px] font-mono text-[9px] uppercase tracking-widest transition-colors disabled:opacity-60"
          >
            <XCircle className="h-3.5 w-3.5" />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
