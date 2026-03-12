import type { RecordComment } from "@/lib/wiki/comments";

type CommentThreadProps = {
  comments: RecordComment[];
};

function CommentNode({ comment }: { comment: RecordComment }) {
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
      {comment.replies.length ? (
        <div className="ml-6 border-l border-stone-200 pl-4">
          <CommentThread comments={comment.replies} />
        </div>
      ) : null}
    </div>
  );
}

export function CommentThread({ comments }: CommentThreadProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentNode key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
