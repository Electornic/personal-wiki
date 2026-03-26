"use client";

import { useState } from "react";

import { CommentForm } from "@/components/comment-form";

type CommentReplyToggleProps = {
  recordId: string;
  recordSlug: string;
  parentCommentId: string;
  depth: number;
};

export function CommentReplyToggle({
  recordId,
  recordSlug,
  parentCommentId,
  depth,
}: CommentReplyToggleProps) {
  const [replyOpen, setReplyOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setReplyOpen((current) => !current)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-[4px] px-2 py-1 text-[12px] leading-4 font-medium text-[#2a2419] transition hover:bg-[rgba(232,227,219,0.2)]"
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
      {replyOpen ? (
        <div className="pt-3">
          <CommentForm
            recordId={recordId}
            recordSlug={recordSlug}
            parentCommentId={parentCommentId}
            depth={depth}
            mode="reply"
            initiallyExpanded
            onCancel={() => setReplyOpen(false)}
          />
        </div>
      ) : null}
    </>
  );
}
