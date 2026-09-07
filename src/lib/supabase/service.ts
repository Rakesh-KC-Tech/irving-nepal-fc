import { createClient } from "@supabase/supabase-js";

// Server-only, bypasses RLS. Only use this for contexts with no logged-in
// user to authenticate as (e.g. the Stripe webhook) — never expose it to
// the browser and never use it in place of the normal request-scoped
// client just to skip writing an RLS policy.
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
