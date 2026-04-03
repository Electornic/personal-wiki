import Link from "next/link";

import { toggleBookmarkAction, toggleLikeAction } from "@/app/library/actions";
import type { RecordReactionState } from "@/entities/record/model/types";

type RecordReactionsProps = {
  recordId: string;
  recordSlug: string;
  state: RecordReactionState;
  likeCount: number;
  canReact: boolean;
};

function BookmarkOutlineIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path
        d="M4.667 2.667h6.666A1.333 1.333 0 0 1 12.667 4v9.333L8 10.667l-4.667 2.666V4a1.333 1.333 0 0 1 1.334-1.333Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function BookmarkFilledIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
      <path
        d="M4.667 2.667h6.666A1.333 1.333 0 0 1 12.667 4v9.333L8 10.667l-4.667 2.666V4a1.333 1.333 0 0 1 1.334-1.333Z"
      />
    </svg>
  );
}

function LikeOutlineIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path
        d="M8 13.333 2.667 8.667a3.052 3.052 0 0 1 0-4.334A2.92 2.92 0 0 1 6.8 4.32L8 5.5l1.2-1.18a2.92 2.92 0 0 1 4.133.013 3.052 3.052 0 0 1 0 4.334L8 13.333Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function LikeFilledIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
      <path
        d="M8 13.333 2.667 8.667a3.052 3.052 0 0 1 0-4.334A2.92 2.92 0 0 1 6.8 4.32L8 5.5l1.2-1.18a2.92 2.92 0 0 1 4.133.013 3.052 3.052 0 0 1 0 4.334L8 13.333Z"
      />
    </svg>
  );
}

export function RecordReactions({
  recordId,
  recordSlug,
  state,
  likeCount,
  canReact,
}: RecordReactionsProps) {
  const bookmarkLabel = state.isBookmarked ? "Bookmarked" : "Bookmark";
  const likeLabel = state.isLiked ? "Liked" : "Like";

  if (!canReact) {
    return (
      <div className="flex items-center gap-3 text-[12px] leading-4 text-[var(--foreground)]">
        <Link
          href="/author/sign-in"
          className="inline-flex h-8 items-center gap-1.5 rounded-[4px] px-1 text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          <BookmarkOutlineIcon />
          {bookmarkLabel}
        </Link>
        <div className="h-4 w-px bg-[var(--border)]" />
        <Link
          href="/author/sign-in"
          className="inline-flex h-8 items-center gap-1.5 rounded-[4px] px-1 text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          <LikeOutlineIcon />
          {likeLabel}
          <span className="opacity-60">{likeCount}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-[12px] leading-4 text-[var(--foreground)]">
      <form action={toggleBookmarkAction}>
        <input type="hidden" name="recordId" value={recordId} />
        <input type="hidden" name="recordSlug" value={recordSlug} />
        <button
          type="submit"
          className={`inline-flex h-8 items-center gap-1.5 rounded-[4px] px-1 transition ${
            state.isBookmarked ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          {state.isBookmarked ? <BookmarkFilledIcon /> : <BookmarkOutlineIcon />}
          {bookmarkLabel}
        </button>
      </form>
      <div className="h-4 w-px bg-[var(--border)]" />
      <form action={toggleLikeAction}>
        <input type="hidden" name="recordId" value={recordId} />
        <input type="hidden" name="recordSlug" value={recordSlug} />
        <button
          type="submit"
          className={`inline-flex h-8 items-center gap-1.5 rounded-[4px] px-1 transition ${
            state.isLiked ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          {state.isLiked ? <LikeFilledIcon /> : <LikeOutlineIcon />}
          {likeLabel}
          <span className="opacity-60">{likeCount}</span>
        </button>
      </form>
    </div>
  );
}
