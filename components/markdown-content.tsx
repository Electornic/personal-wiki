import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownContentProps = {
  contents: string;
  className?: string;
};

export function MarkdownContent({ contents, className }: MarkdownContentProps) {
  return (
    <div
      className={[
        "prose prose-stone max-w-none",
        "prose-headings:font-serif prose-headings:text-stone-900",
        "prose-p:text-stone-700 prose-li:text-stone-700 prose-strong:text-stone-900",
        "prose-a:text-stone-900 prose-a:underline-offset-4",
        className ?? "",
      ].join(" ")}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{contents}</ReactMarkdown>
    </div>
  );
}
