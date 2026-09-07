"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { logAudit } from "@/lib/supabase/audit";

export async function createPlan(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const priceDollars = formData.get("price") as string;
  const priceCents = Math.round(Number(priceDollars) * 100);

  const { data: plan } = await supabase
    .from("membership_plans")
    .insert({ name, description: description || null, price_cents: priceCents })
    .select("id")
    .single();

  if (plan) {
    await logAudit(supabase, user.id, "plan_created", "plan", plan.id, {
      name,
      price_cents: priceCents,
    });
  }

  revalidatePath("/admin/plans");
  revalidatePath("/membership");
}

export async function setPlanActive(planId: string, active: boolean) {
  const { supabase, user } = await requireAdmin();

  await supabase
    .from("membership_plans")
    .update({ active })
    .eq("id", planId);
  await logAudit(supabase, user.id, "plan_active_changed", "plan", planId, {
    active,
  });

  revalidatePath("/admin/plans");
  revalidatePath("/membership");
}
