"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { logAudit } from "@/lib/supabase/audit";

export async function createTeam(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  const { data: team } = await supabase
    .from("teams")
    .insert({ name, description: description || null })
    .select("id")
    .single();

  if (team) {
    await logAudit(supabase, user.id, "team_created", "team", team.id, {
      name,
    });
  }

  revalidatePath("/admin/teams");
}

export async function addPlayer(teamId: string, formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const profileId = formData.get("profileId") as string;
  const jerseyNumber = formData.get("jerseyNumber") as string;
  const position = formData.get("position") as string;

  await supabase.from("team_members").insert({
    team_id: teamId,
    profile_id: profileId,
    jersey_number: jerseyNumber ? Number(jerseyNumber) : null,
    position: position || null,
  });
  await logAudit(supabase, user.id, "player_added_to_team", "team", teamId, {
    profile_id: profileId,
  });

  revalidatePath(`/admin/teams/${teamId}`);
}

export async function removePlayer(teamId: string, profileId: string) {
  const { supabase, user } = await requireAdmin();

  await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("profile_id", profileId);
  await logAudit(
    supabase,
    user.id,
    "player_removed_from_team",
    "team",
    teamId,
    { profile_id: profileId },
  );

  revalidatePath(`/admin/teams/${teamId}`);
}
