export type SourceType = "book" | "article";
export type DocumentVisibility = "public" | "private";

export type DocumentNoteCard = {
  id?: string;
  heading?: string | null;
  content: string;
  position: number;
};

export type WikiDocument = {
  id: string;
  slug: string;
  title: string;
  sourceType: SourceType;
  visibility: DocumentVisibility;
  authorName: string;
  sourceTitle: string;
  sourceUrl?: string | null;
  isbn?: string | null;
  publishedAt?: string | null;
  intro?: string | null;
  topics: string[];
  noteCards: DocumentNoteCard[];
  createdAt: string;
  updatedAt: string;
};

export type RelatedDocument = WikiDocument & {
  sharedTopicCount: number;
  sharedTopics: string[];
};

export type DocumentFormState = {
  error?: string;
  success?: string;
};
