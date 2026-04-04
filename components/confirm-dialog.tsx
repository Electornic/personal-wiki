"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="m-auto max-w-[400px] rounded-[8px] border border-[var(--border)] bg-[var(--card)] p-0 shadow-[0_16px_48px_rgba(0,0,0,0.12)] backdrop:bg-black/40"
      onClose={onCancel}
    >
      <div className="px-6 pt-6 pb-4">
        <h3 className="text-[16px] font-semibold text-[var(--foreground)]">{title}</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">{description}</p>
      </div>
      <div className="flex justify-end gap-2 border-t border-[var(--border)] px-6 py-4">
        <button
          className="h-9 rounded-[4px] border border-[var(--border)] px-4 text-[13px] font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-hover)]"
          onClick={onCancel}
          type="button"
        >
          {cancelLabel}
        </button>
        <button
          className={`h-9 rounded-[4px] px-4 text-[13px] font-medium text-white transition ${
            danger
              ? "bg-[var(--danger)] hover:bg-[var(--danger-hover)]"
              : "bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
          }`}
          onClick={onConfirm}
          type="button"
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
