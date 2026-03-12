type TopicPillProps = {
  label: string;
};

export function TopicPill({ label }: TopicPillProps) {
  return (
    <span className="inline-flex rounded-full bg-stone-200/70 px-3 py-1 text-xs font-normal text-stone-700 transition-colors hover:bg-stone-200">
      {label}
    </span>
  );
}
