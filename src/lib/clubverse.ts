const BASE_URL = "https://clubverseapp.com/api/partner/v1";

// ClubVerse restricts this key to the irvingnepalfc.com origins. Server-to-
// server callers are expected to assert that origin explicitly (per
// ClubVerse's own docs) rather than rely on a browser sending it.
const ASSERTED_ORIGIN = "https://irvingnepalfc.com";

export class ClubverseError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function clubverseFetch<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const apiKey = process.env.CLUBVERSE_API_KEY;
  if (!apiKey) throw new ClubverseError("not-configured", "CLUBVERSE_API_KEY is not set", 500);

  const url = new URL(BASE_URL + path);
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v !== undefined) url.searchParams.set(k, String(v));
  }

  const res = await fetch(url, {
    headers: {
      "X-API-Key": apiKey,
      Origin: ASSERTED_ORIGIN,
    },
    next: { revalidate: 60 },
  });

  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new ClubverseError(body.error?.code ?? "internal", body.error?.message ?? "ClubVerse request failed", res.status);
  }
  return body.data as T;
}

export type ClubverseGameSide = { name: string; score: number | null };
export type ClubverseGame = {
  id: string;
  source: "event" | "tournament";
  tournamentId?: string;
  competition: string;
  phase: string | null;
  type: string;
  status: "scheduled" | "live" | "completed";
  date: number;
  venue: string | null;
  home: ClubverseGameSide;
  away: ClubverseGameSide;
  result: "W" | "D" | "L" | null;
  completedAt: number | null;
};

export function getGames(opts?: { recent?: number; upcoming?: number }) {
  return clubverseFetch<{ recent: ClubverseGame[]; upcoming: ClubverseGame[] }>("/games", opts);
}

export type ClubverseTournamentRow = {
  tournamentId: string;
  tournamentName: string;
  publicSlug: string | null;
  status: string | null;
  startDate: number;
  teamKey: string;
  teamName: string;
  categoryName: string;
  stage: string;
  multiTeam: boolean;
  champion: boolean;
  record: { played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number };
};

export function getTournaments() {
  return clubverseFetch<{
    career: {
      played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number;
      tournamentsPlayed: number; titles: number; history: ClubverseTournamentRow[];
    };
  }>("/tournaments");
}

export function getClub() {
  return clubverseFetch<{
    club: {
      id: string; name: string; shortName: string | null; city: string | null; description: string | null;
      crestUrl: string | null; memberCount: number; createdAt: number;
      membershipPlan: {
        feeAmount: number | null; studentFeeAmount: number | null; periodLabel: string | null;
        periodEndsAt: number | null; dueDate: string | null; benefits: string[];
      };
    };
  }>("/club");
}
