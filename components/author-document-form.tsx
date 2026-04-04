"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { saveDocument } from "@/app/author/actions";
import type { DocumentFormState, WikiDocument } from "@/entities/record/model/types";

import { AuthorDocumentEditor, type StagedImage } from "./author-document-editor";
import { AuthorDocumentMetadata } from "./author-document-metadata";

type AuthorDocumentFormProps = {
  document?: WikiDocument;
};

function SubmitButton({ visibility }: { visibility: "public" | "private" }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex h-[44px] min-w-[140px] items-center justify-center gap-2 rounded-[6px] bg-[var(--accent)] px-5 text-[14px] leading-5 font-medium text-[var(--accent-text)] transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
      type="submit"
      disabled={pending}
    >
      <PublishIcon />
      {pending ? "Saving..." : visibility === "public" ? "Publish" : "Save Draft"}
    </button>
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
        d="M8 10V2.333"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M5.333 5 8 2.333 10.667 5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export function AuthorDocumentForm({ document }: AuthorDocumentFormProps) {
  const [state, formAction] = useActionState<DocumentFormState, FormData>(saveDocument, {});
  const [visibility, setVisibility] = useState<"public" | "private">(
    document?.visibility ?? "private",
  );
  const [stagedImages, setStagedImages] = useState<StagedImage[]>([]);
  const stagedImagesRef = useRef<StagedImage[]>([]);
  const stagedFileInputRef = useRef<HTMLInputElement | null>(null);

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

  return (
    <form action={formAction} className="grid gap-5">
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

      <div className="mb-2 flex items-center justify-between">
          <Link
            href="/author"
            className="inline-flex h-8 items-center gap-2 rounded-[4px] px-[10px] text-[14px] leading-5 font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-hover)]"
          >
            <CancelIcon />
            Cancel
          </Link>
      </div>

      {/* visibility + submit moved to bottom */}

      <AuthorDocumentMetadata document={document} />

      <AuthorDocumentEditor
        initialContents={document?.contents ?? ""}
        stagedImages={stagedImages}
        onStagedImagesChange={setStagedImages}
      />

      <div className="flex items-center justify-end gap-4">
        <label className="inline-flex items-center gap-3 text-[14px] leading-5 font-medium text-[var(--foreground)]">
          <button
            type="button"
            aria-pressed={visibility === "public"}
            onClick={() =>
              setVisibility((current) =>
                current === "public" ? "private" : "public",
              )
            }
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              visibility === "public" ? "bg-[var(--accent)]" : "bg-[rgba(42,36,25,0.2)]"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                visibility === "public" ? "translate-x-[22px]" : "translate-x-[2px]"
              }`}
            />
          </button>
          <span className="w-[52px]">{visibility === "public" ? "Public" : "Private"}</span>
        </label>
        <SubmitButton visibility={visibility} />
      </div>

      {state.error ? (
        <p className="rounded-[6px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
