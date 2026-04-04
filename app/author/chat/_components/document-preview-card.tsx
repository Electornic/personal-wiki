"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { saveChatDocument } from "@/app/author/chat/_lib/actions";

export interface DocumentProposal {
  type: "document_proposal";
  title: string;
  source_type: "book" | "article";
  book_title?: string;
  tags: string[];
  contents: string;
  visibility: "public" | "private";
}

interface DocumentPreviewCardProps {
  proposal: DocumentProposal;
}

export function DocumentPreviewCard({ proposal }: DocumentPreviewCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(proposal.title);
  const [tags, setTags] = useState(proposal.tags.join(", "));
  const [contents, setContents] = useState(proposal.contents);
  const [sourceType, setSourceType] = useState(proposal.source_type);
  const [bookTitle, setBookTitle] = useState(proposal.book_title ?? "");
  const [visibility, setVisibility] = useState(proposal.visibility);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await saveChatDocument({
        title,
        source_type: sourceType,
        book_title: sourceType === "book" ? bookTitle : undefined,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        contents,
        visibility,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.slug) {
        const query = visibility === "private" ? "?preview=1" : "";
        router.push(`/library/${result.slug}${query}`);
      }
    });
  }

  return (
    <div className="rounded-[6px] border border-[rgba(42,36,25,0.12)] bg-white shadow-[0px_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-2 border-b border-[rgba(42,36,25,0.08)] px-4 py-3">
        <p className="text-[12px] font-medium tracking-wide text-[var(--muted)] uppercase">
          Document Preview
        </p>
        <span className="rounded-full bg-[#f0ece6] px-2 py-0.5 text-[11px] font-medium text-[var(--muted)]">
          {sourceType === "book" ? "Book" : "Article"}
        </span>
        {sourceType === "book" && bookTitle && (
          <span className="truncate text-[12px] text-[var(--muted)]">
            from {bookTitle}
          </span>
        )}
      </div>

      <div className="space-y-4 px-4 py-4">
        <Field label="Title">
          <input
            className="h-9 w-full rounded-[4px] border border-[rgba(42,36,25,0.12)] bg-[var(--background)] px-3 text-[14px] text-[var(--foreground)] outline-none focus:border-[rgba(42,36,25,0.3)] focus:shadow-[0_0_0_1px_rgba(42,36,25,0.1)]"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type">
            <select
              className="h-9 w-full rounded-[4px] border border-[rgba(42,36,25,0.12)] bg-[var(--background)] px-3 text-[14px] text-[var(--foreground)] outline-none focus:border-[rgba(42,36,25,0.3)]"
              onChange={(e) => setSourceType(e.target.value as "book" | "article")}
              value={sourceType}
            >
              <option value="article">Article</option>
              <option value="book">Book</option>
            </select>
          </Field>

          <Field label="Visibility">
            <select
              className="h-9 w-full rounded-[4px] border border-[rgba(42,36,25,0.12)] bg-[var(--background)] px-3 text-[14px] text-[var(--foreground)] outline-none focus:border-[rgba(42,36,25,0.3)]"
              onChange={(e) => setVisibility(e.target.value as "public" | "private")}
              value={visibility}
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </Field>
        </div>

        {sourceType === "book" && (
          <Field label="Book Title">
            <input
              className="h-9 w-full rounded-[4px] border border-[rgba(42,36,25,0.12)] bg-[var(--background)] px-3 text-[14px] text-[var(--foreground)] outline-none focus:border-[rgba(42,36,25,0.3)] focus:shadow-[0_0_0_1px_rgba(42,36,25,0.1)]"
              onChange={(e) => setBookTitle(e.target.value)}
              value={bookTitle}
            />
          </Field>
        )}

        <Field label="Tags">
          <input
            className="h-9 w-full rounded-[4px] border border-[rgba(42,36,25,0.12)] bg-[var(--background)] px-3 text-[14px] text-[var(--foreground)] outline-none focus:border-[rgba(42,36,25,0.3)] focus:shadow-[0_0_0_1px_rgba(42,36,25,0.1)]"
            onChange={(e) => setTags(e.target.value)}
            placeholder="Separate with commas"
            value={tags}
          />
        </Field>

        <Field label="Contents">
          <textarea
            className="min-h-[120px] w-full rounded-[4px] border border-[rgba(42,36,25,0.12)] bg-[var(--background)] px-3 py-2 text-[14px] leading-relaxed text-[var(--foreground)] outline-none focus:border-[rgba(42,36,25,0.3)] focus:shadow-[0_0_0_1px_rgba(42,36,25,0.1)]"
            onChange={(e) => setContents(e.target.value)}
            value={contents}
          />
        </Field>

        {error && (
          <p className="text-[13px] text-red-600">{error}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-[rgba(42,36,25,0.08)] px-4 py-3">
        <button
          className="h-9 rounded-[4px] bg-[var(--foreground)] px-4 text-[13px] font-medium text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-50"
          disabled={isPending || !title.trim()}
          onClick={handleSave}
          type="button"
        >
          {isPending ? "Saving..." : "Save to Library"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-[var(--muted)]">{label}</span>
      {children}
    </label>
  );
}
