import { requireAdmin } from "@/lib/supabase/auth";
import { ArticleFields } from "../ArticleFields";
import { createArticle } from "../actions";

export default async function NewArticlePage() {
  await requireAdmin();

  return (
    <div className="min-w-0 flex flex-col gap-6">
      <h2 className="text-lg font-medium">New Article</h2>

      <form className="flex flex-col gap-4 max-w-2xl">
        <ArticleFields />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="publish" />
          Publish immediately (otherwise saved as a draft)
        </label>

        <button
          formAction={createArticle}
          className="rounded-md bg-crimson px-3 py-2 text-sm font-medium text-white self-start"
        >
          Save Article
        </button>
      </form>
    </div>
  );
}
