"use client";

import { useEffect } from "react";
import { ErrorStateShell } from "@/components/error-state-shell";

export default function GlobalError({
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
    <html lang="en">
      <body className="bg-[#faf8f5] text-[#2a2419]">
        <ErrorStateShell
          title="The app hit an unexpected problem"
          description="Reload the page or try again. If the issue persists, return to the home page and restart the flow."
          actions={[
            { type: "button", onClick: reset, label: "Try again", tone: "primary" },
            { type: "link", href: "/", label: "Back to library" },
          ]}
          fullScreen
          footer={error.digest ? `Error digest: ${error.digest}` : null}
        />
      </body>
    </html>
  );
}
