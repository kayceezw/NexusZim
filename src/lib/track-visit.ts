import { supabase } from "@/integrations/supabase/client";

// Anonymous, privacy-friendly visitor identity. `nx_vid` persists across
// sessions (unique visitor); `nx_sid` is per browser session. No PII.
function getId(store: Storage, key: string): string {
  try {
    let id = store.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      store.setItem(key, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

/**
 * Record a page visit. Fire-and-forget: analytics must NEVER break the app, so
 * every failure is swallowed. Client-only.
 */
export async function trackVisit(path: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await supabase.rpc("record_visit", {
      p_path: path,
      p_visitor_id: getId(localStorage, "nx_vid"),
      p_session_id: getId(sessionStorage, "nx_sid"),
      p_referrer: document.referrer || "",
      p_user_agent: navigator.userAgent || "",
    });
  } catch {
    /* ignore - never surface analytics errors to users */
  }
}
