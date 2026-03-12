"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createCommentAction } from "@/app/library/actions";

type CommentFormProps = {
  recordId: string;
  recordSlug: string;
  parentCommentId?: string | null;
  depth?: number;
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
}: CommentFormProps) {
  const [state, formAction] = useActionState(createCommentAction, {});

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="recordId" value={recordId} />
      <input type="hidden" name="recordSlug" value={recordSlug} />
      <input type="hidden" name="parentCommentId" value={parentCommentId ?? ""} />
      <label className="field">
        <span className="sr-only">
          {parentCommentId ? `reply depth ${depth + 1}` : "comment"}
        </span>
        <textarea
          name="contents"
          rows={parentCommentId ? 3 : 4}
          required
          placeholder={parentCommentId ? "Write a reply..." : "Leave a comment..."}
          className="min-h-[104px] rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-white px-4 py-3 text-[16px] leading-[26px] text-[#2a2419] placeholder:text-[#8b8173]"
        />
      </label>
      {state.error ? (
        <p className="rounded-[6px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {state.error}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
