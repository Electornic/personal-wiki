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
  contents: string;
  sourceType: SourceType;
  bookTitle?: string | null;
  visibility: DocumentVisibility;
  writerName: string;
  publishedAt?: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type RelatedDocument = WikiDocument & {
  sharedTagCount: number;
  sharedTags: string[];
};

export type DocumentFormState = {
  error?: string;
  success?: string;
};
