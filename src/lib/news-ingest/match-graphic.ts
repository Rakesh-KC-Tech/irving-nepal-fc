import sharp from "sharp";
import type { ClubverseGame } from "@/lib/clubverse";
import { createServiceClient } from "@/lib/supabase/service";

const CLUB_NAME = "Irving Nepal FC";
const OUR_CREST_URL = "https://portal.irvingnepalfc.com/crest.png";
const STORAGE_BUCKET = "news-media";

// ClubVerse's Partner API has no logo field for the opposing side, but the
// real logos do exist publicly on ClubVerse's own site (clubverseapp.com/t/
// {tournament}), hosted on their Firebase Storage. This is a manually-pulled
// snapshot of real opponents we've actually played, not a live feed — same
// table used on the marketing site's Fixtures page. Needs a manual refresh
// whenever a genuinely new opponent shows up (they get a monogram badge
// until then, never a fabricated logo).
const OPPONENT_LOGOS: Record<string, string> = {
  "back again fc": "https://firebasestorage.googleapis.com/v0/b/club-managment-system.firebasestorage.app/o/club_icons%2Ficon_1786422570205.jpg?alt=media&token=581975f2-b10e-4f42-b8a0-7e642fa65248",
  "blackthorn united": "https://firebasestorage.googleapis.com/v0/b/club-managment-system.firebasestorage.app/o/tournament_club_logos%2Fm6FbF0q8RkPbk5vHH5x8%2Flogo-1787963771722.jpg?alt=media&token=d424cdf8-5422-4166-8bd2-49cc735fd5ed",
  "d-town fc": "https://firebasestorage.googleapis.com/v0/b/club-managment-system.firebasestorage.app/o/clubs%2FgQlxn9woZTEH9Ek4hk29%2Fprofile%2Ficon.png?alt=media&token=df885f56-3535-4b60-aa49-75aa7c8dcd02",
  "dfw himalayas fc": "https://firebasestorage.googleapis.com/v0/b/club-managment-system.firebasestorage.app/o/clubs%2FVhSoE2CakUAfulGfSzWk%2Fprofile%2Ficon-1783518075852.jpg?alt=media&token=0d9f95ce-aef5-4b6d-a1ee-b5e1a181ed95",
  "erfc spot": "https://firebasestorage.googleapis.com/v0/b/club-managment-system.firebasestorage.app/o/clubs%2FigM8zt66U4eS67y7RJq5%2Fprofile%2Ficon.jpg?alt=media&token=12880755-8a51-4bb5-b86a-c6dcfa1c514b",
  "euless royal fc": "https://firebasestorage.googleapis.com/v0/b/club-managment-system.firebasestorage.app/o/clubs%2FigM8zt66U4eS67y7RJq5%2Fprofile%2Ficon.jpg?alt=media&token=12880755-8a51-4bb5-b86a-c6dcfa1c514b",
  "euless royal football club": "https://firebasestorage.googleapis.com/v0/b/club-managment-system.firebasestorage.app/o/clubs%2FigM8zt66U4eS67y7RJq5%2Fprofile%2Ficon.jpg?alt=media&token=12880755-8a51-4bb5-b86a-c6dcfa1c514b",
  "fortworth rising star fc": "https://firebasestorage.googleapis.com/v0/b/club-managment-system.firebasestorage.app/o/clubs%2FcgApPWuTR7c70iWfWyxs%2Fprofile%2Ficon-1783633999895.jpg?alt=media&token=454fe58e-af47-4c23-81e6-b178b4eb03a8",
  "goal buster fc": "https://firebasestorage.googleapis.com/v0/b/club-managment-system.firebasestorage.app/o/tournament_club_logos%2FjEg3scFVNPVFFvUXb5b0%2FGoal_Buster_FC-d565bc68-4632-4ef7-96bc-4bf98d85df89.jpg?alt=media&token=d2a21b96-da30-40b0-89e4-4d6fd926b809",
  "khukuri fc": "https://firebasestorage.googleapis.com/v0/b/club-managment-system.firebasestorage.app/o/tournament_club_logos%2F8aOlpvO6Pj72ModK8w5c%2Flogo-1788404791043.jpg?alt=media&token=0c99b6e5-4d32-4334-8ce4-02eea9bf670f",
  "machhapuchhre fc": "https://firebasestorage.googleapis.com/v0/b/club-managment-system.firebasestorage.app/o/clubs%2FQ1LgsdWfqK6BVcWjv0Ns%2Fprofile%2Ficon.jpg?alt=media&token=ae390258-7651-4349-89b6-71c4cec9a266",
  "parbat fc": "https://firebasestorage.googleapis.com/v0/b/club-managment-system.firebasestorage.app/o/clubs%2FulTplmAQ4Buzg70qIq7V%2Fprofile%2Ficon.jpg?alt=media&token=30787db8-93de-4b1e-a877-c44da0eb6cb3",
  "parvat fc": "https://firebasestorage.googleapis.com/v0/b/club-managment-system.firebasestorage.app/o/clubs%2FulTplmAQ4Buzg70qIq7V%2Fprofile%2Ficon.jpg?alt=media&token=30787db8-93de-4b1e-a877-c44da0eb6cb3",
  "peak fc": "https://firebasestorage.googleapis.com/v0/b/club-managment-system.firebasestorage.app/o/clubs%2F8KANSv3iy0DcBFm1EgTd%2Fprofile%2Ficon.png?alt=media&token=c48448cd-9586-4151-be26-240b1dd1a596",
};

