import { redirect } from "next/navigation";
import { createClient } from "./server";

export type Profile = {
  full_name: string | null;
  role: "member" | "admin";
  status: "pending" | "approved" | "rejected" | "suspended";
};

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
    .select("full_name, role, status")
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
