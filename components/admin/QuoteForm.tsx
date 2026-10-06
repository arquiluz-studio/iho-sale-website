"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { confirmQuote, dispatchQuote, saveQuote, sendQuote } from "@/app/admin/cotizaciones/actions";
import { SalePrice } from "@/components/SalePrice";
import { formatQuoteNumber, formatUSD, quoteStatusLabel, quoteTotals } from "@/lib/format";
import type { Quote, QuoteProductOption } from "@/lib/types";

type Line = {
  key: string;
  id?: string;
  productId: string | null;
  brand: string;
  model: string;
  sku: string | null;
  quantity: number;
  msrp: number;
  salePrice: number;
  imageUrl: string | null;
};

export function QuoteForm({ quote, products }: { quote: Quote | null; products: QuoteProductOption[] }) {
  const router = useRouter();
  const [name, setName] = useState(quote?.name ?? "");
  const [company, setCompany] = useState(quote?.company ?? "");
  const [email, setEmail] = useState(quote?.email ?? "");
  const [phone, setPhone] = useState(quote?.phone ?? "");
  const [note, setNote] = useState(quote?.note ?? "");
  const [shipping, setShipping] = useState(quote ? String(quote.shipping) : "0");
  const [lines, setLines] = useState<Line[]>(() =>
    (quote?.items ?? []).map((item) => ({
      key: item.id,
      id: item.id,
      productId: item.productId,
      brand: item.brand,
      model: item.model,
      sku: item.sku,
      quantity: item.quantity,
      msrp: item.msrp,
      salePrice: item.salePrice,
      imageUrl: item.imageUrl,
    }))
  );
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState<"save" | "send" | "confirm" | "dispatch" | null>(null);
  const locked = quote?.status === "despachada";

  const shippingAmount = Number(String(shipping).replace(/,/g, ""));
  const totals = quoteTotals(lines, Number.isFinite(shippingAmount) && shippingAmount > 0 ? shippingAmount : 0);
  const matches = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("es");
    if (needle.length < 2) return [];
    return products
      .filter((product) => `${product.brand} ${product.model} ${product.sku ?? ""}`.toLocaleLowerCase("es").includes(needle))
      .slice(0, 8);
  }, [products, query]);

  function addProduct(product: QuoteProductOption) {
    setLines((current) => {
      const existing = current.find((line) => line.productId === product.id);
      if (existing) {
        return current.map((line) => (line.productId === product.id ? { ...line, quantity: line.quantity + 1 } : line));
      }
      return [
        ...current,
        {
          key: product.id,
          productId: product.id,
          brand: product.brand,
          model: product.model,
          sku: product.sku,
          quantity: 1,
          msrp: product.msrp,
          salePrice: product.salePrice,
          imageUrl: product.imageUrl,
        },
      ];
    });
    setQuery("");
  }

  function formData() {
    const data = new FormData();
    if (quote) data.set("id", quote.id);
    data.set("name", name);
    data.set("company", company);
    data.set("email", email);
    data.set("phone", phone);
    data.set("note", note);
    data.set("shipping", shipping);
    data.set(
      "items",
      JSON.stringify(lines.map((line) => ({ id: line.id, productId: line.productId, quantity: line.quantity })))
    );
    return data;
  }

  async function persist(mode: "save" | "send" | "confirm" | "dispatch") {
    setPending(mode);
    setError(null);
    setNotice(null);
    const result =
      mode === "save"
        ? await saveQuote(formData())
        : mode === "send"
          ? await sendQuote(formData())
          : mode === "confirm"
            ? await confirmQuote(formData())
            : await dispatchQuote(formData());
    setPending(null);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    if (!quote) {
      router.push(`/admin/cotizaciones/${result.id}`);
      return;
    }
    const message = "message" in result && typeof result.message === "string" ? result.message : undefined;
    const fallback = mode === "send" ? "Enviada." : mode === "confirm" ? "Confirmada." : mode === "dispatch" ? "Despachada." : "Guardado.";
    setNotice(message ?? fallback);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-arquiluz-accent">
            {quote ? quoteStatusLabel(quote.status) : "Nueva"}
          </p>
          <h1 className="mt-2 font-serif text-4xl">{quote ? formatQuoteNumber(quote.number) : "Nueva cotización"}</h1>
        </div>
        <a href="/admin/cotizaciones" className="text-sm font-medium text-arquiluz-accent">
          Volver
        </a>
      </div>

      <div className="grid gap-4 border border-black/10 bg-white p-5 md:grid-cols-2">
        <Field label="Nombre" value={name} onChange={setName} readOnly={locked} />
        <Field label="Empresa" value={company} onChange={setCompany} readOnly={locked} />
        <Field label="Correo" value={email} onChange={setEmail} type="email" readOnly={locked} />
        <Field label="Teléfono" value={phone} onChange={setPhone} readOnly={locked} />
        <label className="block text-sm md:col-span-2">
          <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">Nota</span>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} readOnly={locked} className="w-full border border-black/10 px-3 py-2 read-only:bg-white" />
        </label>
      </div>

      <div className="border border-black/10 bg-white p-5">
        {!locked && (
        <label className="block text-sm" htmlFor="quote-product-search">
          <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">Agregar producto</span>
          <input
            id="quote-product-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Marca, modelo o SKU"
            className="w-full border border-black/10 px-3 py-2"
          />
        </label>
        )}
        {matches.length > 0 && (
          <ul className="mt-2 divide-y divide-black/10 border border-black/10">
            {matches.map((product) => (
              <li key={product.id}>
                <button type="button" onClick={() => addProduct(product)} className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-arquiluz-gray">
                  <span className="flex min-w-0 items-center gap-3">
                    <ProductThumb src={product.imageUrl} />
                    <span className="min-w-0">
                      <span className="text-xs uppercase tracking-wider text-gray-500">{product.brand}</span>
                      <span className="mt-0.5 block truncate">{product.model}</span>
                    </span>
                  </span>
                  <span className="shrink-0 text-gray-500">{formatUSD(product.salePrice)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 divide-y divide-black/10">
          {lines.map((line) => (
            <div key={line.key} className={`grid gap-3 py-3 sm:items-center ${locked ? "sm:grid-cols-[1fr_auto]" : "sm:grid-cols-[1fr_auto_auto]"}`}>
              <div className="flex min-w-0 items-center gap-3">
                <ProductThumb src={line.imageUrl} />
                <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-gray-500">{line.brand}</p>
                <p>{line.model}</p>
                {line.sku && <p className="text-sm text-gray-500">{line.sku}</p>}
                <SalePrice msrp={line.msrp} salePrice={line.salePrice} prominent={false} align="left" />
                </div>
              </div>
              <label className="text-xs uppercase tracking-wider text-gray-500">
                Cantidad
                {locked ? (
                  <span className="ml-2 text-sm normal-case tracking-normal text-arquiluz-black">{line.quantity}</span>
                ) : (
                  <input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(event) => {
                      const quantity = Math.floor(Number(event.target.value));
                      if (!Number.isInteger(quantity) || quantity < 1) return;
                      setLines((current) => current.map((entry) => (entry.key === line.key ? { ...entry, quantity } : entry)));
                    }}
                    className="ml-2 w-20 border border-black/10 px-2 py-1 text-sm text-arquiluz-black"
                  />
                )}
              </label>
              {!locked && (
              <button
                type="button"
                onClick={() => setLines((current) => current.filter((entry) => entry.key !== line.key))}
                className="text-left text-sm text-gray-500 hover:text-arquiluz-accent"
              >
                Quitar
              </button>
              )}
            </div>
          ))}
          {lines.length === 0 && <p className="py-4 text-sm text-gray-500">Todavía no hay piezas.</p>}
        </div>
      </div>

      <div className="grid gap-6 border border-black/10 bg-white p-5 md:grid-cols-[16rem_1fr] md:items-start">
        <label className="block text-sm" htmlFor="quote-shipping">
          <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">Envío</span>
          <input
            id="quote-shipping"
            inputMode="decimal"
            value={shipping}
            readOnly={locked}
            onChange={(event) => setShipping(event.target.value)}
            className="w-full border border-black/10 px-3 py-2 read-only:bg-white"
          />
        </label>
        <div>
          <dl className="space-y-2 text-sm">
            <Row label="Precio de lista" value={formatUSD(totals.listTotal)} />
            <Row label="Descuento" value={`-${formatUSD(totals.discount)}`} accent />
            <Row label="Subtotal" value={formatUSD(totals.subtotal)} />
            <Row label="Envío" value={formatUSD(totals.shipping)} />
            <Row label="ITBMS 7%" value={formatUSD(totals.itbms)} />
            <div className="flex items-baseline justify-between gap-6 font-serif text-2xl">
              <dt>A pagar</dt>
              <dd>{formatUSD(totals.total)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-sm text-gray-500">El ITBMS del 7% aplica sobre las piezas y el envío.</p>
          {totals.shipping === 0 && (
            <p className="mt-1 text-sm text-gray-500">No incluye costos de entrega. El precio es para retirar en tienda.</p>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-arquiluz-accent">{error}</p>}
      {notice && <p className="text-sm text-gray-600">{notice}</p>}
      <div className="flex flex-wrap gap-3">
        {!locked && (
          <button type="button" disabled={pending !== null} onClick={() => void persist("save")} className="bg-arquiluz-black px-5 py-2 text-sm text-white disabled:opacity-40">
            {pending === "save" ? "Guardando…" : "Guardar"}
          </button>
        )}
        {!locked && (
          <button type="button" disabled={pending !== null} onClick={() => void persist("send")} className="bg-arquiluz-accent px-5 py-2 text-sm font-medium text-white disabled:opacity-40">
            {pending === "send" ? "Enviando…" : "Enviar al cliente"}
          </button>
        )}
        {quote && (
          <a href={`/admin/cotizaciones/${quote.id}/pdf`} target="_blank" rel="noopener" className="border border-arquiluz-black px-5 py-2 text-sm">
            Descargar PDF
          </a>
        )}
        {quote && !locked && quote.status !== "confirmada" && (
          <button type="button" disabled={pending !== null} onClick={() => void persist("confirm")} className="border border-arquiluz-black px-5 py-2 text-sm disabled:opacity-40">
            {pending === "confirm" ? "Confirmando…" : "Marcar confirmada"}
          </button>
        )}
        {quote && !locked && (
          <button type="button" disabled={pending !== null} onClick={() => void persist("dispatch")} className="bg-arquiluz-accent px-5 py-2 text-sm font-medium text-white disabled:opacity-40">
            {pending === "dispatch" ? "Despachando…" : "Despachar y bajar stock"}
          </button>
        )}
      </div>
    </div>
  );
}

function ProductThumb({ src }: { src: string | null }) {
  return (
    <div className="h-14 w-14 shrink-0 bg-arquiluz-gray">
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-contain" />
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">{label}</span>
      <input type={type} value={value} readOnly={readOnly} onChange={(event) => onChange(event.target.value)} className="w-full border border-black/10 px-3 py-2 read-only:bg-white" />
    </label>
  );
}

function Row({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <dt className="text-gray-500">{label}</dt>
      <dd className={accent ? "text-arquiluz-accent" : undefined}>{value}</dd>
    </div>
  );
}
