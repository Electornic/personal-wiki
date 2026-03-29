import type { DocumentVisibility } from "@/entities/record/model/types";
import { getReactionStateForRecord } from "@/entities/reaction/api/reactions";
import { RecordReactions } from "@/components/record-reactions";
import { getViewerAccess } from "@/lib/wiki/auth";

type RecordReactionsSectionProps = {
  documentId: string;
  recordSlug: string;
  visibility: DocumentVisibility;
  initialLikeCount: number;
};

export async function RecordReactionsSection({
  documentId,
  recordSlug,
  visibility,
  initialLikeCount,
}: RecordReactionsSectionProps) {
  if (visibility !== "public") {
    return null;
  }

  const access = await getViewerAccess();
  const reactionState = await getReactionStateForRecord(documentId, access.userId);

  return (
    <section className="mt-12 border-b border-t border-[rgba(42,36,25,0.1)] py-6">
      <RecordReactions
        recordId={documentId}
        recordSlug={recordSlug}
        state={reactionState}
        likeCount={initialLikeCount}
        canReact={access.isAuthenticated}
      />
    </section>
  );
}
