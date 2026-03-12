import { CommentForm } from "@/components/comment-form";
import { formatDisplayDate } from "@/lib/wiki/content";
import type { RecordComment } from "@/lib/wiki/comments";

type CommentThreadProps = {
  comments: RecordComment[];
  recordId: string;
  recordSlug: string;
  canComment: boolean;
};

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
    <div className="space-y-3">
      <article className="surface-card px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-200 text-sm font-medium">
            {comment.userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-baseline gap-2">
              <span className="font-medium text-sm">{comment.userName}</span>
              <time className="text-xs text-muted-foreground">
                {formatDisplayDate(comment.createdAt)}
              </time>
            </div>
            <p className="mb-2 whitespace-pre-wrap text-base leading-relaxed">
              {comment.contents}
            </p>
            <div className="text-xs text-muted-foreground">depth {comment.depth}</div>
          </div>
        </div>
      </article>
      {canComment && comment.depth < 5 ? (
        <div className="ml-6 rounded-3xl border border-stone-200 bg-stone-50 px-4 py-4">
          <CommentForm
            recordId={recordId}
            recordSlug={recordSlug}
            parentCommentId={comment.id}
            depth={comment.depth}
          />
        </div>
      ) : null}
      {comment.replies.length ? (
        <div className="ml-6 border-l border-stone-200 pl-4">
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
    <div className="space-y-4">
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
