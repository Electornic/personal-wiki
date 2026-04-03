"use server";

import { saveDocumentCore } from "@/app/author/actions";

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
  return saveDocumentCore({
    title: input.title,
    contents: input.contents,
    sourceType: input.source_type,
    bookTitle: input.source_type === "book" ? (input.book_title ?? null) : null,
    visibility: input.visibility,
    tags: input.tags,
  });
}