const RESULT_COLORS: Record<string, string> = { W: "#2ecc71", D: "#93a0c9", L: "#ff2f52" };
const RESULT_LABELS: Record<string, string> = { W: "WIN", D: "DRAW", L: "LOSS" };

function initialsFor(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 3).map((w) => w[0]).join("").toUpperCase().slice(0, 3);
}

function escapeXml(s: string) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Always render the real name (wrapped across up to 2 lines) rather than an
// invented abbreviation — a made-up short form can land on something that
// isn't even the club's own real abbreviation.
function wrapLabel(name: string, maxCharsPerLine = 16) {
  const words = name.toUpperCase().split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if (current && (current + " " + w).length > maxCharsPerLine) {
      lines.push(current);
      current = w;
    } else {
      current = current ? current + " " + w : w;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 2);
}

function labelSvg(cx: number, name: string, centerY: number) {
  const lines = wrapLabel(name);
  const fontSize = lines.length > 1 ? 18 : 22;
  const lineHeight = fontSize + 6;
  const startY = lines.length > 1 ? centerY - lineHeight / 2 + fontSize / 2 : centerY;
  return lines
    .map(
      (line, i) =>
        `<text x="${cx}" y="${startY + i * lineHeight}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="#f6f7fb" text-anchor="middle">${escapeXml(line)}</text>`,
    )
    .join("\n  ");
}

async function imageToDataUri(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch failed ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || "image/jpeg";
  return `data:${contentType};base64,${buf.toString("base64")}`;
}

function crestCircleSvg({ cx, dataUri, initials, hasReal }: { cx: number; dataUri: string | null; initials: string; hasReal: boolean }) {
  const r = 95;
  if (hasReal) {
    return `
      <clipPath id="clip-${cx}"><circle cx="${cx}" cy="260" r="${r}"/></clipPath>
      <g>
        <circle cx="${cx}" cy="260" r="${r + 6}" fill="#101b3f"/>
        <image href="${dataUri}" x="${cx - r}" y="${260 - r}" width="${r * 2}" height="${r * 2}"
          clip-path="url(#clip-${cx})" preserveAspectRatio="xMidYMid slice"/>
        <circle cx="${cx}" cy="260" r="${r}" fill="none" stroke="#d8b46a" stroke-width="3"/>
      </g>`;
  }
  return `
    <g>
      <circle cx="${cx}" cy="260" r="${r}" fill="#0e1b40" stroke="#5c689a" stroke-width="3"/>
      <text x="${cx}" y="278" font-family="Arial, sans-serif" font-size="56" font-weight="700"
        fill="#d8b46a" text-anchor="middle">${escapeXml(initials)}</text>
    </g>`;
}

