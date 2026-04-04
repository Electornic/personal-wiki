export function BookIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={`${className} text-[#8B6914]`} fill="none" viewBox="0 0 20 20">
      <path
        d="M10 5C8.333 3.667 6.25 3.333 4.167 3.333v11.334C6.25 14.667 8.333 15 10 16.333c1.667-1.333 3.75-1.666 5.833-1.666V3.333C13.75 3.333 11.667 3.667 10 5Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d="M10 5v11.333" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function ArticleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={`${className} text-[var(--muted)]`} fill="none" viewBox="0 0 20 20">
      <path
        d="M6.667 2.5h5l3.333 3.333v10A1.667 1.667 0 0 1 13.333 17.5H6.667A1.667 1.667 0 0 1 5 15.833V4.167A1.667 1.667 0 0 1 6.667 2.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path d="M11.667 2.5v3.333H15" stroke="currentColor" strokeWidth="1.25" />
      <path d="M7.5 9.167h5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M7.5 12.5h5" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function SourceTypeIcon({ sourceType, className }: { sourceType: "book" | "article"; className?: string }) {
  return sourceType === "book" ? <BookIcon className={className} /> : <ArticleIcon className={className} />;
}
