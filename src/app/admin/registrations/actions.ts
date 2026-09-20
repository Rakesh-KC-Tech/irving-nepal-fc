"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { logAudit } from "@/lib/supabase/audit";

export async function setRegistrationStatus(registrationId: string, status: string) {
  const { supabase, user } = await requireAdmin();

  await supabase.from("registrations").update({ status }).eq("id", registrationId);
  await logAudit(supabase, user.id, "registration_status_changed", "registration", registrationId, { status });

  revalidatePath("/admin/registrations");
}
