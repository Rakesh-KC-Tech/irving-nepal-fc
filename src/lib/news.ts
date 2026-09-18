export const NEWS_CATEGORIES = [
  "Match Updates",
  "Club News",
  "Team News",
  "Tournaments",
  "Events",
  "Announcements",
  "Community",
  "Sponsors",
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export type NewsArticle = {
  id: string;
  slug: string;
  headline: string;
  category: NewsCategory;
  excerpt: string;
  body: string;
  featured_image_url: string | null;
  tags: string[];
  status: "draft" | "published" | "archived";
  source_platform: "youtube" | "instagram" | "facebook" | "manual" | null;
  source_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export function slugify(headline: string) {
  const base = headline
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}
