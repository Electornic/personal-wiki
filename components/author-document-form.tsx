"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
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

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 text-[#6b6354]"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.2" />
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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function updateContentsFromTextarea(
    updater: (currentValue: string, selectionStart: number, selectionEnd: number) => {
      nextValue: string;
      nextSelectionStart?: number;
      nextSelectionEnd?: number;
    },
  ) {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const selectionStart = textarea.selectionStart ?? contents.length;
    const selectionEnd = textarea.selectionEnd ?? contents.length;
    const { nextValue, nextSelectionStart, nextSelectionEnd } = updater(
      contents,
      selectionStart,
      selectionEnd,
    );

    setContents(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        nextSelectionStart ?? selectionStart,
        nextSelectionEnd ?? selectionEnd,
      );
    });
  }

  function wrapSelection(prefix: string, suffix = prefix, placeholder = "text") {
    updateContentsFromTextarea((currentValue, selectionStart, selectionEnd) => {
      const selected = currentValue.slice(selectionStart, selectionEnd) || placeholder;
      const nextValue =
        currentValue.slice(0, selectionStart) +
        prefix +
        selected +
        suffix +
        currentValue.slice(selectionEnd);

      const start = selectionStart + prefix.length;
      const end = start + selected.length;

      return { nextValue, nextSelectionStart: start, nextSelectionEnd: end };
    });
  }

  function insertBlock(
    formatter: (selected: string) => string,
    placeholder: string,
  ) {
    updateContentsFromTextarea((currentValue, selectionStart, selectionEnd) => {
      const blockStart =
        currentValue.lastIndexOf("\n", Math.max(0, selectionStart - 1)) + 1;
      const blockEndIndex = currentValue.indexOf("\n", selectionEnd);
      const blockEnd =
        blockEndIndex === -1 ? currentValue.length : blockEndIndex;
      const selected =
        currentValue.slice(blockStart, blockEnd).trim() || placeholder;
      const before = currentValue.slice(0, blockStart);
      const after = currentValue.slice(blockEnd);
      const needsLeadingBreak =
        before.length > 0 && !before.endsWith("\n\n");
      const needsTrailingBreak =
        after.length > 0 && !after.startsWith("\n\n");
      const leading = needsLeadingBreak
        ? before.endsWith("\n")
          ? "\n"
          : "\n\n"
        : "";
      const trailing = needsTrailingBreak
        ? after.startsWith("\n")
          ? "\n"
          : "\n\n"
        : "";
      const inserted = formatter(selected);
      const nextValue = before + leading + inserted + trailing + after;
      const nextStart = (before + leading).length;

      return {
        nextValue,
        nextSelectionStart: nextStart,
        nextSelectionEnd: nextStart + inserted.length,
      };
    });
  }

  function insertList(marker: "- " | "1. ", placeholder: string) {
    insertBlock((selected) => {
      const lines = selected.split("\n").map((line) => `${marker}${line}`);
      return lines.join("\n");
    }, placeholder);
  }

  function insertLink() {
    updateContentsFromTextarea((currentValue, selectionStart, selectionEnd) => {
      const selected = currentValue.slice(selectionStart, selectionEnd) || "link text";
      const inserted = `[${selected}](https://example.com)`;
      const nextValue =
        currentValue.slice(0, selectionStart) +
        inserted +
        currentValue.slice(selectionEnd);

      return {
        nextValue,
        nextSelectionStart: selectionStart + 1,
        nextSelectionEnd: selectionStart + 1 + selected.length,
      };
    });
  }

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
        <div className="space-y-5">
          <label className="block">
            <span className="block text-[16px] leading-6 font-medium text-[#2a2419]">
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
              <div className="relative mt-2">
                <select
                  name="sourceType"
                  value={sourceType}
                  onChange={(event) =>
                    setSourceType(event.target.value as "book" | "article")
                  }
                  className="h-9 appearance-none rounded-[4px] border border-transparent bg-white px-[13px] pr-10 py-px text-[14px] leading-5 font-medium text-[#2a2419]"
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

      <div className="space-y-3">
        <div className="rounded-[10px] bg-[#e8e3db] p-[3px] w-fit">
          <div className="flex items-center">
            <button
              type="button"
              className={`inline-flex h-[29px] items-center justify-center gap-1.5 rounded-[10px] px-[9px] text-[14px] leading-5 font-medium ${
                activeTab === "write" ? "bg-white text-[#2a2419]" : "text-[#2a2419]"
              }`}
              onClick={() => setActiveTab("write")}
            >
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
                <path
                  d="M10.667 2.667 13.333 5.333 6 12.667 3.333 13.333 4 10.667l6.667-8Z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path d="m9.333 4 2.667 2.667" stroke="currentColor" strokeWidth="1.2" />
              </svg>
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

        {activeTab === "write" ? (
          <div className="space-y-3">
            <div className="rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-[rgba(232,227,219,0.3)] px-2 py-2">
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertBlock((selected) => `# ${selected}`, "Heading")}
                  className="inline-flex h-8 items-center justify-center rounded-[4px] px-3 text-[12px] leading-4 font-medium text-[#2a2419] hover:bg-white"
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => insertBlock((selected) => `## ${selected}`, "Heading")}
                  className="inline-flex h-8 items-center justify-center rounded-[4px] px-3 text-[12px] leading-4 font-medium text-[#2a2419] hover:bg-white"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertBlock((selected) => `### ${selected}`, "Heading")}
                  className="inline-flex h-8 items-center justify-center rounded-[4px] px-3 text-[12px] leading-4 font-medium text-[#2a2419] hover:bg-white"
                >
                  H3
                </button>
                <div className="mx-1 h-6 w-px bg-[rgba(42,36,25,0.1)]" />
                <button
                  type="button"
                  onClick={() => wrapSelection("**")}
                  className="inline-flex h-8 items-center justify-center rounded-[4px] px-3 text-[12px] leading-4 font-semibold text-[#2a2419] hover:bg-white"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => wrapSelection("*")}
                  className="inline-flex h-8 items-center justify-center rounded-[4px] px-3 text-[12px] leading-4 italic text-[#2a2419] hover:bg-white"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => insertBlock((selected) => `> ${selected}`, "Quote")}
                  className="inline-flex h-8 items-center justify-center rounded-[4px] px-3 text-[12px] leading-4 text-[#2a2419] hover:bg-white"
                >
                  “”
                </button>
                <div className="mx-1 h-6 w-px bg-[rgba(42,36,25,0.1)]" />
                <button
                  type="button"
                  onClick={() => insertList("- ", "List item")}
                  className="inline-flex h-8 items-center justify-center rounded-[4px] px-3 text-[12px] leading-4 text-[#2a2419] hover:bg-white"
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={() => insertList("1. ", "List item")}
                  className="inline-flex h-8 items-center justify-center rounded-[4px] px-3 text-[12px] leading-4 text-[#2a2419] hover:bg-white"
                >
                  1. List
                </button>
                <div className="mx-1 h-6 w-px bg-[rgba(42,36,25,0.1)]" />
                <button
                  type="button"
                  onClick={insertLink}
                  className="inline-flex h-8 items-center justify-center rounded-[4px] px-3 text-[12px] leading-4 text-[#2a2419] hover:bg-white"
                >
                  Link
                </button>
              </div>
            </div>
            <textarea
              ref={textareaRef}
              name="contents"
              value={contents}
              onChange={(event) => setContents(event.target.value)}
              rows={18}
              placeholder="Begin writing your thoughts..."
              className="min-h-[600px] rounded-[4px] border border-transparent bg-white px-3 py-2 text-[18px] leading-[29.25px] text-[#2a2419] placeholder:text-[#6b6354]"
              required
            />
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
          </div>
        )}
      </div>

      {state.error ? (
        <p className="rounded-[6px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
