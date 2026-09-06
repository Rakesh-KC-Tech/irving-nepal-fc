import type { Profile } from "@/lib/supabase/auth";

export function MembershipCard({
  profile,
  email,
}: {
  profile: Profile;
  email: string;
}) {
  const memberSince = new Date(profile.created_at).getFullYear();

  return (
    <div className="overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-white/60">
            Irving Nepal FC
          </p>
          <p className="text-xs uppercase tracking-wider text-rose-400">
            Member
          </p>
        </div>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs uppercase">
          {profile.status}
        </span>
      </div>

      <p className="mt-6 text-xl font-semibold">
        {profile.full_name ?? email}
      </p>

      <div className="mt-4 flex items-end justify-between text-xs text-white/70">
        <div>
          <p className="text-white/50">Member No.</p>
          <p className="font-mono text-sm text-white">
            {profile.member_number ?? "—"}
          </p>
        </div>
        <p>Member since {memberSince}</p>
      </div>
    </div>
  );
}
