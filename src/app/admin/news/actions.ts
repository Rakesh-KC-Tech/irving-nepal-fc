"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/auth";
import { logAudit } from "@/lib/supabase/audit";
import { slugify } from "@/lib/news";

function revalidateNews(slug?: string) {
  revalidatePath("/admin/news");
  revalidatePath("/news");
  if (slug) revalidatePath(`/news/${slug}`);
}

export async function createArticle(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const headline = formData.get("headline") as string;
  const category = formData.get("category") as string;
  const excerpt = formData.get("excerpt") as string;
  const body = formData.get("body") as string;
  const featured_image_url = (formData.get("featured_image_url") as string) || null;
  const source_url = (formData.get("source_url") as string) || null;
  const tags = (formData.get("tags") as string)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const publishNow = formData.get("publish") === "on";
  const slug = slugify(headline);

  const { data: article } = await supabase
    .from("news_articles")
    .insert({
      slug,
      headline,
      category,
      excerpt,
      body,
      featured_image_url,
      source_url,
      source_platform: "manual",
      tags,
      status: publishNow ? "published" : "draft",
      published_at: publishNow ? new Date().toISOString() : null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (article) {
    await logAudit(supabase, user.id, "news_article_created", "news_article", article.id, { headline });
  }

  revalidateNews(slug);
  redirect("/admin/news");
}

export async function updateArticle(articleId: string, formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const headline = formData.get("headline") as string;
  const category = formData.get("category") as string;
  const excerpt = formData.get("excerpt") as string;
  const body = formData.get("body") as string;
  const featured_image_url = (formData.get("featured_image_url") as string) || null;
  const source_url = (formData.get("source_url") as string) || null;
  const tags = (formData.get("tags") as string)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const { data: article } = await supabase
    .from("news_articles")
    .update({ headline, category, excerpt, body, featured_image_url, source_url, tags })
    .eq("id", articleId)
    .select("slug")
    .single();

  await logAudit(supabase, user.id, "news_article_updated", "news_article", articleId, { headline });

  revalidateNews(article?.slug);
  redirect("/admin/news");
}

export async function publishArticle(articleId: string) {
  const { supabase, user } = await requireAdmin();

  const { data: article } = await supabase
    .from("news_articles")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", articleId)
    .select("slug")
    .single();

  await logAudit(supabase, user.id, "news_article_published", "news_article", articleId);
  revalidateNews(article?.slug);
}

export async function unpublishArticle(articleId: string) {
  const { supabase, user } = await requireAdmin();

  const { data: article } = await supabase
    .from("news_articles")
    .update({ status: "archived" })
    .eq("id", articleId)
    .select("slug")
    .single();

  await logAudit(supabase, user.id, "news_article_unpublished", "news_article", articleId);
  revalidateNews(article?.slug);
}

export async function deleteArticle(articleId: string) {
  const { supabase, user } = await requireAdmin();

  await supabase.from("news_articles").delete().eq("id", articleId);
  await logAudit(supabase, user.id, "news_article_deleted", "news_article", articleId);

  revalidateNews();
}
