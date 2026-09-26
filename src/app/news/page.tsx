import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { NEWS_CATEGORIES } from "@/lib/news";

const PAGE_SIZE = 9;

export const metadata: Metadata = {
  title: "Club News | Irving Nepal FC",
  description: "Match updates, tournaments, announcements, and everything happening at Irving Nepal FC.",
  alternates: { canonical: "https://portal.irvingnepalfc.com/news" },
  openGraph: {
    title: "Club News | Irving Nepal FC",
    description: "Match updates, tournaments, announcements, and everything happening at Irving Nepal FC.",
    url: "https://portal.irvingnepalfc.com/news",
    siteName: "Irving Nepal FC",
    images: ["https://portal.irvingnepalfc.com/crest.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Club News | Irving Nepal FC",
    description: "Match updates, tournaments, announcements, and everything happening at Irving Nepal FC.",
    images: ["https://portal.irvingnepalfc.com/crest.png"],
  },
};

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}) {
  const { category, q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const supabase = await createClient();

  let query = supabase
    .from("news_articles")
    .select("id, slug, headline, category, excerpt, featured_image_url, published_at", {
      count: "exact",
    })
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (category) query = query.eq("category", category);
  if (q) query = query.or(`headline.ilike.%${q}%,excerpt.ilike.%${q}%`);

  const from = (page - 1) * PAGE_SIZE;
  const { data: articles, count } = await query.range(from, from + PAGE_SIZE - 1);

  const [featured, ...rest] = page === 1 && !category && !q ? articles ?? [] : [null, ...(articles ?? [])];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  function pageHref(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { category, q, page: String(page), ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    const s = params.toString();
    return s ? `/news?${s}` : "/news";
  }

  return (
    <div className="min-h-screen bg-navy text-white">
      <header className="border-b border-line px-4 py-5">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <Image src="/crest.png" alt="Irving Nepal FC crest" width={40} height={40} />
          <div>
            <p className="font-semibold leading-tight">Irving Nepal FC</p>
            <p className="text-xs text-mist leading-tight">Club News</p>
          </div>
          <a
            href="https://irvingnepalfc.com"
            className="ml-auto text-sm text-mist underline"
          >
            ← Back to irvingnepalfc.com
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-semibold">Club News</h1>
          <p className="text-mist mt-1">Match updates, tournaments, announcements, and everything happening at Irving Nepal FC.</p>
        </div>

        <form className="flex flex-wrap gap-3 items-center" action="/news">
          <input
            type="search"
            name="q"
            placeholder="Search news..."
            defaultValue={q}
            className="bg-panel border border-line rounded-md px-3 py-2 text-sm flex-1 min-w-[200px]"
          />
          <select name="category" defaultValue={category ?? ""} className="bg-panel border border-line rounded-md px-3 py-2 text-sm">
            <option value="">All Categories</option>
            {NEWS_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-md bg-crimson px-4 py-2 text-sm font-medium">
            Search
          </button>
        </form>

        {(!articles || articles.length === 0) && (
          <p className="text-mist">No news articles found.</p>
        )}

        {featured && (
          <Link
            href={`/news/${featured.slug}`}
            className="block rounded-lg border border-line overflow-hidden hover:border-crimson-2 transition-colors"
          >
            {featured.featured_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={featured.featured_image_url} alt={featured.headline} className="w-full h-72 object-cover" />
            )}
            <div className="p-6">
              <span className="text-xs uppercase tracking-wide text-crimson-2">{featured.category}</span>
              <h2 className="text-2xl font-semibold mt-2">{featured.headline}</h2>
              <p className="text-mist mt-2">{featured.excerpt}</p>
              <p className="text-xs text-mist mt-3">
                {featured.published_at && new Date(featured.published_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.filter(Boolean).map((a) => (
            <Link
              key={a!.id}
              href={`/news/${a!.slug}`}
              className="rounded-lg border border-line overflow-hidden hover:border-crimson-2 transition-colors flex flex-col"
            >
              {a!.featured_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a!.featured_image_url} alt={a!.headline} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-panel" />
              )}
              <div className="p-4 flex-1 flex flex-col">
                <span className="text-xs uppercase tracking-wide text-crimson-2">{a!.category}</span>
                <h3 className="font-medium mt-1.5">{a!.headline}</h3>
                <p className="text-sm text-mist mt-1.5 flex-1">{a!.excerpt}</p>
                <p className="text-xs text-mist mt-3">
                  {a!.published_at && new Date(a!.published_at).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4">
            {page > 1 && (
              <Link href={pageHref({ page: String(page - 1) })} className="text-sm underline">
                ← Newer
              </Link>
            )}
            <span className="text-sm text-mist">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link href={pageHref({ page: String(page + 1) })} className="text-sm underline">
                Older →
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
