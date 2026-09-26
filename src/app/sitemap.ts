import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://portal.irvingnepalfc.com";

// Plain anon client, not the cookie-based request-scoped one — sitemap
// generation has no visitor session to attach to, and published articles
// are already publicly readable by the anon key (the same way the public
// /news pages read them for any visitor, logged in or not).
function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = publicClient();
  const { data: articles } = await supabase
    .from("news_articles")
    .select("slug, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/news`, changeFrequency: "daily", priority: 0.9 },
  ];

  const articleRoutes: MetadataRoute.Sitemap = (articles ?? []).map((a) => ({
    url: `${BASE_URL}/news/${a.slug}`,
    lastModified: a.published_at ?? undefined,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...articleRoutes];
}
