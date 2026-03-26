import Link from "next/link";
import type { ReactNode } from "react";

type PaginationNavProps = {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
  className?: string;
};

function getVisiblePages(currentPage: number, totalPages: number, maxVisible = 8) {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let startPage = Math.max(1, currentPage - half);
  let endPage = startPage + maxVisible - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = endPage - maxVisible + 1;
  }

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index,
  );
}

function PaginationLink({
  href,
  disabled,
  active,
  children,
}: {
  href: string;
  disabled?: boolean;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-disabled={disabled}
      aria-current={active ? "page" : undefined}
      className={`inline-flex h-[42px] min-w-[42px] items-center justify-center rounded-[4px] border px-3 text-[14px] leading-5 font-medium ${
        active
          ? "border-[#2a2419] bg-[#2a2419] text-[#faf8f5]"
          : disabled
            ? "pointer-events-none border-[rgba(42,36,25,0.08)] text-[rgba(42,36,25,0.35)]"
            : "border-[rgba(42,36,25,0.1)] bg-white text-[#2a2419]"
      }`}
    >
      {children}
    </Link>
  );
}

export function PaginationNav({
  currentPage,
  totalPages,
  buildHref,
  className,
}: PaginationNavProps) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <nav
      className={[
        "mt-8 border-t border-[rgba(42,36,25,0.1)] pt-6",
        className ?? "",
      ].join(" ")}
      aria-label="Pagination"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-[14px] leading-5 text-[#6b6354]">
          Page {currentPage} of {totalPages}
        </p>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <PaginationLink
            href={buildHref(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </PaginationLink>

          {visiblePages.map((page) => (
            <PaginationLink
              key={page}
              href={buildHref(page)}
              active={page === currentPage}
            >
              {page}
            </PaginationLink>
          ))}

          <PaginationLink
            href={buildHref(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </PaginationLink>
        </div>
      </div>
    </nav>
  );
}
