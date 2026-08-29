import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "./auth-middleware";

// Guards a server function so that only authenticated users holding an `admin`
// or `super_admin` role may invoke it. Chains on `requireSupabaseAuth` (which
// validates the bearer token and exposes `context.userId`), then verifies the
// caller's role against `user_roles` using the service-role client.
//
// Use on any server function that touches the service-role client
// (`supabaseAdmin`) - those calls bypass RLS and MUST NOT be reachable by an
// unauthenticated or non-admin caller.
export const requireAdmin = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const { supabaseAdmin } = await import("./client.server");

    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .in("role", ["admin", "super_admin"]);

    if (error) {
      throw new Error("Authorization check failed");
    }
    if (!data || data.length === 0) {
      throw new Error("Forbidden: admin role required");
    }

    return next({ context: { userId: context.userId } });
  });
