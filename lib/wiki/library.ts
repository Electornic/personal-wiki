import { listPublicDocuments } from "@/lib/wiki/documents";
import type { WikiDocument } from "@/lib/wiki/types";

export type LibraryTab = "bookmarks" | "likes";

function uniqueById(documents: WikiDocument[]) {
  const seen = new Set<string>();

  return documents.filter((document) => {
    if (seen.has(document.id)) {
      return false;
    }

    seen.add(document.id);
    return true;
  });
}

export async function listMyLibraryPreview(tab: LibraryTab) {
  const documents = await listPublicDocuments();

  if (tab === "likes") {
    return uniqueById([...documents].reverse()).slice(0, 3);
  }

  return uniqueById(documents).slice(0, 3);
}
