import Link from "next/link";

import type { WikiDocument } from "@/entities/record/model/types";
import { DocumentRenderer } from "@/entities/record/ui/document-renderer";

function EditIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path
        d="M10.667 2.667 13.333 5.333 6 12.667 3.333 13.333 4 10.667l6.667-8Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="m9.333 4 2.667 2.667" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path d="M10 3.333 5.333 8 10 12.667" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 8h6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function PrivateBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[13px] text-[var(--muted)]">
      <svg aria-hidden="true" className="h-3 w-3" fill="none" viewBox="0 0 12 12">
        <path d="M3.5 5V3.75a2.5 2.5 0 1 1 5 0V5" stroke="currentColor" strokeWidth="1.1" />
        <rect x="2.5" y="5" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.1" />
      </svg>
      Private
    </span>
  );
}

export function AuthorDocumentView({ doc }: { doc: WikiDocument }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Link
          href="/author"
          className="inline-flex h-8 items-center gap-2 rounded-[4px] px-[10px] text-[14px] leading-5 font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-hover)]"
        >
          <BackIcon />
          Back
        </Link>
        <Link
          href={`/author/documents/${doc.id}/edit`}
          className="inline-flex h-[38px] items-center gap-2 rounded-[4px] border border-[var(--border)] bg-[var(--card)] px-4 text-[14px] leading-5 font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-warm)]"
        >
          <EditIcon />
          Edit
        </Link>
      </div>

      <DocumentRenderer
        document={doc}
        headerExtra={doc.visibility === "private" ? <PrivateBadge /> : null}
        tagsInteractive={false}
      />
    </div>
  );
}
