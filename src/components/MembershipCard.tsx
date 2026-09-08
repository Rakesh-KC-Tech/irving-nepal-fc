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
    <div className="overflow-hidden rounded-xl border border-line bg-gradient-to-br from-navy-3 to-navy-2 p-5 text-white shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-oswald text-xs uppercase tracking-wider text-mist">
            Irving Nepal FC
          </p>
          <p className="font-oswald text-xs uppercase tracking-wider text-crimson-2">
            Member
          </p>
        </div>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs uppercase">
          {profile.status}
        </span>
      </div>

      <p className="mt-6 font-teko text-2xl font-semibold tracking-wide">
        {profile.full_name ?? email}
      </p>

      <div className="mt-4 flex items-end justify-between text-xs text-mist">
        <div>
          <p className="text-mist-dim">Member No.</p>
          <p className="font-mono text-sm text-gold">
            {profile.member_number ?? "—"}
          </p>
        </div>
        <p>Member since {memberSince}</p>
      </div>
    </div>
  );
}
