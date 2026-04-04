import Link from "next/link";
import { buildTopicHref } from "@/lib/wiki/routes";

type TopicPillProps = {
  label: string;
  href?: string;
  interactive?: boolean;
};

function TopicPillInner({ label, interactive }: { label: string; interactive: boolean }) {
  return (
    <span
      className={`inline-flex h-[26px] items-center justify-center rounded-full bg-[rgba(232,227,219,0.6)] px-[13px] text-[12px] leading-4 font-normal text-[var(--foreground)] transition-colors ${
        interactive ? "hover:bg-[rgba(232,227,219,0.85)]" : ""
      }`}
    >
      {label}
    </span>
  );
}

export function TopicPill({
  label,
  href = buildTopicHref(label),
  interactive = true,
}: TopicPillProps) {
  if (!interactive) {
    return <TopicPillInner label={label} interactive={false} />;
  }

  return (
    <Link href={href} prefetch={false} className="inline-flex">
      <TopicPillInner label={label} interactive />
    </Link>
  );
}
