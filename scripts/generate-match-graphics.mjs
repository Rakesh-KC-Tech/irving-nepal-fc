import sharp from "sharp";
import fs from "fs";
import path from "path";

const OUT_DIR = "C:/Users/17249/code/irving-nepal-fc/public/news";
fs.mkdirSync(OUT_DIR, { recursive: true });

const OUR_CREST_URL = "https://portal.irvingnepalfc.com/crest.png";

// Same manually-sourced lookup already shipped on the marketing site.
const OPPONENT_LOGOS = {
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

const RESULT_COLORS = { W: "#2ecc71", D: "#93a0c9", L: "#ff2f52" };
const RESULT_LABELS = { W: "WIN", D: "DRAW", L: "LOSS" };

const MATCHES = [
  { id: "48028019-317b-4c44-9b3a-78e1707b48e5", opponent: "FortWorth Rising Star FC", ourScore: 6, oppScore: 7, result: "L", competition: "Haslet Super League S1" },
  { id: "b164a70b-2a0c-4811-99c9-5f1dc4636190", opponent: "ERFC SPOT", ourScore: 1, oppScore: 5, result: "L", competition: "4th Lonestar Cup 2026" },
  { id: "87df91c5-94d1-444f-967c-7d776a187ad4", opponent: "Khukuri FC", ourScore: 1, oppScore: 3, result: "L", competition: "4th Lonestar Cup 2026" },
  { id: "5169ba56-1808-46f3-8808-df33124863b6", opponent: "Back Again FC", ourScore: 6, oppScore: 11, result: "L", competition: "Haslet Super League S1" },
  { id: "c5c669ba-b0d1-4968-b55d-59cdc1843edd", opponent: "Blackthorn United", ourScore: 0, oppScore: 0, result: "D", competition: "RSA Cup" },
  { id: "fda9cbf8-29c3-42bd-b92c-16f6e78c3d74", opponent: "Euless Royal Football Club", ourScore: 0, oppScore: 0, result: "D", competition: "Haslet Super League S1" },
  { id: "0eb5ab50-0cf0-40df-9dba-7564401960bc", opponent: "Euless Royal Football Club", ourScore: 1, oppScore: 2, result: "L", competition: "RSA Cup" },
  { id: "3ba4301a-eec9-4f4f-828d-8e0150f6555d", opponent: "Royal United FC", ourScore: 7, oppScore: 4, result: "W", competition: "Haslet Super League S1" },
  { id: "2bb6f2ac-a077-49d9-9341-eafa19b28e2d", opponent: "Dfw himalayas fc", ourScore: 0, oppScore: 4, result: "L", competition: "Nepali 35+ Sunday Soccer League" },
  { id: "8bb62fec-6819-4aae-b586-dd8d11147d77", opponent: "D-Town FC", ourScore: 0, oppScore: 5, result: "L", competition: "Nepali 35+ Sunday Soccer League" },
];

function initialsFor(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 3).map((w) => w[0]).join("").toUpperCase().slice(0, 3);
}

function escapeXml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Always render the real name (wrapped across up to 2 lines) rather than an
// invented abbreviation — a made-up short form (e.g. treating "Euless Royal
// Football Club" as "ERF FC") can land on something that isn't even the
// club's own real abbreviation, which is worse than just wrapping the text.
function wrapLabel(name, maxCharsPerLine = 16) {
  const words = name.toUpperCase().split(/\s+/);
  const lines = [];
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

function labelSvg(cx, name, centerY) {
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

async function imageToDataUri(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch failed ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || "image/jpeg";
  return `data:${contentType};base64,${buf.toString("base64")}`;
}

function crestCircleSvg({ cx, dataUri, initials, hasReal }) {
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

async function buildGraphic(match, ourCrestDataUri) {
  const oppKey = match.opponent.toLowerCase().trim();
  const oppLogoUrl = OPPONENT_LOGOS[oppKey];
  let oppDataUri = null;
  if (oppLogoUrl) {
    try {
      oppDataUri = await imageToDataUri(oppLogoUrl);
    } catch (e) {
      console.warn(`  logo fetch failed for ${match.opponent}: ${e.message}`);
    }
  }

  const resultColor = RESULT_COLORS[match.result];
  const resultLabel = RESULT_LABELS[match.result];
  const homeSvg = crestCircleSvg({ cx: 250, dataUri: ourCrestDataUri, initials: "INFC", hasReal: true });
  const awaySvg = crestCircleSvg({ cx: 750, dataUri: oppDataUri, initials: initialsFor(match.opponent), hasReal: !!oppDataUri });

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
    fill="#93a0c9" text-anchor="middle">${escapeXml(match.competition.toUpperCase())}</text>

  ${homeSvg}
  ${awaySvg}

  <text x="500" y="290" font-family="Arial, sans-serif" font-size="110" font-weight="800"
    fill="#f6f7fb" text-anchor="middle">${match.ourScore} – ${match.oppScore}</text>

  ${labelSvg(250, "Irving Nepal FC", 390)}
  ${labelSvg(750, match.opponent, 390)}

  <rect x="440" y="420" width="120" height="34" rx="17" fill="${resultColor}22" stroke="${resultColor}" stroke-width="1.5"/>
  <text x="500" y="443" font-family="Arial, sans-serif" font-size="14" letter-spacing="2" font-weight="800"
    fill="${resultColor}" text-anchor="middle">${resultLabel}</text>
</svg>`;

  const outPath = path.join(OUT_DIR, `match-${match.id}.png`);
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  return outPath;
}

async function main() {
  console.log("Fetching Irving Nepal FC crest...");
  const ourCrestDataUri = await imageToDataUri(OUR_CREST_URL);

  for (const match of MATCHES) {
    console.log(`Generating graphic for ${match.opponent} (${match.id})...`);
    const outPath = await buildGraphic(match, ourCrestDataUri);
    console.log(`  -> ${outPath}`);
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
