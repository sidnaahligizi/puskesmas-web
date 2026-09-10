"use client";
import { useFormStatus } from "react-dom";

export function SubmitButton({ text = "Simpan Data", className = "btn btn-primary px-4 rounded-pill fw-bold" }: { text?: string, className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Memproses...
        </>
      ) : text}
    </button>
  );
}