import { CommentReplyToggle } from "@/components/comment-reply-toggle";
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
      <article className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8e3db] text-[14px] leading-5 font-medium text-[#2a2419]">
          {comment.userName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[14px] leading-5 font-medium text-[#2a2419]">
              {comment.userName}
            </span>
            <time className="text-[12px] leading-4 text-[#6b6354]">
              {formatDisplayDate(comment.createdAt)}
            </time>
          </div>
          <p className="whitespace-pre-wrap text-[16px] leading-[26px] text-[#2a2419]">
            {comment.contents}
          </p>
          {canComment && comment.depth < 5 ? (
            <CommentReplyToggle
              recordId={recordId}
              recordSlug={recordSlug}
              parentCommentId={comment.id}
              depth={comment.depth}
            />
          ) : null}
        </div>
      </article>
      {comment.replies.length ? (
        <div className="ml-12 border-l border-[rgba(42,36,25,0.1)] pl-6">
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
    <div className="space-y-6">
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
