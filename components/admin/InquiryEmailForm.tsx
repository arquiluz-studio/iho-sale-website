"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveInquiryEmail } from "@/app/admin/actions";

export function InquiryEmailForm({ email }: { email: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="mt-6 max-w-xl border border-black/10 bg-white p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        setSaved(false);
        const result = await saveInquiryEmail(new FormData(event.currentTarget));
        setPending(false);
        if (!result.ok) {
          setError(result.message);
          return;
        }
        setSaved(true);
        router.refresh();
      }}
    >
      <label className="block text-sm" htmlFor="inquiry-email">
        <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">Correo que recibe las solicitudes</span>
        <input
          id="inquiry-email"
          name="inquiry_email"
          type="email"
          required
          defaultValue={email}
          className="w-full border border-black/10 px-3 py-2"
        />
      </label>
      <p className="mt-2 text-sm text-gray-500">También le llega una copia a quien envió la lista.</p>
      {error && <p className="mt-2 text-sm text-arquiluz-accent">{error}</p>}
      <div className="mt-4 flex items-center gap-3">
        <button type="submit" disabled={pending} className="bg-arquiluz-black px-4 py-2 text-sm text-white disabled:opacity-40">
          {pending ? "Guardando…" : "Guardar"}
        </button>
        {saved && <p className="text-sm text-gray-600">Guardado.</p>}
      </div>
    </form>
  );
}
