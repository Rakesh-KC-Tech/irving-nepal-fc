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
