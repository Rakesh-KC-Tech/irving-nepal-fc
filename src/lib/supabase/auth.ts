import { redirect } from "next/navigation";
import { createClient } from "./server";

export type Profile = {
  full_name: string | null;
  role: "member" | "admin";
  status: "pending" | "approved" | "rejected" | "suspended";
  phone: string | null;
  date_of_birth: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  member_number: string | null;
  created_at: string;
};

const PROFILE_COLUMNS =
  "full_name, role, status, phone, date_of_birth, emergency_contact_name, emergency_contact_phone, member_number, created_at";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .single<Profile>();

  return { supabase, user, profile };
}

export async function requireAdmin() {
  const { supabase, user, profile } = await requireUser();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return { supabase, user, profile };
}
