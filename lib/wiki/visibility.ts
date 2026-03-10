import type { DocumentVisibility, WikiDocument } from "@/lib/wiki/types";

export function isPublicVisibility(visibility: DocumentVisibility) {
  return visibility === "public";
}

export function canReadDocument(document: Pick<WikiDocument, "visibility">) {
  return isPublicVisibility(document.visibility);
}

export function filterReadableDocuments<T extends Pick<WikiDocument, "visibility">>(
  documents: T[],
) {
  return documents.filter((document) => canReadDocument(document));
}
