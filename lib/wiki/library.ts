import {
  listAvailableTagsForRecordIds,
  listDiscoveryDocumentsPageForRecordIds,
  listDocumentsByIds,
} from "@/entities/record/api/documents";
import type { WikiDocument } from "@/entities/record/model/types";
import type { DiscoveryState } from "@/lib/wiki/discovery";
import { DISCOVERY_PAGE_SIZE, isDefaultDiscoveryState } from "@/lib/wiki/discovery";
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

export async function listMyLibraryPreviewPage(
  page = 1,
  pageSize = DISCOVERY_PAGE_SIZE,
) {
  const recordIds = [...new Set((await listBookmarkRecordIds()).filter(Boolean))];
  const resolvedPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const resolvedPageSize = Math.max(1, Math.floor(pageSize));
  const totalCount = recordIds.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / resolvedPageSize));
  const currentPage = Math.min(resolvedPage, totalPages);
  const visibleRecordIds = recordIds.slice(
    (currentPage - 1) * resolvedPageSize,
    currentPage * resolvedPageSize,
  );
  const documents = await listDocumentsByIds(visibleRecordIds);

  return {
    documents: sortByRecentDocumentDate(uniqueById(documents)),
    totalCount,
    totalPages,
    page: currentPage,
    pageSize: resolvedPageSize,
  };
}

export async function listAvailableTagsForMyLibrary() {
  const recordIds = [...new Set((await listBookmarkRecordIds()).filter(Boolean))];
  return listAvailableTagsForRecordIds(recordIds, true);
}

export async function listMyLibraryDiscoveryPage(
  state: DiscoveryState,
  page = 1,
  pageSize = DISCOVERY_PAGE_SIZE,
) {
  if (isDefaultDiscoveryState(state)) {
    return listMyLibraryPreviewPage(page, pageSize);
  }

  const recordIds = [...new Set((await listBookmarkRecordIds()).filter(Boolean))];
  return listDiscoveryDocumentsPageForRecordIds(
    recordIds,
    state,
    page,
    pageSize,
    true,
  );
}
