import Link from "next/link";

import { createShelf, deleteDocument, deleteShelf, signOut } from "@/app/author/actions";
import { hasAuthoringEnv } from "@/lib/env";
import { getAuthorAccess } from "@/lib/wiki/auth";
import { formatLongDisplayDate } from "@/lib/wiki/content";
import { listAuthorDocuments } from "@/lib/wiki/documents";
import { listAuthorCurationShelves } from "@/lib/wiki/shelves";

function NewRecordIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 text-[#faf8f5]"
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

function PreviewIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path
        d="M1.333 8s2.424-4 6.667-4 6.667 4 6.667 4-2.424 4-6.667 4-6.667-4-6.667-4Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="8" cy="8" r="1.75" stroke="currentColor" strokeWidth="1.2" />
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

function DeleteIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path
        d="M5.333 4h5.334M6.667 2.667h2.666M5.333 6v5.333M8 6v5.333M10.667 6v5.333M4 4.667h8v7.666A1.333 1.333 0 0 1 10.667 13.667H5.333A1.333 1.333 0 0 1 4 12.333V4.667Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
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

function PublicIcon() {
  return (
    <svg aria-hidden="true" className="h-3 w-3" fill="none" viewBox="0 0 12 12">
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.1" />
      <path
        d="M1.5 6h9M6 1.5c1 1.1 1.5 2.533 1.5 4.5S7 9.4 6 10.5M6 1.5c-1 1.1-1.5 2.533-1.5 4.5S5 9.4 6 10.5"
        stroke="currentColor"
        strokeWidth="1.1"
      />
    </svg>
  );
}

function ShelfIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path d="M3.333 4h9.334M3.333 8h9.334M3.333 12h9.334" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export default async function AuthorPage() {
  const access = await getAuthorAccess();
  const [documents, shelves] = access.isAuthenticated
    ? await Promise.all([listAuthorDocuments(), listAuthorCurationShelves()])
    : [[], []];

  if (!hasAuthoringEnv()) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-12 md:px-10">
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
      </main>
    );
  }

  if (!access.isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-12 md:px-10">
        <p className="section-kicker">Author workspace</p>
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_28px_80px_rgba(51,39,18,0.08)]">
          <h1 className="text-4xl text-stone-900">Account sign-in required</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">
            이 영역은 로그인한 사용자만 사용할 수 있습니다.
          </p>
          <Link className="button-primary mt-6 inline-flex" href="/author/sign-in">
            sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="site-shell pb-20 pt-20">
      <section className="space-y-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-[40px] leading-[48px] font-semibold tracking-[-0.8px] text-[#2a2419]">
              Workspace
            </h1>
            <p className="mt-2 text-[14px] leading-5 text-[#6b6354]">
              Signed in as{" "}
              <span className="text-[#2a2419]">
                {access.userName ?? access.userEmail}
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <Link
              className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[4px] bg-[#2a2419] px-6 text-[15px] leading-[22.5px] font-medium text-[#faf8f5]"
              href="/author/documents/new"
            >
              <NewRecordIcon />
              <span className="text-[15px] leading-[22.5px] font-medium text-[#faf8f5]">
                New Record
              </span>
            </Link>
            <form action={signOut}>
              <button
                className="inline-flex h-[48px] w-full items-center justify-center gap-2 rounded-[4px] border border-[rgba(42,36,25,0.1)] bg-white px-6 text-[15px] leading-[22.5px] font-medium text-[#2a2419] md:w-auto"
                type="submit"
              >
                <SignOutIcon />
                Sign Out
              </button>
            </form>
          </div>
        </div>
        <div className="h-px w-full bg-[rgba(42,36,25,0.1)]" />
      </section>

      <section className="mt-16 grid gap-6">
        {documents.map((document) => {
          const visibleTags = document.tags.slice(0, 3);
          const remainingTagCount = Math.max(document.tags.length - visibleTags.length, 0);

          return (
            <article
              key={document.id}
              className="rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-white px-[24px] py-[24px]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="max-w-[560px] text-[24px] leading-[33.6px] font-semibold text-[#2a2419]">
                      {document.title}
                    </h2>
                    <span
                      className={`inline-flex h-6 items-center gap-1 rounded-[4px] px-[10px] text-[12px] leading-4 font-medium ${
                        document.visibility === "public"
                          ? "bg-[#e8e3db] text-[#2a2419]"
                          : "bg-[#e8e3db] text-[#6b6354]"
                      }`}
                    >
                      {document.visibility === "public" ? <PublicIcon /> : <PrivateIcon />}
                      {document.visibility === "public" ? "Public" : "Private"}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-3 text-[14px] leading-5 text-[#6b6354]">
                    <span className="inline-flex items-center gap-1.5 capitalize">
                      <ArticleIcon />
                      {document.sourceType}
                    </span>
                    <span>{formatLongDisplayDate(document.publishedAt)}</span>
                    <div className="flex flex-wrap gap-2">
                      {visibleTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex h-5 items-center rounded-[4px] bg-[#e8e3db] px-2 text-[12px] leading-4 text-[#6b6354]"
                        >
                          {tag}
                        </span>
                      ))}
                      {remainingTagCount > 0 ? (
                        <span className="inline-flex h-5 items-center text-[12px] leading-4 text-[#6b6354]">
                          +{remainingTagCount} more
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 md:ml-6 md:justify-end">
                  <Link
                    className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[4px] border border-[rgba(42,36,25,0.1)] bg-white px-[17px] text-[14px] leading-5 font-medium text-[#2a2419] max-md:w-[49px] max-md:px-0"
                    href={`/library/${document.slug}`}
                  >
                    <PreviewIcon />
                    <span className="hidden md:inline">Preview</span>
                  </Link>
                  <Link
                    className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[4px] border border-[rgba(42,36,25,0.1)] bg-white px-[17px] text-[14px] leading-5 font-medium text-[#2a2419] max-md:w-[49px] max-md:px-0"
                    href={`/author/documents/${document.id}`}
                  >
                    <EditIcon />
                    <span className="hidden md:inline">Edit</span>
                  </Link>
                  <form action={deleteDocument}>
                    <input type="hidden" name="documentId" value={document.id} />
                    <button
                      className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[4px] border border-[rgba(42,36,25,0.1)] bg-white text-[#d45c4f]"
                      type="submit"
                    >
                      <DeleteIcon />
                    </button>
                  </form>
                </div>
              </div>
            </article>
          );
        })}

        {documents.length === 0 ? (
          <div className="rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-white px-6 py-12 text-center">
            <h2 className="text-[24px] leading-8 font-semibold text-[#2a2419]">
              No records yet
            </h2>
            <p className="mt-3 text-[16px] leading-6 text-[#6b6354]">
              Start your workspace by writing the first record.
            </p>
            <Link
              className="mt-6 inline-flex h-[46px] items-center justify-center gap-2 rounded-[4px] bg-[#2a2419] px-6 text-[15px] leading-[22.5px] font-medium text-[#faf8f5]"
              href="/author/documents/new"
            >
              <NewRecordIcon />
              <span className="text-[15px] leading-[22.5px] font-medium text-[#faf8f5]">
                New Record
              </span>
            </Link>
          </div>
        ) : null}
      </section>

      <section className="mt-16 space-y-8">
        <div className="flex items-center gap-2">
          <ShelfIcon />
          <h2 className="text-[30px] leading-9 font-semibold tracking-[-0.3px] text-[#2a2419]">
            Curation Shelves
          </h2>
        </div>
        <p className="text-[16px] leading-6 text-[#6b6354]">
          Create small reading shelves for the home page. Topic shelves can be prepared now
          and connected later as that surface evolves.
        </p>

        {shelves.length ? (
          <div className="grid gap-6">
            {shelves.map((shelf) => (
              <article
                key={shelf.id}
                className="rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-white px-6 py-6"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-[24px] leading-8 font-semibold text-[#2a2419]">
                        {shelf.title}
                      </h3>
                      <span className="inline-flex rounded-[4px] bg-[#e8e3db] px-[10px] py-1 text-[12px] leading-4 text-[#6b6354]">
                        {shelf.placement === "home" ? "Home shelf" : `Topic: ${shelf.topicTag}`}
                      </span>
                    </div>
                    {shelf.description ? (
                      <p className="mt-3 text-[16px] leading-6 text-[#6b6354]">
                        {shelf.description}
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {shelf.documents.map((document) => (
                        <span
                          key={document.id}
                          className="inline-flex rounded-full bg-[rgba(232,227,219,0.6)] px-[13px] py-1 text-[12px] leading-4 text-[#2a2419]"
                        >
                          {document.title}
                        </span>
                      ))}
                    </div>
                  </div>
                  <form action={deleteShelf}>
                    <input type="hidden" name="shelfId" value={shelf.id} />
                    <button
                      className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[4px] border border-[rgba(42,36,25,0.1)] bg-white px-[17px] text-[14px] leading-5 font-medium text-[#d45c4f]"
                      type="submit"
                    >
                      <DeleteIcon />
                      Delete shelf
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-white px-6 py-10 text-center">
            <p className="text-[18px] leading-[32.4px] text-[#6b6354]">
              No curation shelves yet.
            </p>
          </div>
        )}

        <article className="rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-white px-6 py-6">
          <h3 className="text-[24px] leading-8 font-semibold text-[#2a2419]">
            Create shelf
          </h3>
          <p className="mt-2 text-[14px] leading-5 text-[#6b6354]">
            Choose at least one record. Topic shelves require a topic tag.
          </p>

          <form action={createShelf} className="mt-6 grid gap-5">
            <label className="field">
              <span>Title</span>
              <input name="title" required placeholder="Start Here" />
            </label>

            <label className="field">
              <span>Description</span>
              <textarea
                name="description"
                rows={3}
                placeholder="Essential readings for understanding the core themes of this library"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="field">
                <span>Placement</span>
                <select name="placement" defaultValue="home">
                  <option value="home">Home</option>
                  <option value="topic">Topic</option>
                </select>
              </label>

              <label className="field">
                <span>Topic Tag</span>
                <input name="topicTag" placeholder="architecture" />
              </label>
            </div>

            <fieldset className="field">
              <span>Records</span>
              <div className="grid gap-3 rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-[rgba(232,227,219,0.2)] p-4">
                {documents.length ? (
                  documents.map((document) => (
                    <label
                      key={document.id}
                      className="flex items-start gap-3 rounded-[4px] bg-white px-4 py-3 text-[14px] leading-5 text-[#2a2419]"
                    >
                      <input
                        type="checkbox"
                        name="recordIds"
                        value={document.id}
                        className="mt-1 h-4 w-4 rounded border-[rgba(42,36,25,0.2)]"
                      />
                      <span className="min-w-0">
                        <span className="block font-medium">{document.title}</span>
                        <span className="mt-1 block text-[#6b6354]">
                          {document.sourceType} · {document.visibility}
                        </span>
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-[14px] leading-5 text-[#6b6354]">
                    Create records first to add them to a shelf.
                  </p>
                )}
              </div>
            </fieldset>

            <div>
              <button
                type="submit"
                className="inline-flex h-[42px] items-center justify-center rounded-[4px] bg-[#2a2419] px-5 text-[14px] leading-5 font-medium text-[#faf8f5]"
              >
                Save shelf
              </button>
            </div>
          </form>
        </article>
      </section>
    </main>
  );
}
