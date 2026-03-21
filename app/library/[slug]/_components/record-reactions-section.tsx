import { getReactionStateForRecord } from "@/entities/reaction/api/reactions";
import { RecordReactions } from "@/components/record-reactions";
import { getAuthorAccess } from "@/lib/wiki/auth";

type RecordReactionsSectionProps = {
  documentId: string;
  recordSlug: string;
};

export async function RecordReactionsSection({
  documentId,
  recordSlug,
}: RecordReactionsSectionProps) {
  const access = await getAuthorAccess();
  const reactionState = await getReactionStateForRecord(documentId, access.userId);

  return (
    <section className="mt-12 border-b border-t border-[rgba(42,36,25,0.1)] py-6">
      <RecordReactions
        recordId={documentId}
        recordSlug={recordSlug}
        state={reactionState}
        canReact={access.isAuthenticated}
      />
    </section>
  );
}
