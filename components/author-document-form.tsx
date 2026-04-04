"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { saveDocument } from "@/app/author/actions";
import type { DocumentFormState, WikiDocument } from "@/entities/record/model/types";
import { MarkdownContent } from "@/entities/record/ui/markdown-content";
import {
  buildLocalImageToken,
  buildStagedImageFileName,
  getRecordImageAltText,
  isRecordImageMimeType,
  RECORD_IMAGE_MAX_BYTES,
  RECORD_IMAGE_MAX_TOTAL_BYTES,
} from "@/lib/wiki/record-images";

type AuthorDocumentFormProps = {
  document?: WikiDocument;
};

type StagedImage = {
  id: string;
  token: string;
  file: File;
  previewUrl: string;
};

function SubmitButton({ visibility }: { visibility: "public" | "private" }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex h-9 items-center justify-center rounded-[4px] bg-[var(--foreground)] px-4 text-[14px] leading-5 font-medium text-[var(--accent-text)] disabled:opacity-50"
      type="submit"
      disabled={pending}
    >
      {pending ? "Saving..." : visibility === "public" ? "Publish Record" : "Save Draft"}
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
      className="h-4 w-4 text-[var(--muted)]"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

const starterTemplates = {
  article: `## What it argues

## Points worth keeping

## Connected thoughts

- `,
  book: `## Why this book matters

## Ideas to keep

## Memorable passages

> Quote

## Connected thoughts

- `,
} as const;

const reflectionTemplate = `## Questions to push further

- What stayed with me?
- What do I want to revisit?
- What would I connect this to next?`;

const markdownTips = [
  "Headings shape the reading flow.",
  "Preview uses the same markdown renderer as the public page.",
  "Images stay local until save, then upload into private storage.",
  "Short, explicit tags keep recommendation quality stable.",
];

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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [stagedImages, setStagedImages] = useState<StagedImage[]>([]);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const stagedFileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const stagedImagesRef = useRef<StagedImage[]>([]);
  const wordCount = contents.trim() ? contents.trim().split(/\s+/).length : 0;
  const lineCount = contents ? contents.split(/\r?\n/).length : 0;

  useEffect(() => {
    stagedImagesRef.current = stagedImages;
  }, [stagedImages]);

  useEffect(() => {
    const stagedInput = stagedFileInputRef.current;

    if (!stagedInput) {
      return;
    }

    const transfer = new DataTransfer();

    stagedImages.forEach((image) => {
      transfer.items.add(image.file);
    });

    stagedInput.files = transfer.files;
  }, [stagedImages]);

  useEffect(() => {
    return () => {
      stagedImagesRef.current.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });
    };
  }, []);

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

  function insertImage() {
    updateContentsFromTextarea((currentValue, selectionStart, selectionEnd) => {
      const selected = currentValue.slice(selectionStart, selectionEnd).trim() || "Describe image";
      const inserted = `![${selected}](https://example.com/image.jpg)`;
      const nextValue =
        currentValue.slice(0, selectionStart) +
        inserted +
        currentValue.slice(selectionEnd);

      return {
        nextValue,
        nextSelectionStart: selectionStart + 2,
        nextSelectionEnd: selectionStart + 2 + selected.length,
      };
    });
  }

  function insertStagedImages(items: Array<{ alt: string; token: string }>) {
    if (items.length === 0) {
      return;
    }

    updateContentsFromTextarea((currentValue, selectionStart, selectionEnd) => {
      const inserted = items
        .map((item) => `![${item.alt}](${item.token})`)
        .join("\n\n");
      const prefix =
        currentValue.length > 0 && !currentValue.slice(0, selectionStart).endsWith("\n\n")
          ? "\n\n"
          : "";
      const suffix =
        currentValue.length > selectionEnd && !currentValue.slice(selectionEnd).startsWith("\n\n")
          ? "\n\n"
          : "";
      const nextValue =
        currentValue.slice(0, selectionStart) +
        prefix +
        inserted +
        suffix +
        currentValue.slice(selectionEnd);
      const start = selectionStart + prefix.length;

      return {
        nextValue,
        nextSelectionStart: start,
        nextSelectionEnd: start + inserted.length,
      };
    });
  }

  function stageImages(files: File[]) {
    if (files.length === 0) {
      return;
    }

    setUploadError(null);

    try {
      const nextImages: StagedImage[] = [];
      const nextInsertions: Array<{ alt: string; token: string }> = [];

      const stagedTotalBytes = stagedImages.reduce((total, image) => total + image.file.size, 0);
      const incomingTotalBytes = files.reduce((total, file) => total + file.size, 0);

      if (stagedTotalBytes + incomingTotalBytes > RECORD_IMAGE_MAX_TOTAL_BYTES) {
        throw new Error("Total staged image size must stay within 20MB.");
      }

      for (const file of files) {
        if (!isRecordImageMimeType(file.type)) {
          throw new Error("Only JPG, PNG, and WebP images are supported.");
        }

        if (file.size > RECORD_IMAGE_MAX_BYTES) {
          throw new Error("Images must be 10MB or smaller.");
        }

        const id = crypto.randomUUID();
        const token = buildLocalImageToken(id);
        const stagedFile = new File(
          [file],
          buildStagedImageFileName(id, file.type),
          { type: file.type },
        );
        const previewUrl = URL.createObjectURL(file);

        nextImages.push({
          id,
          token,
          file: stagedFile,
          previewUrl,
        });
        nextInsertions.push({
          alt: getRecordImageAltText(file.name),
          token,
        });
      }

      insertStagedImages(nextInsertions);
      setStagedImages((current) => [...current, ...nextImages]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Image staging failed.");
    }
  }

  function handleFileInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    stageImages(files);
    event.currentTarget.value = "";
  }

  function handlePaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const files = Array.from(event.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile())
      .filter((file): file is File => Boolean(file));

    if (files.length === 0) {
      return;
    }

    event.preventDefault();
    stageImages(files);
  }

  function handleDrop(event: React.DragEvent<HTMLTextAreaElement>) {
    event.preventDefault();
    setIsDraggingImage(false);

    const files = Array.from(event.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/"),
    );

    stageImages(files);
  }

  function insertTemplate(template: string) {
    updateContentsFromTextarea((currentValue) => {
      const trimmedValue = currentValue.trimEnd();
      const nextValue = trimmedValue ? `${trimmedValue}\n\n${template}` : template;
      const caret = nextValue.length;

      return {
        nextValue,
        nextSelectionStart: caret,
        nextSelectionEnd: caret,
      };
    });
  }

  return (
    <form action={formAction} className="grid gap-8">
      <input type="hidden" name="documentId" defaultValue={document?.id ?? ""} />
      <input type="hidden" name="visibility" value={visibility} />
      <input
        type="hidden"
        name="stagedImageIds"
        value={JSON.stringify(stagedImages.map((image) => image.id))}
      />
      {stagedImages.length > 0 ? (
        <input
          ref={stagedFileInputRef}
          type="file"
          name="stagedImages"
          multiple
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
        />
      ) : null}

      <div className="-mt-8 border-b border-[rgba(42,36,25,0.1)] bg-[rgba(250,248,245,0.95)] py-3 backdrop-blur-sm">
        <div className="mx-auto flex w-full items-center justify-between">
          <Link
            href="/author"
            className="inline-flex h-8 items-center gap-2 rounded-[4px] px-[10px] text-[14px] leading-5 font-medium text-[var(--foreground)] transition hover:bg-[rgba(232,227,219,0.45)]"
          >
            <CancelIcon />
            Cancel
          </Link>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-[14px] leading-[14px] font-medium text-[var(--foreground)]">
              <button
                type="button"
                aria-pressed={visibility === "public"}
                onClick={() =>
                  setVisibility((current) =>
                    current === "public" ? "private" : "public",
                  )
                }
                className={`relative inline-flex h-[18px] w-8 items-center rounded-full border border-transparent ${
                  visibility === "public" ? "bg-[var(--foreground)]" : "bg-[var(--surface-warm)]"
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
            <div className="inline-flex items-center gap-2 rounded-[4px] bg-[var(--foreground)] px-3 text-[var(--accent-text)]">
              <PublishIcon />
              <SubmitButton visibility={visibility} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-white px-[24px] py-[24px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.1)] md:px-[25px] md:py-[25px]">
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
              className="mt-2 h-9 rounded-[4px] border border-transparent bg-white px-3 py-1 text-[14px] leading-normal text-[var(--foreground)] placeholder:text-[var(--muted)] md:text-[20px]"
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
                  className="h-9 appearance-none rounded-[4px] border border-transparent bg-white px-[13px] pr-10 py-px text-[14px] leading-5 font-medium text-transparent"
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
                  className="mt-2 h-9 rounded-[4px] border border-transparent bg-white px-3 py-1 text-[14px] leading-normal text-[var(--foreground)] placeholder:text-[var(--muted)]"
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
              className="mt-2 h-9 rounded-[4px] border border-transparent bg-white px-3 py-1 text-[16px] leading-normal text-[var(--foreground)] placeholder:text-[var(--muted)]"
              required
            />
            <p className="mt-2 text-[12px] leading-4 text-[var(--muted)]">
              Separate tags with commas to help readers discover related entries
            </p>
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-[10px] bg-[var(--surface-warm)] p-[3px] w-fit">
          <div className="flex items-center">
            <button
              type="button"
              className={`inline-flex h-[29px] items-center justify-center gap-1.5 rounded-[10px] px-[9px] text-[14px] leading-5 font-medium ${
                activeTab === "write" ? "bg-white text-[var(--foreground)]" : "text-[var(--foreground)]"
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
                activeTab === "preview" ? "bg-white text-[var(--foreground)]" : "text-[var(--foreground)]"
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
            <div className="rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-[rgba(250,248,245,0.96)] px-4 py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-[14px] leading-5 font-medium text-[var(--foreground)]">
                    Writing support
                  </p>
                  <p className="mt-1 text-[13px] leading-5 text-[var(--muted)]">
                    Use a starter when you want structure without leaving the writing flow.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => insertTemplate(starterTemplates[sourceType])}
                    className="inline-flex h-8 items-center justify-center rounded-[4px] border border-[rgba(42,36,25,0.1)] bg-white px-3 text-[12px] leading-4 font-medium text-[var(--foreground)] hover:bg-[rgba(232,227,219,0.35)]"
                  >
                    Insert starter outline
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTemplate(reflectionTemplate)}
                    className="inline-flex h-8 items-center justify-center rounded-[4px] border border-[rgba(42,36,25,0.1)] bg-white px-3 text-[12px] leading-4 font-medium text-[var(--foreground)] hover:bg-[rgba(232,227,219,0.35)]"
                  >
                    Insert reflection prompts
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[12px] leading-4 text-[var(--muted)]">
                {markdownTips.map((tip) => (
                  <span key={tip}>{tip}</span>
                ))}
              </div>
            </div>
            <div className="rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-[rgba(232,227,219,0.3)] px-2 py-2">
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertBlock((selected) => `# ${selected}`, "Heading")}
                  className="inline-flex h-8 items-center justify-center rounded-[4px] px-3 text-[12px] leading-4 font-medium text-[var(--foreground)] hover:bg-white"
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => insertBlock((selected) => `## ${selected}`, "Heading")}
                  className="inline-flex h-8 items-center justify-center rounded-[4px] px-3 text-[12px] leading-4 font-medium text-[var(--foreground)] hover:bg-white"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertBlock((selected) => `### ${selected}`, "Heading")}
                  className="inline-flex h-8 items-center justify-center rounded-[4px] px-3 text-[12px] leading-4 font-medium text-[var(--foreground)] hover:bg-white"
                >
                  H3
                </button>
                <div className="mx-1 h-6 w-px bg-[rgba(42,36,25,0.1)]" />
                <button
                  type="button"
                  onClick={() => wrapSelection("**")}
                  className="inline-flex h-8 items-center justify-center rounded-[4px] px-3 text-[12px] leading-4 font-semibold text-[var(--foreground)] hover:bg-white"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => wrapSelection("*")}
                  className="inline-flex h-8 items-center justify-center rounded-[4px] px-3 text-[12px] leading-4 italic text-[var(--foreground)] hover:bg-white"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => insertBlock((selected) => `> ${selected}`, "Quote")}
                  className="inline-flex h-8 items-center justify-center rounded-[4px] px-3 text-[12px] leading-4 text-[var(--foreground)] hover:bg-white"
                >
                  “”
                </button>
                <div className="mx-1 h-6 w-px bg-[rgba(42,36,25,0.1)]" />
                <button
                  type="button"
                  onClick={() => insertList("- ", "List item")}
                  className="inline-flex h-8 items-center justify-center rounded-[4px] px-3 text-[12px] leading-4 text-[var(--foreground)] hover:bg-white"
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={() => insertList("1. ", "List item")}
                  className="inline-flex h-8 items-center justify-center rounded-[4px] px-3 text-[12px] leading-4 text-[var(--foreground)] hover:bg-white"
                >
                  1. List
                </button>
                <div className="mx-1 h-6 w-px bg-[rgba(42,36,25,0.1)]" />
                <button
                  type="button"
                  onClick={insertLink}
                  className="inline-flex h-8 items-center justify-center rounded-[4px] px-3 text-[12px] leading-4 text-[var(--foreground)] hover:bg-white"
                >
                  Link
                </button>
                <button
                  type="button"
                  onClick={insertImage}
                  className="inline-flex h-8 items-center justify-center rounded-[4px] px-3 text-[12px] leading-4 text-[var(--foreground)] hover:bg-white"
                >
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex h-8 items-center justify-center rounded-[4px] px-3 text-[12px] leading-4 text-[var(--foreground)] hover:bg-white"
                >
                  Upload
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] leading-4 text-[var(--muted)]">
              <span>{wordCount} words</span>
              <span>{lineCount} lines</span>
              <span>{stagedImages.length} staged image{stagedImages.length === 1 ? "" : "s"}</span>
              <span>Drag, drop, or paste images directly into the editor.</span>
            </div>
            <textarea
              ref={textareaRef}
              name="contents"
              value={contents}
              onChange={(event) => setContents(event.target.value)}
              onPaste={handlePaste}
              onDragOver={(event) => {
                event.preventDefault();
                if (!isDraggingImage) {
                  setIsDraggingImage(true);
                }
              }}
              onDragLeave={() => setIsDraggingImage(false)}
              onDrop={handleDrop}
              rows={18}
              placeholder="Begin writing your thoughts..."
              className={`min-h-[600px] rounded-[4px] border px-3 py-2 text-[18px] leading-[29.25px] text-[var(--foreground)] placeholder:text-[var(--muted)] ${
                isDraggingImage
                  ? "border-dashed border-[var(--foreground)] bg-[rgba(232,227,219,0.28)]"
                  : "border-transparent bg-white"
              }`}
              required
            />
            {uploadError ? (
              <p className="rounded-[6px] border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] leading-5 text-rose-900">
                {uploadError}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="min-h-[600px] rounded-[4px] border border-transparent bg-white px-6 py-6">
              {contents ? (
                <MarkdownContent
                  contents={contents}
                  imageUrlOverrides={Object.fromEntries(
                    stagedImages.map((image) => [image.token, image.previewUrl]),
                  )}
                />
              ) : (
                <p className="text-[18px] leading-[29.25px] text-[var(--muted)]">
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
