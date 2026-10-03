"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fulfillInquiry, updateInquiryStatus } from "@/app/admin/actions";
import { formatMXN } from "@/lib/format";
import type { Inquiry } from "@/lib/types";

export function InquiryActions({ inquiry }: { inquiry: Inquiry }) {
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(inquiry.items.map((item) => [item.id, item.quantityRequested]))
  );
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const locked = inquiry.status === "surtida" || inquiry.status === "cancelada";

  async function run(action: (formData: FormData) => Promise<{ ok: boolean; message?: string }>, formData: FormData) {
    setPending(true);
    setError(null);
    const result = await action(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.message ?? "No se pudo actualizar.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="divide-y divide-black/10 border border-black/10">
        {inquiry.items.map((item) => (
          <div key={item.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">{item.brand}</p>
              <p className="font-serif text-xl">{item.model}</p>
              <p className="text-sm text-gray-600">
                Pidió {item.quantityRequested} · {formatMXN(item.salePrice)}
              </p>
            </div>
            {locked ? (
              <p className="text-sm">Surtidas: {item.quantityFulfilled}</p>
            ) : (
              <label className="text-xs uppercase tracking-wider text-gray-500">
                A surtir
                <input
                  type="number"
                  min={0}
                  value={quantities[item.id] ?? 0}
                  onChange={(event) =>
                    setQuantities((current) => ({ ...current, [item.id]: Number(event.target.value) }))
                  }
                  className="ml-2 w-20 border border-black/10 px-2 py-1 text-sm text-arquiluz-black"
                />
              </label>
            )}
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-arquiluz-accent">{error}</p>}
      {!locked && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              const data = new FormData();
              data.set("id", inquiry.id);
              data.set(
                "items",
                JSON.stringify(
                  inquiry.items.map((item) => ({ item_id: item.id, quantity: quantities[item.id] ?? 0 }))
                )
              );
              void run(fulfillInquiry, data);
            }}
            className="bg-arquiluz-accent px-5 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            Dar salida y bajar stock
          </button>
          {inquiry.status === "nueva" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                const data = new FormData();
                data.set("id", inquiry.id);
                data.set("status", "en_contacto");
                void run(updateInquiryStatus, data);
              }}
              className="border border-arquiluz-black px-5 py-2 text-sm"
            >
              Marcar en contacto
            </button>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              const data = new FormData();
              data.set("id", inquiry.id);
              data.set("status", "cancelada");
              void run(updateInquiryStatus, data);
            }}
            className="px-5 py-2 text-sm text-gray-500"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
