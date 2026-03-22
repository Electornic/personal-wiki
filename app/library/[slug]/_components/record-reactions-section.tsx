import type { DocumentVisibility } from "@/entities/record/model/types";
import {
  getLikeCountForRecord,
  getReactionStateForRecord,
} from "@/entities/reaction/api/reactions";
import { RecordReactions } from "@/components/record-reactions";
import { getAuthorAccess } from "@/lib/wiki/auth";

type RecordReactionsSectionProps = {
  documentId: string;
  recordSlug: string;
  visibility: DocumentVisibility;
};

export async function RecordReactionsSection({
  documentId,
  recordSlug,
  visibility,
}: RecordReactionsSectionProps) {
  if (visibility !== "public") {
    return null;
  }

  const access = await getAuthorAccess();
  const [reactionState, likeCount] = await Promise.all([
    getReactionStateForRecord(documentId, access.userId),
    getLikeCountForRecord(documentId),
  ]);

  return (
    <section className="mt-12 border-b border-t border-[rgba(42,36,25,0.1)] py-6">
      <RecordReactions
        recordId={documentId}
        recordSlug={recordSlug}
        state={reactionState}
        likeCount={likeCount}
        canReact={access.isAuthenticated}
      />
    </section>
  );
}
