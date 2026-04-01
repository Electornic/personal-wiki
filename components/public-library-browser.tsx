import type { ReactNode } from "react";

import { DocumentCard } from "@/entities/record/ui/document-card";
import type { WikiDocumentPreview } from "@/entities/record/model/types";

type PublicLibraryBrowserProps = {
  records: WikiDocumentPreview[];
  recordCount?: number;
  controlsSlot?: ReactNode;
};

export function PublicLibraryBrowser({
  records,
  recordCount,
  controlsSlot,
}: PublicLibraryBrowserProps) {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[30px] leading-9 font-semibold tracking-[-0.3px] text-[#2a2419]">
          Browse Library
        </h2>
        <span className="text-[14px] leading-5 text-[#6b6354]">
          {recordCount ?? records.length}{" "}
          {(recordCount ?? records.length) === 1 ? "record" : "records"}
        </span>
      </div>

      {controlsSlot}

      <div className="mt-8 grid gap-6">
        {records.map((document) => (
          <DocumentCard key={document.id} document={document} />
        ))}
      </div>

      {records.length === 0 ? (
        <div className="rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-white px-6 py-12 text-center text-[18px] leading-8 text-[#6b6354]">
          No matching records found.
        </div>
      ) : null}
    </>
  );
}
