"use client";

import { useState } from "react";
import Link from "next/link";
import { submitInquiry } from "@/app/(sale)/solicitud/actions";
import { useSelection } from "@/components/SelectionProvider";
import { formatMXN } from "@/lib/format";

export function RequestForm() {
  const { items, ready, setQuantity, remove, clear } = useSelection();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  if (!ready) {
    return <p className="text-sm text-gray-500">Cargando tu lista…</p>;
  }

  if (done) {
    return (
      <div className="border border-black/10 bg-arquiluz-gray p-8">
        <h2 className="font-serif text-3xl">Recibimos tu solicitud</h2>
        <p className="mt-3 max-w-xl text-gray-700">
          Alguien de IHO te contacta para confirmar disponibilidad y entrega. No hay pago en esta página.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-arquiluz-accent">
          Volver al sale
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border border-black/10 p-8">
        <p className="text-gray-700">Todavía no elegiste piezas.</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-arquiluz-accent">
          Ver lo que hay en sale
        </Link>
      </div>
    );
  }

  const total = items.reduce((sum, item) => sum + item.salePrice * item.quantity, 0);

  return (
    <form
      className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const formData = new FormData(event.currentTarget);
        formData.set(
          "items",
          JSON.stringify(items.map((item) => ({ product_id: item.productId, quantity: item.quantity })))
        );
        const result = await submitInquiry(formData);
        setPending(false);
        if (!result.ok) {
          setError(result.message);
          return;
        }
        clear();
        setDone(true);
      }}
    >
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-4 border border-black/10 p-4">
            <div className="h-24 w-24 shrink-0 bg-arquiluz-gray">
              {item.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-gray-500">{item.brand}</p>
              <p className="font-serif text-xl">{item.model}</p>
              <p className="mt-1 text-sm">{formatMXN(item.salePrice)}</p>
              <div className="mt-3 flex items-center gap-3">
                <label className="text-xs uppercase tracking-wider text-gray-500">
                  Cantidad
                  <input
                    type="number"
                    min={1}
                    max={item.stock}
                    value={item.quantity}
                    onChange={(event) => setQuantity(item.productId, Number(event.target.value))}
                    className="ml-2 w-16 border border-black/10 px-2 py-1 text-sm text-arquiluz-black"
                  />
                </label>
                <button type="button" onClick={() => remove(item.productId)} className="text-xs text-gray-500 hover:text-arquiluz-accent">
                  Quitar
                </button>
              </div>
            </div>
          </div>
        ))}
        <p className="text-right font-serif text-2xl">{formatMXN(total)}</p>
      </div>

      <div className="space-y-4 border border-black/10 p-6">
        <h2 className="font-serif text-2xl">Tus datos</h2>
        <p className="text-sm text-gray-600">Te contactamos para apartar las piezas. No se cobra aquí.</p>
        <Field label="Nombre" name="name" required />
        <Field label="Empresa" name="company" />
        <Field label="Correo" name="email" type="email" required />
        <Field label="Teléfono" name="phone" type="tel" required />
        <label className="block text-sm">
          <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">Nota</span>
          <textarea name="note" rows={4} className="w-full border border-black/10 px-3 py-2" />
        </label>
        {error && <p className="text-sm text-arquiluz-accent">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-arquiluz-accent px-5 py-3 text-sm font-medium text-white disabled:opacity-40"
        >
          {pending ? "Enviando…" : "Solicitar contacto"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">{label}</span>
      <input name={name} type={type} required={required} className="w-full border border-black/10 px-3 py-2" />
    </label>
  );
}
