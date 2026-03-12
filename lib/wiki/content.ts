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
