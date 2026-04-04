"use client";

import { useState } from "react";

import type { WikiDocument } from "@/entities/record/model/types";

type AuthorDocumentMetadataProps = {
  document?: WikiDocument;
};

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 text-[var(--muted)]"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function AuthorDocumentMetadata({ document }: AuthorDocumentMetadataProps) {
  const [title, setTitle] = useState(document?.title ?? "");
  const [sourceType, setSourceType] = useState<"book" | "article">(
    document?.sourceType ?? "book",
  );
  const [bookTitle, setBookTitle] = useState(document?.bookTitle ?? "");
  const [tags, setTags] = useState(document?.tags.join(", ") ?? "");

  return (
    <div className="rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-white px-4 py-4 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.1)] md:px-[24px] md:py-[24px]">
      <div className="space-y-5">
        <label className="block">
          <span className="block text-[16px] leading-6 font-medium text-[var(--foreground)]">
            Title
          </span>
          <input
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Give your entry a title..."
            className="mt-2 h-9 rounded-[4px] border border-[rgba(42,36,25,0.12)] bg-white px-3 py-1 text-[14px] leading-normal text-[var(--foreground)] placeholder:text-[var(--muted)] md:text-[20px]"
            required
          />
        </label>

        <div className={`grid gap-4 ${sourceType === "book" ? "md:grid-cols-2" : ""}`}>
          <label className="block">
            <span className="block text-[14px] leading-[14px] font-medium text-[var(--foreground)]">
              Source Type
            </span>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute inset-y-0 left-[13px] flex items-center text-[14px] leading-5 font-medium text-[var(--foreground)]">
                {sourceType === "article" ? "Article" : "Book"}
              </span>
              <select
                name="sourceType"
                value={sourceType}
                onChange={(event) =>
                  setSourceType(event.target.value as "book" | "article")
                }
                className="h-9 appearance-none rounded-[4px] border border-[rgba(42,36,25,0.12)] bg-white px-[13px] pr-10 py-px text-[14px] leading-5 font-medium text-transparent"
              >
                <option value="article">Article</option>
                <option value="book">Book</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <ChevronDownIcon />
              </span>
            </div>
          </label>

          {sourceType === "book" ? (
            <label className="block">
              <span className="block text-[14px] leading-[14px] font-medium text-[var(--foreground)]">
                Book Title
              </span>
              <input
                name="bookTitle"
                value={bookTitle}
                onChange={(event) => setBookTitle(event.target.value)}
                placeholder="The book this entry comes from..."
                className="mt-2 h-9 rounded-[4px] border border-[rgba(42,36,25,0.12)] bg-white px-3 py-1 text-[14px] leading-normal text-[var(--foreground)] placeholder:text-[var(--muted)]"
              />
            </label>
          ) : null}
        </div>

        <label className="block">
          <span className="block text-[14px] leading-[14px] font-medium text-[var(--foreground)]">
            Tags
          </span>
          <input
            name="tags"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="philosophy, design, writing (comma-separated)"
            className="mt-2 h-9 rounded-[4px] border border-[rgba(42,36,25,0.12)] bg-white px-3 py-1 text-[16px] leading-normal text-[var(--foreground)] placeholder:text-[var(--muted)]"
            required
          />
          <p className="mt-2 text-[12px] leading-4 text-[var(--muted)]">
            Separate tags with commas to help readers discover related entries
          </p>
        </label>
      </div>
    </div>
  );
}
