import { NEWS_CATEGORIES } from "@/lib/news";

export type RewrittenArticle = {
  headline: string;
  category: string;
  excerpt: string;
  body: string;
  tags: string[];
  relevant: boolean;
};

// Turns a raw social post/video into a professional article, strictly
// grounded in what the source actually says — the prompt is the main
// safeguard against inventing scores, quotes, dates, or results.
export async function rewriteAsArticle(input: {
  platform: "youtube" | "instagram" | "facebook";
  sourceTitle: string;
  sourceText: string;
  sourceUrl: string;
}): Promise<RewrittenArticle | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are the social media editor for Irving Nepal FC, a Nepali-community soccer club in Irving, Texas. Rewrite the following ${input.platform} post into a short, professional news article for the club's official website.

Rules — follow exactly:
- Do NOT copy the caption/description word-for-word. Rewrite it in clean, professional prose.
- Do NOT invent anything not stated in the source: no scores, stats, quotes, results, dates, transfers, injuries, or other specifics. If something is unclear or missing, leave it out rather than guessing.
- If this post is not genuinely newsworthy club content (e.g. a meme, an unrelated repost, spam, or too vague to write about), set "relevant" to false and leave the other fields as empty strings/arrays.
- Pick exactly one category from this list: ${NEWS_CATEGORIES.join(", ")}.
- excerpt: one or two sentences, plain text.
- body: 2-4 short paragraphs, plain text (no markdown).
- tags: 2-5 short lowercase-kebab-case tags.

Source title: ${input.sourceTitle}
Source text: ${input.sourceText}

Respond with ONLY valid JSON, no other text, in this exact shape:
{"relevant": true, "headline": "...", "category": "...", "excerpt": "...", "body": "...", "tags": ["...", "..."]}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const text: string = data.content?.[0]?.text ?? "";

  try {
    const parsed = JSON.parse(text);
    if (typeof parsed.relevant !== "boolean") return null;
    if (!parsed.relevant) return { relevant: false, headline: "", category: "", excerpt: "", body: "", tags: [] };
    if (!NEWS_CATEGORIES.includes(parsed.category)) return null;
    return parsed;
  } catch {
    return null;
  }
}
