"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { logAudit } from "@/lib/supabase/audit";

export async function setMemberStatus(
  memberId: string,
  status: "approved" | "rejected" | "suspended",
) {
  const { supabase, user } = await requireAdmin();

  await supabase.from("profiles").update({ status }).eq("id", memberId);
  await logAudit(supabase, user.id, "member_status_changed", "profile", memberId, {
    status,
  });

  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${memberId}`);
}

export async function setMembershipExpiration(
  memberId: string,
  formData: FormData,
) {
  const { supabase, user } = await requireAdmin();

  const expiresAt = formData.get("expiresAt") as string;

  await supabase
    .from("profiles")
    .update({ membership_expires_at: expiresAt || null })
    .eq("id", memberId);
  await logAudit(
    supabase,
    user.id,
    "membership_expiration_changed",
    "profile",
    memberId,
    { expires_at: expiresAt || null },
  );

  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${memberId}`);
}
