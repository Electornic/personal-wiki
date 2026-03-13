"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { createCommentAction } from "@/app/library/actions";

type CommentFormProps = {
  recordId: string;
  recordSlug: string;
  parentCommentId?: string | null;
  depth?: number;
  mode?: "comment" | "reply";
  initiallyExpanded?: boolean;
  onCancel?: () => void;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex h-8 items-center justify-center rounded-[4px] border border-[rgba(42,36,25,0.1)] bg-[#faf8f5] px-3 text-[14px] leading-5 font-medium text-[#2a2419]"
      type="submit"
      disabled={pending}
    >
      {pending ? "saving..." : "Post"}
    </button>
  );
}

export function CommentForm({
  recordId,
  recordSlug,
  parentCommentId,
  depth = 0,
  mode = "comment",
  initiallyExpanded = false,
  onCancel,
}: CommentFormProps) {
  const [state, formAction] = useActionState(createCommentAction, {});
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (expanded) {
      textareaRef.current?.focus();
    }
  }, [expanded]);

  const isReply = mode === "reply";

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="recordId" value={recordId} />
      <input type="hidden" name="recordSlug" value={recordSlug} />
      <input type="hidden" name="parentCommentId" value={parentCommentId ?? ""} />
      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex h-[48px] w-full items-center rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-[rgba(232,227,219,0.2)] px-4 text-left text-[15px] leading-[22.5px] font-medium text-[#6b6354] transition hover:bg-[rgba(232,227,219,0.32)]"
        >
          {isReply ? "Write a reply..." : "Share your thoughts..."}
        </button>
      ) : (
        <>
          <label className="field">
            <span className="sr-only">
              {parentCommentId ? `reply depth ${depth + 1}` : "comment"}
            </span>
            <textarea
              ref={textareaRef}
              name="contents"
              rows={isReply ? 3 : 4}
              required
              placeholder={isReply ? "Write a reply..." : "Share your thoughts..."}
              className={`rounded-[4px] border border-[rgba(0,0,0,0)] bg-white px-3 py-2 text-[#2a2419] placeholder:text-[#6b6354] transition-all ${
                isReply
                  ? "min-h-[80px] text-[14px] leading-5"
                  : "min-h-[120px] text-[16px] leading-6"
              }`}
              onFocus={(event) => {
                const target = event.currentTarget;
                target.style.minHeight = isReply ? "92px" : "132px";
              }}
              onBlur={(event) => {
                const target = event.currentTarget;
                if (!target.value) {
                  target.style.minHeight = isReply ? "80px" : "120px";
                }
              }}
            />
          </label>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setExpanded(false);
                onCancel?.();
              }}
              className="inline-flex h-8 items-center justify-center rounded-[4px] px-3 text-[14px] leading-5 font-medium text-[#2a2419]"
            >
              Cancel
            </button>
            <SubmitButton />
          </div>
        </>
      )}
      {state.error ? (
        <p className="rounded-[6px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
