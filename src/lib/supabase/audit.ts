import type { SupabaseClient } from "@supabase/supabase-js";

export async function logAudit(
  supabase: SupabaseClient,
  actorId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  details?: Record<string, unknown>,
) {
  await supabase.from("audit_logs").insert({
    actor_id: actorId,
    action,
    target_type: targetType ?? null,
    target_id: targetId ?? null,
    details: details ?? null,
  });
}
