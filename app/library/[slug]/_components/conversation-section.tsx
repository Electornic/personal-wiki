import Link from "next/link";

import { CommentForm } from "@/components/comment-form";
import { listCommentsForRecord } from "@/entities/comment/api/comments";
import { CommentThread } from "@/entities/comment/ui/comment-thread";
import type { DocumentVisibility } from "@/entities/record/model/types";
import { getAuthorAccess } from "@/lib/wiki/auth";

type ConversationSectionProps = {
  documentId: string;
  recordSlug: string;
  visibility: DocumentVisibility;
};

function countComments(
  comments: Awaited<ReturnType<typeof listCommentsForRecord>>,
): number {
  return comments.reduce((total, comment) => {
    return total + 1 + countComments(comment.replies);
  }, 0);
}

export async function ConversationSection({
  documentId,
  recordSlug,
  visibility,
}: ConversationSectionProps) {
  const [access, comments] = await Promise.all([
    getAuthorAccess(),
    listCommentsForRecord(documentId),
  ]);
  const canComment = access.isAuthenticated && visibility === "public";
  const showPrivateCommentNotice = visibility === "private";
  const commentCount = countComments(comments);

  return (
    <section className="mt-12 border-t border-[rgba(42,36,25,0.1)] pt-10 md:mt-16 md:pt-12">
      <h2 className="text-[24px] leading-8 font-semibold text-[#2a2419]">
        Conversation
        <span className="ml-1 text-[18px] leading-7 font-normal text-[#6b6354]">
          {commentCount}
        </span>
      </h2>
      <p className="mt-2 text-[14px] leading-5 text-[#6b6354]">
        Share your reflections on this piece
      </p>

      {canComment ? (
        <div className="mt-8">
          <CommentForm recordId={documentId} recordSlug={recordSlug} />
        </div>
      ) : showPrivateCommentNotice ? (
        <div className="mt-8 rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-[rgba(232,227,219,0.3)] px-6 py-6 text-center">
          <p className="text-[18px] leading-[32.4px] text-[#6b6354]">
            Comments are available on public records only.
          </p>
        </div>
      ) : (
        <div className="mt-8 rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-[rgba(232,227,219,0.3)] px-6 py-6 text-center">
          <p className="text-[18px] leading-[32.4px] text-[#6b6354]">
            Sign in to join the conversation
          </p>
          <Link
            href="/author/sign-in"
            className="mt-4 inline-flex h-8 items-center justify-center rounded-[4px] border border-[rgba(42,36,25,0.1)] bg-[#faf8f5] px-3 text-[14px] leading-5 font-medium text-[#2a2419]"
          >
            Sign In
          </Link>
        </div>
      )}

      {comments.length ? (
        <div className="mt-10">
          <CommentThread
            comments={comments}
            recordId={documentId}
            recordSlug={recordSlug}
            canComment={canComment}
          />
        </div>
      ) : (
        <p className="mt-10 text-[16px] leading-6 text-[#6b6354]">
          No comments yet. Start the conversation.
        </p>
      )}
    </section>
  );
}
