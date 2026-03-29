export function getExcerpt(contents: string) {
  const plain = contents
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, " $1 ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, " $1 ")
    .replace(/!\S+/g, " ")
    .replace(/\b(?:storage|https?):\/\/\S+/g, "")
    .replace(/^#+\s+/gm, "")
    .replace(/[*_`>\-\[\]\(\)]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!plain) {
    return "";
  }

  return plain.length > 140 ? `${plain.slice(0, 137)}...` : plain;
}

export function toDocumentPreview<T extends { contents: string }>(
  document: T,
): Omit<T, "contents"> & { excerpt: string } {
  const { contents, ...rest } = document;

  return {
    ...rest,
    excerpt: getExcerpt(contents),
  };
}

export function formatDisplayDate(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatLongDisplayDate(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
