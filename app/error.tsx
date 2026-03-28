"use client";

import { useEffect } from "react";
import { ErrorStateShell } from "@/components/error-state-shell";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorStateShell
      badge="!"
      title="Something went wrong"
      description="Try loading the page again. If the issue continues, return to the library and continue from there."
      actions={[
        { type: "button", onClick: reset, label: "Try again", tone: "primary" },
        { type: "link", href: "/", label: "Back to library" },
      ]}
      footer={error.digest ? `Error digest: ${error.digest}` : null}
    />
  );
}
