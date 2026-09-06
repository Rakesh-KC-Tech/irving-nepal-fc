"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/auth";

export async function updateProfile(formData: FormData) {
  const { supabase, user } = await requireUser();

  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const dateOfBirth = formData.get("dateOfBirth") as string;
  const emergencyContactName = formData.get("emergencyContactName") as string;
  const emergencyContactPhone = formData.get(
    "emergencyContactPhone",
  ) as string;

  await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      phone: phone || null,
      date_of_birth: dateOfBirth || null,
      emergency_contact_name: emergencyContactName || null,
      emergency_contact_phone: emergencyContactPhone || null,
    })
    .eq("id", user.id);

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
