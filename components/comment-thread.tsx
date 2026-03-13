"use client";

import { useState } from "react";

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
  const [replyOpen, setReplyOpen] = useState(false);

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
            <button
              type="button"
              onClick={() => setReplyOpen((current) => !current)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-[4px] px-2 py-1 text-[12px] leading-4 font-medium text-[#2a2419] transition hover:bg-[rgba(232,227,219,0.32)]"
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 16 16"
              >
                <path
                  d="M4 4.667h5.333A2.667 2.667 0 0 1 12 7.333V8"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M9.333 10.667 12 8 9.333 5.333"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
              Reply
            </button>
          ) : null}
        </div>
      </article>
      {replyOpen ? (
        <div className="ml-12">
          <CommentForm
            recordId={recordId}
            recordSlug={recordSlug}
            parentCommentId={comment.id}
            depth={comment.depth}
            mode="reply"
            initiallyExpanded
            onCancel={() => setReplyOpen(false)}
          />
        </div>
      ) : null}
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
