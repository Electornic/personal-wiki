"use client";

import { useRef, useState } from "react";

import { MarkdownContent } from "@/entities/record/ui/markdown-content";
import {
  buildLocalImageToken,
  buildStagedImageFileName,
  getRecordImageAltText,
  isRecordImageMimeType,
  RECORD_IMAGE_MAX_BYTES,
  RECORD_IMAGE_MAX_TOTAL_BYTES,
} from "@/lib/wiki/record-images";

export type StagedImage = {
  id: string;
  token: string;
  file: File;
  previewUrl: string;
};

type AuthorDocumentEditorProps = {
  initialContents: string;
  stagedImages: StagedImage[];
  onStagedImagesChange: (updater: (current: StagedImage[]) => StagedImage[]) => void;
};

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

export function AuthorDocumentEditor({
  initialContents,
  stagedImages,
  onStagedImagesChange,
}: AuthorDocumentEditorProps) {
  const [contents, setContents] = useState(initialContents);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const wordCount = contents.trim() ? contents.trim().split(/\s+/).length : 0;
  const lineCount = contents ? contents.split(/\r?\n/).length : 0;

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
      onStagedImagesChange((current) => [...current, ...nextImages]);
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

  return (
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
          <div className="rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-[rgba(232,227,219,0.3)] px-2 py-2">
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => insertBlock((selected) => `# ${selected}`, "Heading")}
                className="inline-flex h-10 items-center justify-center rounded-[4px] px-3 text-[13px] leading-5 font-medium text-[var(--foreground)] hover:bg-white md:h-8 md:text-[12px] md:leading-4"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => insertBlock((selected) => `## ${selected}`, "Heading")}
                className="inline-flex h-10 items-center justify-center rounded-[4px] px-3 text-[13px] leading-5 font-medium text-[var(--foreground)] hover:bg-white md:h-8 md:text-[12px] md:leading-4"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertBlock((selected) => `### ${selected}`, "Heading")}
                className="inline-flex h-10 items-center justify-center rounded-[4px] px-3 text-[13px] leading-5 font-medium text-[var(--foreground)] hover:bg-white md:h-8 md:text-[12px] md:leading-4"
              >
                H3
              </button>
              <div className="mx-1 h-6 w-px bg-[rgba(42,36,25,0.1)]" />
              <button
                type="button"
                onClick={() => wrapSelection("**")}
                className="inline-flex h-10 items-center justify-center rounded-[4px] px-3 text-[13px] leading-5 font-semibold text-[var(--foreground)] hover:bg-white md:h-8 md:text-[12px] md:leading-4"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => wrapSelection("*")}
                className="inline-flex h-10 items-center justify-center rounded-[4px] px-3 text-[13px] leading-5 italic text-[var(--foreground)] hover:bg-white md:h-8 md:text-[12px] md:leading-4"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => insertBlock((selected) => `> ${selected}`, "Quote")}
                className="inline-flex h-10 items-center justify-center rounded-[4px] px-3 text-[13px] leading-5 text-[var(--foreground)] hover:bg-white md:h-8 md:text-[12px] md:leading-4"
              >
                {"\u201c\u201d"}
              </button>
              <div className="mx-1 h-6 w-px bg-[rgba(42,36,25,0.1)]" />
              <button
                type="button"
                onClick={() => insertList("- ", "List item")}
                className="inline-flex h-10 items-center justify-center rounded-[4px] px-3 text-[13px] leading-5 text-[var(--foreground)] hover:bg-white md:h-8 md:text-[12px] md:leading-4"
              >
                • List
              </button>
              <button
                type="button"
                onClick={() => insertList("1. ", "List item")}
                className="inline-flex h-10 items-center justify-center rounded-[4px] px-3 text-[13px] leading-5 text-[var(--foreground)] hover:bg-white md:h-8 md:text-[12px] md:leading-4"
              >
                1. List
              </button>
              <div className="mx-1 h-6 w-px bg-[rgba(42,36,25,0.1)]" />
              <button
                type="button"
                onClick={insertLink}
                className="inline-flex h-10 items-center justify-center rounded-[4px] px-3 text-[13px] leading-5 text-[var(--foreground)] hover:bg-white md:h-8 md:text-[12px] md:leading-4"
              >
                Link
              </button>
              <button
                type="button"
                onClick={insertImage}
                className="inline-flex h-10 items-center justify-center rounded-[4px] px-3 text-[13px] leading-5 text-[var(--foreground)] hover:bg-white md:h-8 md:text-[12px] md:leading-4"
              >
                Image
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-10 items-center justify-center rounded-[4px] px-3 text-[13px] leading-5 text-[var(--foreground)] hover:bg-white md:h-8 md:text-[12px] md:leading-4"
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
          <div className="min-h-[600px] rounded-[4px] border border-[rgba(42,36,25,0.12)] bg-white px-6 py-6">
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
  );
}
