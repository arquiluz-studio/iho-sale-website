"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createQuoteFromInquiry } from "@/app/admin/cotizaciones/actions";

export function CreateQuoteButton({ inquiryId }: { inquiryId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(null);
          const result = await createQuoteFromInquiry(inquiryId);
          setPending(false);
          if (!result.ok) {
            setError(result.message);
            return;
          }
          router.push(`/admin/cotizaciones/${result.id}`);
        }}
        className="bg-arquiluz-black px-5 py-2 text-sm text-white disabled:opacity-40"
      >
        {pending ? "Creando…" : "Crear cotización"}
      </button>
      {error && <p className="mt-2 text-sm text-arquiluz-accent">{error}</p>}
    </div>
  );
}
