import { ErrorStateShell } from "@/components/error-state-shell";

export default function NotFound() {
  return (
    <ErrorStateShell
      title="This page could not be found"
      description="The link may be outdated, the topic may not exist yet, or the document is no longer available."
      actions={[
        { type: "link", href: "/", label: "Back to library", tone: "primary" },
        { type: "link", href: "/author", label: "Open workspace" },
      ]}
      footer="If you followed a topic link with non-ASCII text, try reloading once before navigating back."
    />
  );
}
