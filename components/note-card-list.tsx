import type { DocumentNoteCard } from "@/lib/wiki/types";

type NoteCardListProps = {
  noteCards: DocumentNoteCard[];
};

export function NoteCardList({ noteCards }: NoteCardListProps) {
  return (
    <div className="grid gap-4">
      {noteCards.map((noteCard, index) => (
        <article
          key={`${noteCard.position}-${index}`}
          className="rounded-[1.5rem] border border-stone-200 bg-stone-50 px-5 py-5"
        >
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
            card {index + 1}
          </p>
          {noteCard.heading ? (
            <h2 className="mt-3 text-2xl text-stone-900">{noteCard.heading}</h2>
          ) : null}
          <p className="mt-3 text-base leading-8 text-stone-700">
            {noteCard.content}
          </p>
        </article>
      ))}
    </div>
  );
}
