import {
  listAvailableTagsForRecordIds,
  listDiscoveryListItemsPageForRecordIds,
  listDocumentsByIds,
} from "@/entities/record/api/documents";
import { cache } from "react";
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

const getMyLibraryRecordIds = cache(async function getMyLibraryRecordIds(userId: string) {
  return [...new Set((await listBookmarkRecordIds(userId)).filter(Boolean))];
});

export async function listMyLibraryPreview(userId: string) {
  const recordIds = await getMyLibraryRecordIds(userId);
  const documents = await listDocumentsByIds(recordIds);

  return sortByRecentDocumentDate(uniqueById(documents));
}

export async function listMyLibraryPreviewPage(
  userId: string,
  page = 1,
  pageSize = DISCOVERY_PAGE_SIZE,
) {
  const documents = await listMyLibraryPreview(userId);
  const resolvedPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const resolvedPageSize = Math.max(1, Math.floor(pageSize));
  const totalCount = documents.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / resolvedPageSize));
  const currentPage = Math.min(resolvedPage, totalPages);
  const visibleDocuments = documents.slice(
    (currentPage - 1) * resolvedPageSize,
    currentPage * resolvedPageSize,
  );

  return {
    documents: visibleDocuments,
    totalCount,
    totalPages,
    page: currentPage,
    pageSize: resolvedPageSize,
  };
}

export async function listAvailableTagsForMyLibrary(userId: string) {
  const recordIds = await getMyLibraryRecordIds(userId);
  return listAvailableTagsForRecordIds(recordIds, true);
}

export async function listMyLibraryDiscoveryPage(
  userId: string,
  state: DiscoveryState,
  page = 1,
  pageSize = DISCOVERY_PAGE_SIZE,
) {
  const recordIds = await getMyLibraryRecordIds(userId);

  if (isDefaultDiscoveryState(state)) {
    return listDiscoveryListItemsPageForRecordIds(
      recordIds,
      state,
      page,
      pageSize,
    );
  }

  return listDiscoveryListItemsPageForRecordIds(
    recordIds,
    state,
    page,
    pageSize,
  );
}
