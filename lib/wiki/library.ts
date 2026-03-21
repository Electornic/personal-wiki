import { listDocumentsByIds } from "@/entities/record/api/documents";
import type { WikiDocument } from "@/entities/record/model/types";
import { listReactionRecordIds } from "@/entities/reaction/api/reactions";

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
