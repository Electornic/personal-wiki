import { CommentForm } from "@/components/comment-form";
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
      <article className="rounded-3xl border border-stone-200 bg-white px-5 py-4">
        <div className="flex items-center justify-between gap-4 text-sm text-stone-500">
          <span>{comment.userName}</span>
          <span>depth {comment.depth}</span>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-stone-700">
          {comment.contents}
        </p>
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
