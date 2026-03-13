import { listDocumentsByIds } from "@/lib/wiki/documents";
import { listReactionRecordIds } from "@/lib/wiki/reactions";
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
  const recordIds = await listReactionRecordIds(tab);
  const documents = await listDocumentsByIds(recordIds);

  return uniqueById(documents);
}
