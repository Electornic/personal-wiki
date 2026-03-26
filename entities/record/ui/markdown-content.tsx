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
        "max-w-none text-[#2a2419]",
        className ?? "",
      ].join(" ")}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-0 mb-4 text-[30px] leading-9 font-semibold tracking-[-0.3px] text-[#2a2419]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-10 mb-3 text-[24px] leading-8 font-semibold text-[#2a2419]">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-8 mb-3 text-[20px] leading-7 font-semibold text-[#2a2419]">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-6 text-[18px] leading-[29.25px] text-[#2a2419]">
              {children}
            </p>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-8 border-l-4 border-[rgba(42,36,25,0.1)] pl-7 text-[18px] leading-[29.25px] italic text-[rgba(42,36,25,0.8)]">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="my-6 list-disc pl-6 text-[18px] leading-[29.25px] text-[#2a2419]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-6 list-decimal pl-6 text-[18px] leading-[29.25px] text-[#2a2419]">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="mb-2 pl-1 marker:text-[#2a2419]">{children}</li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-medium text-[#5b4330] underline decoration-[rgba(91,67,48,0.55)] underline-offset-4 hover:text-[#2a2419]"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            // Plain img keeps markdown image support simple across public and preview surfaces.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src ?? ""}
              alt={alt ?? ""}
              className="my-8 w-full rounded-[10px] border border-[rgba(42,36,25,0.08)] bg-[rgba(232,227,219,0.24)] object-cover shadow-[0_12px_36px_rgba(42,36,25,0.08)]"
              loading="lazy"
            />
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-[#2a2419]">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-[rgba(42,36,25,0.85)]">{children}</em>
          ),
          code: ({ children }) => (
            <code className="rounded bg-[rgba(232,227,219,0.6)] px-1.5 py-0.5 text-[0.95em] text-[#2a2419]">
              {children}
            </code>
          ),
        }}
      >
        {contents}
      </ReactMarkdown>
    </div>
  );
}
