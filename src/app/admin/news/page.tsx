import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/auth";
import { publishArticle, unpublishArticle, deleteArticle } from "./actions";

export default async function AdminNewsPage() {
  const { supabase } = await requireAdmin();

  const { data: articles } = await supabase
    .from("news_articles")
    .select("id, headline, category, status, source_platform, published_at, created_at, is_announcement")
    .order("created_at", { ascending: false });

  const drafts = articles?.filter((a) => a.status === "draft") ?? [];
  const published = articles?.filter((a) => a.status === "published") ?? [];
  const archived = articles?.filter((a) => a.status === "archived") ?? [];

  return (
    <div className="min-w-0 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">News</h2>
        <Link
          href="/admin/news/new"
          className="rounded-md bg-crimson px-3 py-1.5 text-sm font-medium text-white"
        >
          New Article
        </Link>
      </div>

      {drafts.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-mist">Drafts awaiting review ({drafts.length})</h3>
          {drafts.map((a) => (
            <ArticleRow key={a.id} article={a} />
          ))}
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-mist">Published ({published.length})</h3>
        {published.map((a) => (
          <ArticleRow key={a.id} article={a} />
        ))}
        {published.length === 0 && <p className="text-sm text-mist">Nothing published yet.</p>}
      </section>

      {archived.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-mist">Archived ({archived.length})</h3>
          {archived.map((a) => (
            <ArticleRow key={a.id} article={a} />
          ))}
        </section>
      )}
    </div>
  );
}

type Row = {
  id: string;
  headline: string;
  category: string;
  status: string;
  source_platform: string | null;
  published_at: string | null;
  created_at: string;
  is_announcement: boolean;
};

function ArticleRow({ article }: { article: Row }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-line p-3 text-sm">
      <div className="min-w-0">
        <p className="font-medium truncate">
          {article.is_announcement && <span title="Shows as a site announcement popup">📢 </span>}
          {article.headline}
        </p>
        <p className="text-xs text-mist">
          {article.category}
          {article.source_platform && article.source_platform !== "manual" && (
            <> · from {article.source_platform}</>
          )}
          {" · "}
          {article.status === "published" && article.published_at
            ? new Date(article.published_at).toLocaleDateString()
            : new Date(article.created_at).toLocaleDateString()}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-xs">
        <Link href={`/admin/news/${article.id}`} className="underline">
          Edit
        </Link>
        {article.status !== "published" && (
          <form>
            <button formAction={publishArticle.bind(null, article.id)} className="text-green-500 underline">
              Publish
            </button>
          </form>
        )}
        {article.status === "published" && (
          <form>
            <button formAction={unpublishArticle.bind(null, article.id)} className="underline">
              Unpublish
            </button>
          </form>
        )}
        <form>
          <button formAction={deleteArticle.bind(null, article.id)} className="text-crimson-2 underline">
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
