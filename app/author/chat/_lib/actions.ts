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
  if (!input.title.trim()) {
    return { error: "Title is required." };
  }

  if (!input.contents.trim()) {
    return { error: "Contents are required." };
  }

  if (input.source_type === "book" && !input.book_title?.trim()) {
    return { error: "Book records require a book title." };
  }

  if (input.tags.length === 0) {
    return { error: "At least one tag is required for recommendations." };
  }

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
