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
  reactionCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type WikiDocumentListItem = Pick<
  WikiDocument,
  "id" | "slug" | "title" | "sourceType" | "bookTitle" | "writerName" | "publishedAt" | "tags" | "updatedAt"
> & {
  excerpt: string;
};

export type WikiDocumentPreview = WikiDocumentListItem;

export type RelatedDocument = WikiDocumentListItem & {
  sharedTagCount: number;
  sharedTags: string[];
};

export type DocumentFormState = {
  error?: string;
  success?: string;
};

export type RecordReactionState = {
  isBookmarked: boolean;
  isLiked: boolean;
};
