import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signout } from "../login/actions";

export default async function DashboardPage() {
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
    .single();

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <form>
          <button
            formAction={signout}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            Log out
          </button>
        </form>
      </div>

      <div className="rounded-md border border-gray-200 p-4 text-sm text-gray-700">
        <p>Email: {user.email}</p>
        <p>Role: {profile?.role ?? "member"}</p>
        <p>Status: {profile?.status ?? "pending"}</p>
      </div>
    </div>
  );
}
