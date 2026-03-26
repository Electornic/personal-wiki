import Link from "next/link";
import type { ReactNode } from "react";

type PaginationNavProps = {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
  className?: string;
};

type PaginationItem =
  | { type: "page"; value: number }
  | { type: "ellipsis"; value: string };

function getVisiblePages(currentPage: number, totalPages: number, maxVisible = 8) {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const middleCount = maxVisible - 2;
  let startPage = Math.max(2, currentPage - Math.floor(middleCount / 2));
  let endPage = startPage + middleCount - 1;

  if (endPage > totalPages - 1) {
    endPage = totalPages - 1;
    startPage = endPage - middleCount + 1;
  }

  return [
    1,
    ...Array.from(
      { length: endPage - startPage + 1 },
      (_, index) => startPage + index,
    ),
    totalPages,
  ];
}

function buildPaginationItems(currentPage: number, totalPages: number) {
  const pages = getVisiblePages(currentPage, totalPages);
  const items: PaginationItem[] = [];

  for (const page of pages) {
    const previousPage = items.at(-1);

    if (
      previousPage?.type === "page" &&
      page - previousPage.value > 1
    ) {
      items.push({
        type: "ellipsis",
        value: `ellipsis-${previousPage.value}-${page}`,
      });
    }

    items.push({ type: "page", value: page });
  }

  return items;
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
      className={`inline-flex h-10 min-w-10 items-center justify-center rounded-[4px] border px-2.5 text-[13px] leading-5 font-medium md:h-[42px] md:min-w-[42px] md:px-3 md:text-[14px] ${
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

  const visiblePages = buildPaginationItems(currentPage, totalPages);

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
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </PaginationLink>

          {visiblePages.map((item) =>
            item.type === "page" ? (
              <PaginationLink
                key={item.value}
                href={buildHref(item.value)}
                active={item.value === currentPage}
              >
                {item.value}
              </PaginationLink>
            ) : (
              <span
                key={item.value}
                className="inline-flex h-10 min-w-6 items-center justify-center px-1 text-[13px] text-[#8a826f] md:h-[42px] md:min-w-[24px] md:text-[14px]"
              >
                ...
              </span>
            ),
          )}

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
