"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { logAudit } from "@/lib/supabase/audit";

export async function createDocument(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const url = formData.get("url") as string;

  const { data: document } = await supabase
    .from("documents")
    .insert({ title, description: description || null, url, uploaded_by: user.id })
    .select("id")
    .single();

  if (document) {
    await logAudit(
      supabase,
      user.id,
      "document_created",
      "document",
      document.id,
      { title },
    );
  }

  revalidatePath("/admin/documents");
  revalidatePath("/documents");
}

export async function deleteDocument(documentId: string) {
  const { supabase, user } = await requireAdmin();

  await supabase.from("documents").delete().eq("id", documentId);
  await logAudit(supabase, user.id, "document_deleted", "document", documentId);

  revalidatePath("/admin/documents");
  revalidatePath("/documents");
}
