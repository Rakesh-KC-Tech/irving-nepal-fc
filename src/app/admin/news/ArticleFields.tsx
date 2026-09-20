import { NEWS_CATEGORIES } from "@/lib/news";

export function ArticleFields({
  defaults,
}: {
  defaults?: {
    headline?: string;
    category?: string;
    excerpt?: string;
    body?: string;
    featured_image_url?: string | null;
    source_url?: string | null;
    tags?: string[];
    is_announcement?: boolean;
  };
}) {
  return (
    <>
      <label className="flex flex-col gap-1 text-sm">
        Headline
        <input
          name="headline"
          type="text"
          required
          defaultValue={defaults?.headline}
          className="bg-paper text-navy rounded-md border border-line px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Category
        <select
          name="category"
          required
          defaultValue={defaults?.category ?? NEWS_CATEGORIES[0]}
          className="bg-paper text-navy rounded-md border border-line px-3 py-2"
        >
          {NEWS_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Short summary / excerpt
        <textarea
          name="excerpt"
          required
          rows={2}
          defaultValue={defaults?.excerpt}
          className="bg-paper text-navy rounded-md border border-line px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Full article
        <textarea
          name="body"
          required
          rows={10}
          defaultValue={defaults?.body}
          className="bg-paper text-navy rounded-md border border-line px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Featured image URL
        <input
          name="featured_image_url"
          type="url"
          placeholder="https://..."
          defaultValue={defaults?.featured_image_url ?? ""}
          className="bg-paper text-navy rounded-md border border-line px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Original source link (optional)
        <input
          name="source_url"
          type="url"
          placeholder="https://..."
          defaultValue={defaults?.source_url ?? ""}
          className="bg-paper text-navy rounded-md border border-line px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Tags (comma-separated)
        <input
          name="tags"
          type="text"
          placeholder="matchday, lonestar-cup"
          defaultValue={defaults?.tags?.join(", ")}
          className="bg-paper text-navy rounded-md border border-line px-3 py-2"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          name="is_announcement"
          type="checkbox"
          defaultChecked={defaults?.is_announcement ?? false}
          className="h-4 w-4"
        />
        Show as a site-wide announcement popup when published
      </label>
      <p className="text-xs text-mist -mt-3">
        Only check this for genuinely important updates (cancellations, deadlines, major announcements) —
        it interrupts every visitor once per browsing session. Most articles shouldn&apos;t use this.
      </p>
    </>
  );
}
