import Link from "next/link";

import { toggleBookmarkAction, toggleLikeAction } from "@/app/library/actions";
import type { RecordReactionState } from "@/lib/wiki/types";

type RecordReactionsProps = {
  recordId: string;
  recordSlug: string;
  state: RecordReactionState;
  canReact: boolean;
};

function BookmarkIcon() {
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

function LikeIcon() {
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

export function RecordReactions({
  recordId,
  recordSlug,
  state,
  canReact,
}: RecordReactionsProps) {
  if (!canReact) {
    return (
      <div className="flex items-center gap-3 text-[14px] leading-5 text-[#2a2419]">
        <Link
          href="/author/sign-in"
          className="inline-flex items-center gap-2 rounded-[4px] px-2 py-1 text-[#2a2419]"
        >
          <BookmarkIcon />
          Bookmark
        </Link>
        <div className="h-4 w-px bg-[rgba(42,36,25,0.1)]" />
        <Link
          href="/author/sign-in"
          className="inline-flex items-center gap-2 rounded-[4px] px-2 py-1 text-[#2a2419]"
        >
          <LikeIcon />
          Like
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-[14px] leading-5 text-[#2a2419]">
      <form action={toggleBookmarkAction}>
        <input type="hidden" name="recordId" value={recordId} />
        <input type="hidden" name="recordSlug" value={recordSlug} />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-[4px] px-2 py-1 text-[#2a2419]"
        >
          <BookmarkIcon />
          {state.isBookmarked ? "Bookmarked" : "Bookmark"}
        </button>
      </form>
      <div className="h-4 w-px bg-[rgba(42,36,25,0.1)]" />
      <form action={toggleLikeAction}>
        <input type="hidden" name="recordId" value={recordId} />
        <input type="hidden" name="recordSlug" value={recordSlug} />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-[4px] px-2 py-1 text-[#2a2419]"
        >
          <LikeIcon />
          {state.isLiked ? "Liked" : "Like"}
        </button>
      </form>
    </div>
  );
}
