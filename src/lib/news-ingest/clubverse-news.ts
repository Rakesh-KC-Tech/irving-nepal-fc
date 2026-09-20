import type { ClubverseGame } from "@/lib/clubverse";

export type ClubverseArticleDraft = {
  headline: string;
  category: string;
  excerpt: string;
  body: string;
  tags: string[];
  sourceUrl: string;
};

const CLUB_NAME = "Irving Nepal FC";

function isClub(name: string) {
  return name.trim().toLowerCase() === CLUB_NAME.toLowerCase();
}

function formatMatchDate(ms: number) {
  return new Date(ms).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function slugifyForUrl(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Only ever called for completed, scored tournament matches — every fact
// used here comes straight from ClubVerse's own data, nothing inferred.
export function buildMatchReport(game: ClubverseGame, publicSlug: string | null): ClubverseArticleDraft | null {
  if (game.source !== "tournament") return null;
  if (game.status !== "completed") return null;
  if (game.home.score == null || game.away.score == null) return null;

  const clubIsHome = isClub(game.home.name);
  const clubIsAway = isClub(game.away.name);
  if (!clubIsHome && !clubIsAway) return null;

  const opponent = clubIsHome ? game.away.name : game.home.name;
  const clubScore = clubIsHome ? game.home.score : game.away.score;
  const oppScore = clubIsHome ? game.away.score : game.home.score;

  const resultWord = game.result === "W" ? "beat" : game.result === "L" ? "lost to" : "drew with";
  const headline = `${CLUB_NAME} ${resultWord} ${opponent} ${clubScore}-${oppScore} in ${game.competition}`;

  const phaseText = game.phase ? ` (${game.phase.replace(/_/g, " ").toLowerCase()})` : "";
  const venueText = game.venue ? ` at ${game.venue}` : "";

  const excerpt = `${CLUB_NAME} ${resultWord} ${opponent} ${clubScore}-${oppScore} in ${game.competition}${phaseText} on ${formatMatchDate(game.date)}.`;

  const bodyLines = [
    `${CLUB_NAME} ${resultWord} ${opponent} by a score of ${clubScore}-${oppScore} in ${game.competition}${phaseText}, played on ${formatMatchDate(game.date)}${venueText}.`,
  ];
  bodyLines.push(
    game.result === "W"
      ? "The result adds another win to the club's tournament record."
      : game.result === "L"
        ? "The club will look to bounce back in its next fixture."
        : "The point keeps the club in the mix in the competition.",
  );

  const sourceUrl = publicSlug
    ? `https://clubverseapp.com/t/${publicSlug}`
    : `https://clubverseapp.com/t/${slugifyForUrl(game.competition)}`;

  return {
    headline,
    category: "Match Updates",
    excerpt,
    body: bodyLines.join("\n\n"),
    tags: ["match-report", slugifyForUrl(game.competition), game.result === "W" ? "win" : game.result === "L" ? "loss" : "draw"],
    sourceUrl,
  };
}
