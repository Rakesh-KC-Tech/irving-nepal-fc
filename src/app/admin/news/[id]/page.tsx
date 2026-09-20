import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/auth";
import { ArticleFields } from "../ArticleFields";
import { updateArticle } from "../actions";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: article } = await supabase
    .from("news_articles")
    .select(
      "id, headline, category, excerpt, body, featured_image_url, source_url, source_platform, tags, status, is_announcement",
    )
    .eq("id", id)
    .single();

  if (!article) notFound();

  const boundUpdate = updateArticle.bind(null, article.id);

  return (
    <div className="min-w-0 flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-medium">Edit Article</h2>
        {article.source_platform && article.source_platform !== "manual" && (
          <p className="text-xs text-mist mt-1">
            Auto-drafted from {article.source_platform}
            {article.source_url && (
              <>
                {" "}
                ·{" "}
                <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="underline">
                  View original source
                </a>
              </>
            )}
          </p>
        )}
      </div>

      <form className="flex flex-col gap-4 max-w-2xl">
        <ArticleFields defaults={article} />
        <button
          formAction={boundUpdate}
          className="rounded-md bg-crimson px-3 py-2 text-sm font-medium text-white self-start"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
