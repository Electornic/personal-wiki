import { CommentReplyToggle } from "@/components/comment-reply-toggle";
import { MAX_COMMENT_DEPTH } from "@/entities/comment/api/comments";
import { formatDisplayDate } from "@/entities/record/model/content";
import type { RecordComment } from "@/entities/comment/api/comments";

type CommentThreadProps = {
  comments: RecordComment[];
  recordId: string;
  recordSlug: string;
  canComment: boolean;
};

function getThreadOffset(depth: number) {
  if (depth <= 0) {
    return "";
  }

  if (depth === 1) {
    return "ml-5 md:ml-8";
  }

  return "ml-8 md:ml-12";
}

function CommentNode({
  comment,
  recordId,
  recordSlug,
  canComment,
}: {
  comment: RecordComment;
  recordId: string;
  recordSlug: string;
  canComment: boolean;
}) {
  return (
    <div className={`space-y-3 ${getThreadOffset(comment.depth)}`}>
      <article className="rounded-[10px] border border-[rgba(42,36,25,0.08)] bg-[rgba(250,248,245,0.92)] px-4 py-4 shadow-[0_8px_24px_rgba(42,36,25,0.04)]">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8e3db] text-[14px] leading-5 font-medium text-[var(--foreground)]">
            {comment.userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[14px] leading-5 font-medium text-[var(--foreground)]">
                {comment.userName}
              </span>
              <span className="h-1 w-1 rounded-full bg-[rgba(42,36,25,0.18)]" />
              <time className="text-[12px] leading-4 text-[var(--muted)]">
                {formatDisplayDate(comment.createdAt)}
              </time>
            </div>
            <p className="whitespace-pre-wrap text-[15px] leading-[25px] text-[var(--foreground)]">
              {comment.contents}
            </p>
            {canComment && comment.depth < MAX_COMMENT_DEPTH ? (
              <CommentReplyToggle
                recordId={recordId}
                recordSlug={recordSlug}
                parentCommentId={comment.id}
                depth={comment.depth}
              />
            ) : null}
          </div>
        </div>
      </article>
      {comment.replies.length ? (
        <div className="border-l border-[rgba(42,36,25,0.12)] pl-4 pt-1">
          <CommentThread
            comments={comment.replies}
            recordId={recordId}
            recordSlug={recordSlug}
            canComment={canComment}
          />
        </div>
      ) : null}
    </div>
  );
}

export function CommentThread({
  comments,
  recordId,
  recordSlug,
  canComment,
}: CommentThreadProps) {
  return (
    <div className="space-y-5">
      {comments.map((comment) => (
        <CommentNode
          key={comment.id}
          comment={comment}
          recordId={recordId}
          recordSlug={recordSlug}
          canComment={canComment}
        />
      ))}
    </div>
  );
}
