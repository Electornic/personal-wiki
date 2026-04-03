"use server";

import { upsertDocument } from "@/entities/record/api/documents";

interface SaveChatDocumentInput {
  title: string;
  source_type: "book" | "article";
  book_title?: string;
  tags: string[];
  contents: string;
  visibility: "public" | "private";
}

export async function saveChatDocument(
  input: SaveChatDocumentInput,
): Promise<{ slug?: string; error?: string }> {
  try {
    const slug = await upsertDocument({
      title: input.title,
      contents: input.contents,
      sourceType: input.source_type,
      bookTitle: input.source_type === "book" ? (input.book_title ?? null) : null,
      visibility: input.visibility,
      tags: input.tags,
    });

    return { slug };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to save document." };
  }
}
