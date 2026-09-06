"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";

export async function createDocument(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const url = formData.get("url") as string;

  await supabase.from("documents").insert({
    title,
    description: description || null,
    url,
    uploaded_by: user.id,
  });

  revalidatePath("/admin/documents");
  revalidatePath("/documents");
}

export async function deleteDocument(documentId: string) {
  const { supabase } = await requireAdmin();

  await supabase.from("documents").delete().eq("id", documentId);

  revalidatePath("/admin/documents");
  revalidatePath("/documents");
}
