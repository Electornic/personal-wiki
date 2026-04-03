"use client";

import { useState } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";

function DeleteIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path
        d="M5.333 4h5.334M6.667 2.667h2.666M5.333 6v5.333M8 6v5.333M10.667 6v5.333M4 4.667h8v7.666A1.333 1.333 0 0 1 10.667 13.667H5.333A1.333 1.333 0 0 1 4 12.333V4.667Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export function DeleteDocumentButton({
  documentId,
  documentTitle,
  action,
}: {
  documentId: string;
  documentTitle: string;
  action: (formData: FormData) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[4px] border border-[var(--border)] bg-[var(--card)] text-[var(--danger)] transition hover:bg-red-50"
        onClick={() => setOpen(true)}
        type="button"
      >
        <DeleteIcon />
      </button>

      <ConfirmDialog
        open={open}
        title="Delete record"
        description={`"${documentTitle}" will be permanently deleted. This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Keep"
        danger
        onConfirm={() => {
          setOpen(false);
          const formData = new FormData();
          formData.set("documentId", documentId);
          action(formData);
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
