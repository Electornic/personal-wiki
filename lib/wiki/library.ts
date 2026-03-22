import { listDocumentsByIds } from "@/entities/record/api/documents";
import type { WikiDocument } from "@/entities/record/model/types";
import { listBookmarkRecordIds } from "@/entities/reaction/api/reactions";

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

function sortByRecentDocumentDate(documents: WikiDocument[]) {
  return [...documents].sort((left, right) => {
    const leftTime = new Date(left.publishedAt ?? left.updatedAt).getTime();
    const rightTime = new Date(right.publishedAt ?? right.updatedAt).getTime();

    return rightTime - leftTime;
  });
}

export async function listMyLibraryPreview() {
  const recordIds = await listBookmarkRecordIds();
  const documents = await listDocumentsByIds(recordIds);

  return sortByRecentDocumentDate(uniqueById(documents));
}
