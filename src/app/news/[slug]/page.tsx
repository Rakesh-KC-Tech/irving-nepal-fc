import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

const SOURCE_LABEL: Record<string, string> = {
  youtube: "Watch Original on YouTube",
  instagram: "View Original on Instagram",
  facebook: "View Original on Facebook",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase
    .from("news_articles")
    .select("headline, excerpt, featured_image_url, published_at")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!article) return {};

  const url = `https://portal.irvingnepalfc.com/news/${slug}`;
  const title = `${article.headline} | Irving Nepal FC`;
  const description = article.excerpt ?? undefined;
  const images = article.featured_image_url ? [article.featured_image_url] : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      images,
      publishedTime: article.published_at ?? undefined,
      siteName: "Irving Nepal FC",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("news_articles")
    .select("headline, category, excerpt, body, featured_image_url, tags, source_platform, source_url, source_game_id, published_at")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!article) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.headline,
    description: article.excerpt,
    image: article.featured_image_url ? [article.featured_image_url] : undefined,
    datePublished: article.published_at ?? undefined,
    author: { "@type": "Organization", name: "Irving Nepal FC" },
    publisher: {
      "@type": "Organization",
      name: "Irving Nepal FC",
      logo: { "@type": "ImageObject", url: "https://portal.irvingnepalfc.com/crest.png" },
    },
    mainEntityOfPage: `https://portal.irvingnepalfc.com/news/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className="min-h-screen bg-navy text-white">
      <header className="border-b border-line px-4 py-5">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Image src="/crest.png" alt="Irving Nepal FC crest" width={40} height={40} />
          <div>
            <p className="font-semibold leading-tight">Irving Nepal FC</p>
            <p className="text-xs text-mist leading-tight">Club News</p>
          </div>
          <Link href="/news" className="ml-auto text-sm text-mist underline">
            ← All News
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <span className="text-xs uppercase tracking-wide text-crimson-2">{article.category}</span>
        <h1 className="text-3xl font-semibold mt-2">{article.headline}</h1>
        <p className="text-sm text-mist mt-2">
          {article.published_at && new Date(article.published_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {article.featured_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.featured_image_url}
            alt={article.headline}
            className="w-full rounded-lg mt-6 max-h-96 object-cover"
          />
        )}

        <p className="text-lg text-mist mt-6">{article.excerpt}</p>
        <div className="mt-4 whitespace-pre-wrap leading-relaxed text-white/90">{article.body}</div>

        {article.source_game_id && (
          <a
            href={`https://irvingnepalfc.com/?view=fixtures&game=${encodeURIComponent(article.source_game_id)}`}
            className="inline-flex items-center gap-2 mt-8 rounded-md bg-crimson px-4 py-2 text-sm font-semibold text-white hover:bg-crimson-2 transition-colors"
          >
            View This Match in Fixtures &amp; Calendar →
          </a>
        )}

        {article.source_url && article.source_platform && article.source_platform !== "manual" && (
          <a
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-8 rounded-md border border-line px-4 py-2 text-sm underline"
          >
            {SOURCE_LABEL[article.source_platform] ?? "View Original Source"} ↗
          </a>
        )}

        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8">
            {article.tags.map((t: string) => (
              <span key={t} className="text-xs bg-panel border border-line rounded-full px-3 py-1 text-mist">
                #{t}
              </span>
            ))}
          </div>
        )}
      </main>
      </div>
    </>
  );
}
