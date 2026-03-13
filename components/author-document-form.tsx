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
    <button
      className="inline-flex h-9 items-center justify-center rounded-[4px] bg-[#2a2419] px-4 text-[14px] leading-5 font-medium text-[#faf8f5] disabled:opacity-50"
      type="submit"
      disabled={pending}
    >
      {pending ? "Saving..." : "Publish"}
    </button>
  );
}

function PreviewIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M1.333 8s2.424-4 6.667-4 6.667 4 6.667 4-2.424 4-6.667 4-6.667-4-6.667-4Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="8" cy="8" r="1.75" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function CancelIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M10 3.333 5.333 8 10 12.667"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M6 8h6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function PublishIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M3.333 12.667h9.334"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M8 2.667v7.666"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M5.333 7.667 8 10.333l2.667-2.666"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export function AuthorDocumentForm({ document }: AuthorDocumentFormProps) {
  const [state, formAction] = useActionState<DocumentFormState, FormData>(saveDocument, {});
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [title, setTitle] = useState(document?.title ?? "");
  const [contents, setContents] = useState(document?.contents ?? "");
  const [sourceType, setSourceType] = useState<"book" | "article">(
    document?.sourceType ?? "book",
  );
  const [visibility, setVisibility] = useState<"public" | "private">(
    document?.visibility ?? "private",
  );
  const [bookTitle, setBookTitle] = useState(document?.bookTitle ?? "");
  const [tags, setTags] = useState(document?.tags.join(", ") ?? "");

  return (
    <form action={formAction} className="grid gap-8">
      <input type="hidden" name="documentId" defaultValue={document?.id ?? ""} />
      <input type="hidden" name="visibility" value={visibility} />

      <div className="-mt-8 border-b border-[rgba(42,36,25,0.1)] bg-[rgba(250,248,245,0.95)] px-4 py-3 backdrop-blur-sm sm:px-4 md:px-8">
        <div className="mx-auto flex w-full max-w-[1032px] items-center justify-between">
          <Link
            href="/author"
            className="inline-flex h-8 items-center gap-2 rounded-[4px] px-[10px] text-[14px] leading-5 font-medium text-[#2a2419] transition hover:bg-[rgba(232,227,219,0.45)]"
          >
            <CancelIcon />
            Cancel
          </Link>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-[14px] leading-[14px] font-medium text-[#2a2419]">
              <button
                type="button"
                aria-pressed={visibility === "public"}
                onClick={() =>
                  setVisibility((current) =>
                    current === "public" ? "private" : "public",
                  )
                }
                className={`relative inline-flex h-[18px] w-8 items-center rounded-full border border-transparent ${
                  visibility === "public" ? "bg-[#2a2419]" : "bg-[#d9d2c8]"
                }`}
              >
                <span
                  className={`h-4 w-4 rounded-full bg-white transition-transform ${
                    visibility === "public" ? "translate-x-[14px]" : "translate-x-[1px]"
                  }`}
                />
              </button>
              {visibility === "public" ? "Public" : "Private"}
            </label>
            <div className="inline-flex items-center gap-2 rounded-[4px] bg-[#2a2419] px-3 text-[#faf8f5]">
              <PublishIcon />
              <SubmitButton />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-white px-[24px] py-[24px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.1)] md:px-[25px] md:py-[25px]">
        <h2 className="text-[20px] leading-7 font-semibold tracking-[-0.2px] text-[#2a2419]">
          Entry Details
        </h2>

        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="block text-[14px] leading-[14px] font-medium text-[#2a2419]">
              Title
            </span>
            <input
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Give your entry a title..."
              className="mt-2 h-9 rounded-[4px] border border-transparent bg-white px-3 py-1 text-[14px] leading-normal text-[#2a2419] placeholder:text-[#6b6354] md:text-[20px]"
              required
            />
          </label>

          <div className={`grid gap-4 ${sourceType === "book" ? "md:grid-cols-2" : ""}`}>
            <label className="block">
              <span className="block text-[14px] leading-[14px] font-medium text-[#2a2419]">
                Source Type
              </span>
              <select
                name="sourceType"
                value={sourceType}
                onChange={(event) =>
                  setSourceType(event.target.value as "book" | "article")
                }
                className="mt-2 h-9 rounded-[4px] border border-transparent bg-white px-[13px] py-px text-[14px] leading-5 font-medium text-[#2a2419]"
              >
                <option value="article">Article</option>
                <option value="book">Book</option>
              </select>
            </label>

            {sourceType === "book" ? (
              <label className="block">
                <span className="block text-[14px] leading-[14px] font-medium text-[#2a2419]">
                  Book Title
                </span>
                <input
                  name="bookTitle"
                  value={bookTitle}
                  onChange={(event) => setBookTitle(event.target.value)}
                  placeholder="The book this entry comes from..."
                  className="mt-2 h-9 rounded-[4px] border border-transparent bg-white px-3 py-1 text-[14px] leading-normal text-[#2a2419] placeholder:text-[#6b6354]"
                />
              </label>
            ) : null}
          </div>

          <label className="block">
            <span className="block text-[14px] leading-[14px] font-medium text-[#2a2419]">
              Tags
            </span>
            <input
              name="tags"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="philosophy, design, writing (comma-separated)"
              className="mt-2 h-9 rounded-[4px] border border-transparent bg-white px-3 py-1 text-[16px] leading-normal text-[#2a2419] placeholder:text-[#6b6354]"
              required
            />
            <p className="mt-2 text-[12px] leading-4 text-[#6b6354]">
              Separate tags with commas to help readers discover related entries
            </p>
          </label>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] leading-7 font-semibold tracking-[-0.2px] text-[#2a2419]">
            Content
          </h2>
          <div className="rounded-[10px] bg-[#e8e3db] p-[3px]">
            <div className="flex items-center">
              <button
                type="button"
                className={`inline-flex h-[29px] items-center justify-center rounded-[10px] px-[9px] text-[14px] leading-5 font-medium ${
                  activeTab === "write" ? "bg-white text-[#2a2419]" : "text-[#2a2419]"
                }`}
                onClick={() => setActiveTab("write")}
              >
                Write
              </button>
              <button
                type="button"
                className={`inline-flex h-[29px] items-center justify-center gap-1.5 rounded-[10px] px-[9px] text-[14px] leading-5 font-medium ${
                  activeTab === "preview" ? "bg-white text-[#2a2419]" : "text-[#2a2419]"
                }`}
                onClick={() => setActiveTab("preview")}
              >
                <PreviewIcon />
                Preview
              </button>
            </div>
          </div>
        </div>

        {activeTab === "write" ? (
          <div className="space-y-3">
            <textarea
              name="contents"
              value={contents}
              onChange={(event) => setContents(event.target.value)}
              rows={18}
              placeholder="Begin writing... Markdown is supported."
              className="min-h-[600px] rounded-[4px] border border-transparent bg-white px-3 py-2 text-[18px] leading-[29.25px] text-[#2a2419] placeholder:text-[#6b6354]"
              required
            />
            <p className="text-[18px] leading-[32.4px] text-[#6b6354]">
              Markdown supported: **bold**, *italic*, # headings, &gt;
              blockquotes, - lists
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="min-h-[600px] rounded-[4px] border border-transparent bg-white px-6 py-6">
              {contents ? (
                <MarkdownContent contents={contents} />
              ) : (
                <p className="text-[18px] leading-[29.25px] text-[#6b6354]">
                  Nothing to preview yet.
                </p>
              )}
            </div>
            <p className="text-[18px] leading-[32.4px] text-[#6b6354]">
              Markdown supported: **bold**, *italic*, # headings, &gt;
              blockquotes, - lists
            </p>
          </div>
        )}
      </div>

      <div className="rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-white px-5 py-5 text-sm leading-7 text-stone-700">
        Published date is set automatically. Writer comes from the logged-in
        user profile.
      </div>

      {state.error ? (
        <p className="rounded-[6px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
