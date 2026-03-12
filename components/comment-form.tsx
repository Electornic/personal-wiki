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
    <button className="button-primary" type="submit" disabled={pending}>
      {pending ? "saving..." : "post comment"}
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
        <span>{parentCommentId ? `reply depth ${depth + 1}` : "comment"}</span>
        <textarea name="contents" rows={4} required />
      </label>
      {state.error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {state.error}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
