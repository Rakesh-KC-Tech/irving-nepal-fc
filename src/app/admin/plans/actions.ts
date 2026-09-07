"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";

export async function createPlan(formData: FormData) {
  const { supabase } = await requireAdmin();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const priceDollars = formData.get("price") as string;

  await supabase.from("membership_plans").insert({
    name,
    description: description || null,
    price_cents: Math.round(Number(priceDollars) * 100),
  });

  revalidatePath("/admin/plans");
  revalidatePath("/membership");
}

export async function setPlanActive(planId: string, active: boolean) {
  const { supabase } = await requireAdmin();

  await supabase
    .from("membership_plans")
    .update({ active })
    .eq("id", planId);

  revalidatePath("/admin/plans");
  revalidatePath("/membership");
}
