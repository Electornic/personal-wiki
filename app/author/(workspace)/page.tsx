import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import { deleteDocument, signOut } from "@/app/author/actions";
import { DeleteDocumentButton } from "@/app/author/_components/delete-document-button";
import { PaginationNav } from "@/components/pagination-nav";
import { listAuthorDocumentsPage } from "@/entities/record/api/documents";
import { formatLongDisplayDate } from "@/entities/record/model/content";
import { getAuthorAccess } from "@/lib/wiki/auth";

import { hasAuthoringEnv } from "@/shared/config/env";

function NewRecordIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 text-[var(--accent-text)]"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path d="M8 3.333v9.334M3.333 8h9.334" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path
        d="M6 4H4.667A1.333 1.333 0 0 0 3.333 5.333v5.334A1.333 1.333 0 0 0 4.667 12H6"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M9.333 5.333 12 8l-2.667 2.667M12 8H6"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function ArticleIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path
        d="M5.333 2.667h4l2.667 2.666v8A1.333 1.333 0 0 1 10.667 14H5.333A1.333 1.333 0 0 1 4 12.667V4A1.333 1.333 0 0 1 5.333 2.667Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M9.333 2.667v2.666H12" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 7.333h4M6 10h4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 text-[#8B6914]" fill="none" viewBox="0 0 16 16">
      <path
        d="M8 4C6.667 2.933 5 2.667 3.333 2.667v9.066C5 11.733 6.667 12 8 13.067c1.333-1.067 3-1.334 4.667-1.334V2.667C11 2.667 9.333 2.933 8 4Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path d="M8 4v9.067" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

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

function PrivateIcon() {
  return (
    <svg aria-hidden="true" className="h-3 w-3" fill="none" viewBox="0 0 12 12">
      <path d="M3.5 5V3.75a2.5 2.5 0 1 1 5 0V5" stroke="currentColor" strokeWidth="1.1" />
      <rect x="2.5" y="5" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}


type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function getWorkspaceMessage(searchParams: Record<string, string | string[] | undefined>) {
  if (getSearchParam(searchParams, "saved") === "1") {
    return {
      tone: "success" as const,
      text: "Record saved. The workspace list is up to date.",
    };
  }

  if (getSearchParam(searchParams, "deleted") === "1") {
    return {
      tone: "success" as const,
      text: "Record deleted.",
    };
  }

  const error = getSearchParam(searchParams, "error");

  if (!error) {
    return null;
  }

  if (error === "missing-document") {
    return {
      tone: "error" as const,
      text: "The selected record could not be found.",
    };
  }

  if (error === "delete") {
    return {
      tone: "error" as const,
      text: "The record could not be deleted. Try again.",
    };
  }

  if (error === "config") {
    return {
      tone: "error" as const,
      text: "Supabase configuration is incomplete.",
    };
  }

  return {
    tone: "error" as const,
    text: "Something went wrong. Try again.",
  };
}

function getPageNumber(searchParams: Record<string, string | string[] | undefined>) {
  const page = Number(getSearchParam(searchParams, "page") ?? "1");

  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return Math.floor(page);
}

function buildAuthorPageHref(
  searchParams: Record<string, string | string[] | undefined>,
  page: number,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page" || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
      continue;
    }

    params.set(key, value);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/author?${query}` : "/author";
}

export default function AuthorPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<AuthorPageSkeleton />}>
      <AuthorPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AuthorPageContent({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();

  const [resolvedSearchParams, access] = await Promise.all([
    searchParamsPromise,
    getAuthorAccess(),
  ]);

  if (!hasAuthoringEnv()) {
    return (
      <div className="flex flex-col gap-8 px-6 py-8 lg:px-10">
        <p className="section-kicker">Author workspace</p>
        <div className="rounded-[2rem] border border-amber-300 bg-amber-50 p-8">
          <h1 className="text-3xl text-stone-900">Supabase setup required</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">
            `.env.example`에 있는 public env와 service role key를 채우면
            signup/login과 저장 기능이 활성화됩니다. public reading surface는
            현재 demo data로 미리 볼 수 있습니다.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-stone-600">
            <li>`NEXT_PUBLIC_SUPABASE_URL`</li>
            <li>`NEXT_PUBLIC_SUPABASE_ANON_KEY`</li>
            <li>`SUPABASE_SERVICE_ROLE_KEY`</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!access.isAuthenticated) {
    return (
      <div className="flex flex-col gap-6 px-6 py-8 lg:px-10">
        <p className="section-kicker">Author workspace</p>
        <div className="rounded-[2rem] border border-stone-200 bg-[var(--card)] p-8 shadow-[0_28px_80px_rgba(51,39,18,0.08)]">
          <h1 className="text-4xl text-stone-900">Account sign-in required</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">
            이 영역은 로그인한 사용자만 사용할 수 있습니다.
          </p>
          <Link className="button-primary mt-6 inline-flex" href="/author/sign-in">
            sign in
          </Link>
        </div>
      </div>
    );
  }

  const workspaceMessage = getWorkspaceMessage(resolvedSearchParams);

  return (
    <div className="px-4 py-5 lg:px-10 lg:py-8">
      <section className="space-y-5 md:space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-[32px] leading-[40px] font-semibold tracking-[-0.8px] text-[var(--foreground)] md:text-[40px] md:leading-[48px]">
              Workspace
            </h1>
            <p className="mt-1 text-[14px] leading-5 text-[var(--muted)]">
              Signed in as{" "}
              <span className="text-[var(--foreground)]">
                {access.userName ?? access.userEmail}
              </span>
            </p>
          </div>
          <div className="flex gap-2 md:gap-3">
            <Link
              className="inline-flex h-[40px] flex-1 items-center justify-center gap-2 rounded-[4px] bg-[var(--foreground)] px-4 text-[14px] leading-5 font-medium !text-white md:h-[48px] md:flex-none md:px-6 md:text-[15px]"
              href="/author/documents/new"
            >
              <NewRecordIcon />
              New Record
            </Link>
            <form action={signOut} className="flex-1 md:flex-none">
              <button
                className="inline-flex h-[40px] w-full items-center justify-center gap-2 rounded-[4px] border border-[var(--border)] bg-[var(--card)] px-4 text-[14px] leading-5 font-medium text-[var(--foreground)] md:h-[48px] md:w-auto md:px-6 md:text-[15px]"
                type="submit"
              >
                <SignOutIcon />
                Sign Out
              </button>
            </form>
          </div>
        </div>
        <div className="h-px w-full bg-[var(--border)]" />
      </section>

      {workspaceMessage ? (
        <section className="mt-8">
          <div
            className={`rounded-[6px] border px-5 py-4 text-[14px] leading-5 ${
              workspaceMessage.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-rose-200 bg-rose-50 text-rose-900"
            }`}
          >
            {workspaceMessage.text}
          </div>
        </section>
      ) : null}

      <Suspense fallback={<DocumentListSkeleton />}>
        <AuthorDocumentList
          userId={access.userId ?? ""}
          searchParams={resolvedSearchParams}
        />
      </Suspense>
    </div>
  );
}

function AuthorPageSkeleton() {
  return (
    <div className="px-6 py-8 lg:px-10">
      <section className="space-y-8 animate-pulse">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="h-12 w-48 rounded-[6px] bg-[var(--surface-warm)]" />
            <div className="mt-3 h-5 w-64 rounded-[6px] bg-[var(--surface-warm)]" />
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="h-12 w-36 rounded-[4px] bg-[var(--surface-warm)]" />
            <div className="h-12 w-32 rounded-[4px] bg-[var(--surface-warm)]" />
          </div>
        </div>
        <div className="h-px w-full bg-[var(--surface-warm)]" />
      </section>
    </div>
  );
}

async function AuthorDocumentList({
  userId,
  searchParams,
}: {
  userId: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const currentPage = getPageNumber(searchParams);
  const paginatedDocuments = await listAuthorDocumentsPage(userId, currentPage);
  const documents = paginatedDocuments.documents;
  const pageStart =
    paginatedDocuments.totalCount === 0
      ? 0
      : (paginatedDocuments.page - 1) * paginatedDocuments.pageSize + 1;
  const pageEnd =
    paginatedDocuments.totalCount === 0
      ? 0
      : pageStart + documents.length - 1;

  return (
    <>
      {documents.length ? (
        <section className="mt-8 flex flex-col gap-2 text-[14px] leading-5 text-[var(--muted)] md:flex-row md:items-center md:justify-between">
          <p>
            Showing {pageStart}-{pageEnd} of {paginatedDocuments.totalCount} records
          </p>
          <p>
            Page {paginatedDocuments.page} of {paginatedDocuments.totalPages}
          </p>
        </section>
      ) : null}

      <section className="mt-16 grid gap-6">
        {documents.map((currentDocument) => {
          const visibleTags = currentDocument.tags.slice(0, 3);
          const remainingTagCount = Math.max(currentDocument.tags.length - visibleTags.length, 0);

          return (
            <article
              key={currentDocument.id}
              className="group relative rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-4 py-4 transition hover:bg-[var(--surface-hover)] md:px-[24px] md:py-[24px]"
            >
              <Link
                href={`/author/documents/${currentDocument.id}`}
                prefetch={false}
                className="absolute inset-0 z-0"
              >
                <span className="sr-only">Edit {currentDocument.title}</span>
              </Link>

              <div className="pointer-events-none relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="max-w-[560px] text-[24px] leading-[33.6px] font-semibold text-[var(--foreground)]">
                      {currentDocument.title}
                    </h2>
                    {currentDocument.visibility === "private" && (
                      <span className="inline-flex h-6 w-6 items-center justify-center text-[var(--muted)]">
                        <PrivateIcon />
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-3 text-[14px] leading-5 text-[var(--muted)]">
                    <span className="inline-flex items-center gap-1.5 capitalize">
                      {currentDocument.sourceType === "book" ? <BookIcon /> : <ArticleIcon />}
                      {currentDocument.sourceType}
                    </span>
                    <span>{formatLongDisplayDate(currentDocument.publishedAt)}</span>
                    <div className="flex flex-wrap gap-2">
                      {visibleTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex h-5 items-center rounded-[4px] bg-[var(--tag-bg)] px-2 text-[12px] leading-4 text-[var(--tag-text)]"
                        >
                          {tag}
                        </span>
                      ))}
                      {remainingTagCount > 0 ? (
                        <span className="inline-flex h-5 items-center text-[12px] leading-4 text-[var(--muted)]">
                          +{remainingTagCount} more
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="pointer-events-auto flex flex-wrap gap-2 md:ml-6 md:justify-end">
                  <Link
                    className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[4px] border border-[var(--border)] bg-[var(--card)] px-[17px] text-[14px] leading-5 font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-warm)] max-md:w-[38px] max-md:px-0"
                    prefetch={false}
                    href={`/author/documents/${currentDocument.id}`}
                  >
                    <EditIcon />
                    <span className="hidden md:inline">Edit</span>
                  </Link>
                  <DeleteDocumentButton
                    documentId={currentDocument.id}
                    documentTitle={currentDocument.title}
                    action={deleteDocument}
                  />
                </div>
              </div>
            </article>
          );
        })}

        {documents.length === 0 ? (
          <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-6 py-12 text-center">
            <h2 className="text-[24px] leading-8 font-semibold text-[var(--foreground)]">
              No records yet
            </h2>
            <p className="mt-3 text-[16px] leading-6 text-[var(--muted)]">
              Start your workspace by writing the first record.
            </p>
            <Link
              className="mt-6 inline-flex h-[46px] items-center justify-center gap-2 rounded-[4px] bg-[var(--accent)] px-6 text-[15px] leading-[22.5px] font-medium text-[var(--accent-text)]"
              href="/author/documents/new"
            >
              <NewRecordIcon />
              <span className="text-[15px] leading-[22.5px] font-medium text-[var(--accent-text)]">
                New Record
              </span>
            </Link>
          </div>
        ) : null}
      </section>

      <PaginationNav
        className="mt-10"
        currentPage={paginatedDocuments.page}
        totalPages={paginatedDocuments.totalPages}
        buildHref={(page) => buildAuthorPageHref(searchParams, page)}
      />
    </>
  );
}

function DocumentListSkeleton() {
  return (
    <section className="mt-16 grid gap-6 animate-pulse">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[6px] border border-[rgba(42,36,25,0.08)] bg-[var(--card)] px-[24px] py-[24px]"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="h-8 w-3/5 rounded-[6px] bg-[var(--surface-warm)]" />
              <div className="mt-4 h-5 w-2/5 rounded-[6px] bg-[var(--surface-warm)]" />
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="h-5 w-16 rounded-[4px] bg-[var(--surface-warm)]" />
                <div className="h-5 w-20 rounded-[4px] bg-[var(--surface-warm)]" />
                <div className="h-5 w-14 rounded-[4px] bg-[var(--surface-warm)]" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-[38px] w-[92px] rounded-[4px] bg-[var(--surface-warm)]" />
              <div className="h-[38px] w-[78px] rounded-[4px] bg-[var(--surface-warm)]" />
              <div className="h-[34px] w-[34px] rounded-[4px] bg-[var(--surface-warm)]" />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
