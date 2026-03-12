"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { saveDocument } from "@/app/author/actions";
import { MarkdownContent } from "@/components/markdown-content";
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
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [contents, setContents] = useState(document?.contents ?? "");
  const [sourceType, setSourceType] = useState<"book" | "article">(
    document?.sourceType ?? "book",
  );

  return (
    <form action={formAction} className="grid gap-8">
      <input type="hidden" name="documentId" defaultValue={document?.id ?? ""} />

      <div className="surface-card p-6">
        <h2 className="mb-6 text-xl">Entry Details</h2>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="field">
              <span>title</span>
              <input name="title" defaultValue={document?.title ?? ""} required />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field">
              <span>source type</span>
              <select
                name="sourceType"
                value={sourceType}
                onChange={(event) =>
                  setSourceType(event.target.value as "book" | "article")
                }
              >
                <option value="book">book</option>
                <option value="article">article</option>
              </select>
            </label>

            {sourceType === "book" ? (
              <label className="field">
                <span>book title</span>
                <input
                  name="bookTitle"
                  defaultValue={document?.bookTitle ?? ""}
                  placeholder="The book this is from..."
                />
              </label>
            ) : (
              <div />
            )}
          </div>

          <label className="field">
            <span>tags</span>
            <input
              name="tags"
              defaultValue={document?.tags.join(", ") ?? ""}
              placeholder="philosophy, design, writing"
              required
            />
          </label>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">visibility</span>
            <select name="visibility" defaultValue={document?.visibility ?? "private"} className="max-w-[180px]">
              <option value="private">private</option>
              <option value="public">public</option>
            </select>
          </div>
        </div>
      </div>

      <div className="surface-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl">Content</h2>
          <div className="flex gap-2">
            <button
              type="button"
              className={activeTab === "write" ? "button-primary" : "button-secondary"}
              onClick={() => setActiveTab("write")}
            >
              Write
            </button>
            <button
              type="button"
              className={activeTab === "preview" ? "button-primary" : "button-secondary"}
              onClick={() => setActiveTab("preview")}
            >
              Preview
            </button>
          </div>
        </div>

        {activeTab === "write" ? (
          <>
            <textarea
              name="contents"
              value={contents}
              onChange={(event) => setContents(event.target.value)}
              rows={18}
              placeholder="Begin writing... Markdown is supported."
              className="min-h-[520px] resize-none text-lg leading-relaxed"
              required
            />
            <div className="mt-3 text-sm text-muted-foreground">
              Markdown supported: <code># headings</code>, <code>**bold**</code>,{" "}
              <code>*italic*</code>, <code>&gt; quotes</code>, <code>- lists</code>
            </div>
          </>
        ) : (
          <div className="min-h-[520px] rounded-lg border border-border bg-card p-8">
            {contents ? (
              <MarkdownContent contents={contents} />
            ) : (
              <p className="text-muted-foreground italic">
                Nothing to preview yet. Start writing to see your content rendered.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="surface-card px-5 py-5 text-sm leading-7 text-stone-700">
        Published date is set automatically. Writer comes from the logged-in
        user profile.
      </div>

      {state.error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900">
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