let ourCrestDataUriCache: string | null = null;
async function getOurCrestDataUri() {
  if (!ourCrestDataUriCache) ourCrestDataUriCache = await imageToDataUri(OUR_CREST_URL);
  return ourCrestDataUriCache;
}

// Builds a designed final-score graphic (real crests + real score, never a
// fabricated match photo) for a completed, scored game involving the club.
export async function generateMatchGraphic(game: ClubverseGame): Promise<Buffer> {
  const clubIsHome = game.home.name.trim().toLowerCase() === CLUB_NAME.toLowerCase();
  const opponent = clubIsHome ? game.away.name : game.home.name;
  const clubScore = clubIsHome ? game.home.score : game.away.score;
  const oppScore = clubIsHome ? game.away.score : game.home.score;
  const result = game.result ?? "D";

  const oppKey = opponent.toLowerCase().trim();
  const oppLogoUrl = OPPONENT_LOGOS[oppKey];
  let oppDataUri: string | null = null;
  if (oppLogoUrl) {
    try {
      oppDataUri = await imageToDataUri(oppLogoUrl);
    } catch {
      oppDataUri = null;
    }
  }

  const ourCrestDataUri = await getOurCrestDataUri();
  const resultColor = RESULT_COLORS[result] ?? RESULT_COLORS.D;
  const resultLabel = RESULT_LABELS[result] ?? RESULT_LABELS.D;
  const homeSvg = crestCircleSvg({ cx: 250, dataUri: ourCrestDataUri, initials: "INFC", hasReal: true });
  const awaySvg = crestCircleSvg({ cx: 750, dataUri: oppDataUri, initials: initialsFor(opponent), hasReal: !!oppDataUri });

  const svg = `
<svg width="1000" height="520" viewBox="0 0 1000 520" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="topGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#d81e3d"/>
      <stop offset="100%" stop-color="#d8b46a"/>
    </linearGradient>
  </defs>
  <rect width="1000" height="520" fill="#0a1330"/>
  <rect width="1000" height="8" fill="url(#topGrad)"/>
  <rect width="8" height="520" fill="${resultColor}"/>

  <rect x="380" y="36" width="240" height="34" rx="17" fill="rgba(255,255,255,0.06)"/>
  <text x="500" y="59" font-family="Arial, sans-serif" font-size="14" letter-spacing="1.5" font-weight="700"
    fill="#93a0c9" text-anchor="middle">${escapeXml(game.competition.toUpperCase())}</text>

  ${homeSvg}
  ${awaySvg}

  <text x="500" y="290" font-family="Arial, sans-serif" font-size="110" font-weight="800"
    fill="#f6f7fb" text-anchor="middle">${clubScore} – ${oppScore}</text>

  ${labelSvg(250, "Irving Nepal FC", 390)}
  ${labelSvg(750, opponent, 390)}

  <rect x="440" y="420" width="120" height="34" rx="17" fill="${resultColor}22" stroke="${resultColor}" stroke-width="1.5"/>
  <text x="500" y="443" font-family="Arial, sans-serif" font-size="14" letter-spacing="2" font-weight="800"
    fill="${resultColor}" text-anchor="middle">${resultLabel}</text>
</svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

// Uploads the generated graphic to Supabase Storage (public bucket) and
// returns its public URL — serverless functions can't write to /public, so
// this can't just drop a file next to the marketing site's static assets.
export async function uploadMatchGraphic(gameId: string, buffer: Buffer): Promise<string | null> {
  const supabase = createServiceClient();
  const path = `match-graphics/${gameId}.png`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, buffer, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) return null;
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
