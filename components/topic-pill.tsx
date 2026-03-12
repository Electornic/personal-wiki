type TopicPillProps = {
  label: string;
};

export function TopicPill({ label }: TopicPillProps) {
  return (
    <span className="inline-flex h-[26px] items-center justify-center rounded-full bg-[rgba(232,227,219,0.6)] px-[13px] text-[12px] leading-4 font-normal text-[#2a2419] transition-colors hover:bg-[rgba(232,227,219,0.85)]">
      {label}
    </span>
  );
}
