type TopicPillProps = {
  label: string;
};

export function TopicPill({ label }: TopicPillProps) {
  return (
    <span className="inline-flex rounded-full border border-stone-300 bg-stone-100 px-3 py-1 text-xs uppercase tracking-[0.22em] text-stone-700">
      {label}
    </span>
  );
}
