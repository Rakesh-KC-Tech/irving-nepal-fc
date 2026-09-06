"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";

export async function setMemberStatus(
  memberId: string,
  status: "approved" | "rejected" | "suspended",
) {
  const { supabase } = await requireAdmin();

  await supabase.from("profiles").update({ status }).eq("id", memberId);

  revalidatePath("/admin");
}

export async function setMembershipExpiration(
  memberId: string,
  formData: FormData,
) {
  const { supabase } = await requireAdmin();

  const expiresAt = formData.get("expiresAt") as string;

  await supabase
    .from("profiles")
    .update({ membership_expires_at: expiresAt || null })
    .eq("id", memberId);

  revalidatePath("/admin");
}
