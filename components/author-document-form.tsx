"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { saveDocument } from "@/app/author/actions";
import type { DocumentFormState, WikiDocument } from "@/lib/wiki/types";

type AuthorDocumentFormProps = {
  document?: WikiDocument;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button-primary" type="submit" disabled={pending}>
      {pending ? "saving..." : "save document"}
    </button>
  );
}

export function AuthorDocumentForm({ document }: AuthorDocumentFormProps) {
  const [state, formAction] = useActionState<DocumentFormState, FormData>(saveDocument, {});

  return (
    <form action={formAction} className="grid gap-6 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_28px_80px_rgba(51,39,18,0.08)]">
      <input type="hidden" name="documentId" defaultValue={document?.id ?? ""} />

      <div className="grid gap-6 md:grid-cols-2">
        <label className="field">
          <span>title</span>
          <input name="title" defaultValue={document?.title ?? ""} required />
        </label>
        <label className="field">
          <span>source type</span>
          <select name="sourceType" defaultValue={document?.sourceType ?? "book"}>
            <option value="book">book</option>
            <option value="article">article</option>
          </select>
        </label>
        <label className="field">
          <span>visibility</span>
          <select name="visibility" defaultValue={document?.visibility ?? "private"}>
            <option value="private">private</option>
            <option value="public">public</option>
          </select>
        </label>
        <label className="field">
          <span>book title</span>
          <input
            name="bookTitle"
            defaultValue={document?.bookTitle ?? ""}
            placeholder="book인 경우에만 입력"
          />
        </label>
        <label className="field md:col-span-2">
          <span>tags</span>
          <input
            name="tags"
            defaultValue={document?.tags.join(", ") ?? ""}
            placeholder="creativity, practice, notes"
            required
          />
        </label>
        <label className="field md:col-span-2">
          <span>contents (markdown)</span>
          <textarea
            name="contents"
            defaultValue={document?.contents ?? ""}
            rows={14}
            placeholder="# Heading&#10;&#10;Write the record in markdown."
            required
          />
        </label>
      </div>

      <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 px-5 py-5 text-sm leading-7 text-stone-700">
        Published date is set automatically. Writer comes from the logged-in
        user profile.
      </div>

      {state.error ? (
        <p className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <SubmitButton />
        <Link className="button-secondary" href="/author">
          back to workspace
        </Link>
      </div>
    </form>
  );
}
