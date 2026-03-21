export function normalizeTopic(value: string) {
  return value.trim().toLowerCase();
}

export function formatTopicTitle(topic: string) {
  return topic
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
