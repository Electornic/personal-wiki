export function getExcerpt(contents: string) {
  const plain = contents
    .replace(/^#+\s+/gm, "")
    .replace(/[*_`>\-\[\]\(\)]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!plain) {
    return "";
  }

  return plain.length > 140 ? `${plain.slice(0, 137)}...` : plain;
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
