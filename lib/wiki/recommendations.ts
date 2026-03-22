import type { RelatedDocument, WikiDocument } from "@/entities/record/model/types";
import { filterReadableDocuments } from "@/lib/wiki/visibility";

function normalizeTags(tags: string[]) {
  return tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean);
}

function getDocumentRecency(document: Pick<WikiDocument, "publishedAt" | "updatedAt">) {
  return new Date(document.publishedAt ?? document.updatedAt).getTime();
}

export function getRelatedDocuments(
  document: WikiDocument,
  candidates: WikiDocument[],
  limit = 3,
) {
  const documentTags = normalizeTags(document.tags);
  const visibleCandidates = filterReadableDocuments(candidates).filter(
    (candidate) => candidate.id !== document.id,
  );

  return visibleCandidates
    .map((candidate) => {
      const sharedTags = normalizeTags(candidate.tags).filter((tag) =>
        documentTags.includes(tag),
      );

      return {
        ...candidate,
        sharedTagCount: sharedTags.length,
        sharedTags,
      } satisfies RelatedDocument;
    })
    .filter((candidate) => candidate.sharedTagCount > 0)
    .sort((left, right) => {
      if (right.sharedTagCount !== left.sharedTagCount) {
        return right.sharedTagCount - left.sharedTagCount;
      }

      return getDocumentRecency(right) - getDocumentRecency(left);
    })
    .slice(0, limit);
}
