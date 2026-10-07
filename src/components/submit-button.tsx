"use client";
import { useFormStatus } from "react-dom";
export default function SubmitButton({
  children,
  pending = "…",
  action,
}: {
  children: React.ReactNode;
  pending?: string;
  action?: (formData: FormData) => void | Promise<void>;
}) {
  const { pending: busy } = useFormStatus();
  return (
    <button className="button" formAction={action} disabled={busy}>
      {busy ? pending : children}
    </button>
  );
}
