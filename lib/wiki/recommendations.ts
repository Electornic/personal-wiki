import type { RelatedDocument, WikiDocument } from "@/lib/wiki/types";
import { filterReadableDocuments } from "@/lib/wiki/visibility";

function normalizeTopics(topics: string[]) {
  return topics.map((topic) => topic.trim().toLowerCase()).filter(Boolean);
}

export function getRelatedDocuments(
  document: WikiDocument,
  candidates: WikiDocument[],
  limit = 3,
) {
  const documentTopics = normalizeTopics(document.topics);
  const visibleCandidates = filterReadableDocuments(candidates).filter(
    (candidate) => candidate.id !== document.id,
  );

  return visibleCandidates
    .map((candidate) => {
      const sharedTopics = normalizeTopics(candidate.topics).filter((topic) =>
        documentTopics.includes(topic),
      );

      return {
        ...candidate,
        sharedTopicCount: sharedTopics.length,
        sharedTopics,
      } satisfies RelatedDocument;
    })
    .filter((candidate) => candidate.sharedTopicCount > 0)
    .sort((left, right) => {
      if (right.sharedTopicCount !== left.sharedTopicCount) {
        return right.sharedTopicCount - left.sharedTopicCount;
      }

      return (
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
      );
    })
    .slice(0, limit);
}
