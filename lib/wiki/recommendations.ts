import type { RelatedDocument, WikiDocument, WikiDocumentListItem } from "@/entities/record/model/types";

function normalizeTags(tags: string[]) {
  return tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean);
}

type RelatedDocumentCandidate = Pick<
  WikiDocumentListItem,
  "id" | "slug" | "title" | "sourceType" | "bookTitle" | "writerName" | "publishedAt" | "tags" | "updatedAt"
>;

type RelatedDocumentCandidateWithExcerpt = RelatedDocumentCandidate & {
  excerpt?: string;
  visibility?: WikiDocument["visibility"];
};

function getDocumentRecency(document: Pick<RelatedDocumentCandidate, "publishedAt" | "updatedAt">) {
  return new Date(document.publishedAt ?? document.updatedAt).getTime();
}

export function getRelatedDocuments(
  document: Pick<WikiDocument, "id" | "tags">,
  candidates: RelatedDocumentCandidateWithExcerpt[],
  limit = 3,
) {
  const documentTags = normalizeTags(document.tags);
  const visibleCandidates = candidates.filter((candidate) => {
    if (candidate.id === document.id) {
      return false;
    }

    if (candidate.visibility === "private") {
      return false;
    }

    return true;
  });

  return visibleCandidates
    .map((candidate) => {
      const sharedTags = normalizeTags(candidate.tags).filter((tag) =>
        documentTags.includes(tag),
      );

      return {
        ...candidate,
        excerpt: candidate.excerpt ?? "",
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
