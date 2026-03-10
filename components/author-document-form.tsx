"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";

import { saveDocument } from "@/app/author/actions";
import type { DocumentFormState, WikiDocument } from "@/lib/wiki/types";

type AuthorDocumentFormProps = {
  document?: WikiDocument;
};

type NoteCardDraft = {
  heading: string;
  content: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button-primary" type="submit" disabled={pending}>
      {pending ? "saving..." : "save document"}
    </button>
  );
}

export function AuthorDocumentForm({ document }: AuthorDocumentFormProps) {
  const [state, formAction] = useActionState<DocumentFormState, FormData>(saveDocument, {});
  const [isPending, startTransition] = useTransition();
  const [cards, setCards] = useState<NoteCardDraft[]>(
    document?.noteCards.length
      ? document.noteCards.map((noteCard) => ({
          heading: noteCard.heading ?? "",
          content: noteCard.content,
        }))
      : [{ heading: "", content: "" }],
  );

  return (
    <form action={formAction} className="grid gap-6 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_28px_80px_rgba(51,39,18,0.08)]">
      <input type="hidden" name="documentId" defaultValue={document?.id ?? ""} />

      <div className="grid gap-6 md:grid-cols-2">
        <label className="field">
          <span>title</span>
          <input name="title" defaultValue={document?.title ?? ""} required />
        </label>
        <label className="field">
          <span>source title</span>
          <input
            name="sourceTitle"
            defaultValue={document?.sourceTitle ?? ""}
            required
          />
        </label>
        <label className="field">
          <span>author name</span>
          <input
            name="authorName"
            defaultValue={document?.authorName ?? ""}
            required
          />
        </label>
        <label className="field">
          <span>published at</span>
          <input
            name="publishedAt"
            type="date"
            defaultValue={document?.publishedAt ?? ""}
          />
        </label>
        <label className="field">
          <span>source type</span>
          <select name="sourceType" defaultValue={document?.sourceType ?? "book"}>
            <option value="book">book</option>
            <option value="article">article</option>
          </select>
        </label>
        <label className="field">
          <span>visibility</span>
          <select name="visibility" defaultValue={document?.visibility ?? "private"}>
            <option value="private">private</option>
            <option value="public">public</option>
          </select>
        </label>
        <label className="field md:col-span-2">
          <span>source url</span>
          <input
            name="sourceUrl"
            type="url"
            defaultValue={document?.sourceUrl ?? ""}
            placeholder="https://example.com/article"
          />
        </label>
        <label className="field md:col-span-2">
          <span>isbn</span>
          <input name="isbn" defaultValue={document?.isbn ?? ""} />
        </label>
        <label className="field md:col-span-2">
          <span>topics</span>
          <input
            name="topics"
            defaultValue={document?.topics.join(", ") ?? ""}
            placeholder="creativity, practice, notes"
            required
          />
        </label>
        <label className="field md:col-span-2">
          <span>intro</span>
          <textarea
            name="intro"
            defaultValue={document?.intro ?? ""}
            rows={4}
            placeholder="이 기록이 왜 남을 가치가 있는지 짧게 적습니다."
          />
        </label>
      </div>

      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="section-kicker">Connected thoughts</p>
            <h2 className="text-2xl text-stone-900">카드/불릿 메모</h2>
          </div>
          <button
            type="button"
            className="button-secondary"
            disabled={isPending}
            onClick={() =>
              startTransition(() => {
                setCards((current) => [...current, { heading: "", content: "" }]);
              })
            }
          >
            add card
          </button>
        </div>

        {cards.map((card, index) => (
          <div
            key={`card-${index}`}
            className="grid gap-4 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5"
          >
            <label className="field">
              <span>heading</span>
              <input
                name={`cardHeading-${index}`}
                defaultValue={card.heading}
                placeholder="짧은 카드 제목"
              />
            </label>
            <label className="field">
              <span>content</span>
              <textarea
                name={`cardContent-${index}`}
                defaultValue={card.content}
                rows={4}
                placeholder="읽고 난 뒤 생긴 연결된 생각을 적습니다."
                required={index === 0}
              />
            </label>
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-stone-500 transition hover:text-stone-900"
                disabled={cards.length === 1 || isPending}
                onClick={() =>
                  startTransition(() => {
                    setCards((current) => current.filter((_, cardIndex) => cardIndex !== index));
                  })
                }
              >
                remove card
              </button>
            </div>
          </div>
        ))}
      </div>

      {state.error ? (
        <p className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <SubmitButton />
        <Link className="button-secondary" href="/author">
          back to workspace
        </Link>
      </div>
    </form>
  );
}
