"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { logAudit } from "@/lib/supabase/audit";
import { createServiceClient } from "@/lib/supabase/service";

export async function setRegistrationStatus(registrationId: string, status: string) {
  const { supabase, user } = await requireAdmin();

  await supabase.from("registrations").update({ status }).eq("id", registrationId);
  await logAudit(supabase, user.id, "registration_status_changed", "registration", registrationId, { status });

  revalidatePath("/admin/registrations");
}

// Creates the applicant's actual portal account (an invite email they use to
// set a password) and links it back to their registration. Uses the service
// client only for auth.admin.inviteUserByEmail, which needs the service role
// — everything else goes through the normal admin-scoped client.
export async function convertRegistrationToAccount(registrationId: string) {
  const { supabase, user } = await requireAdmin();

  const { data: registration } = await supabase
    .from("registrations")
    .select("first_name, last_name, email, phone, date_of_birth")
    .eq("id", registrationId)
    .single();

  if (!registration) return;

  const serviceClient = createServiceClient();
  const { data: invited, error } = await serviceClient.auth.admin.inviteUserByEmail(
    registration.email,
    { data: { full_name: `${registration.first_name} ${registration.last_name}` } },
  );

  if (error || !invited.user) {
    await logAudit(supabase, user.id, "registration_conversion_failed", "registration", registrationId, {
      email: registration.email,
      error: error?.message ?? "unknown error",
    });
    revalidatePath("/admin/registrations");
    return;
  }

  await serviceClient
    .from("profiles")
    .update({ phone: registration.phone, date_of_birth: registration.date_of_birth })
    .eq("id", invited.user.id);

  await supabase
    .from("registrations")
    .update({ status: "converted", linked_profile_id: invited.user.id })
    .eq("id", registrationId);

  await logAudit(supabase, user.id, "registration_converted_to_account", "registration", registrationId, {
    email: registration.email,
    profileId: invited.user.id,
  });

  revalidatePath("/admin/registrations");
}
