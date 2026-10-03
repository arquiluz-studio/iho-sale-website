"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct, saveProduct } from "@/app/admin/actions";
import type { AdminProduct, ProductCategory } from "@/lib/types";

type Draft = {
  brand: string;
  model: string;
  description: string;
  category: ProductCategory;
  cost: string;
  msrp: string;
  discount: string;
  salePrice: string;
  stock: string;
};

function money(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function ProductForm({ product }: { product?: AdminProduct }) {
  const [draft, setDraft] = useState<Draft>({
    brand: product?.brand ?? "",
    model: product?.model ?? "",
    description: product?.description ?? "",
    category: product?.category ?? "mobiliario",
    cost: product ? money(product.cost) : "",
    msrp: product ? money(product.msrp) : "",
    discount: product ? money(product.discountPercent) : "",
    salePrice: product ? money(product.salePrice) : "",
    stock: product ? String(product.stock) : "1",
  });
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const linked = useMemo(() => draft, [draft]);

  function updateSale(salePrice: string, msrpValue = linked.msrp) {
    const msrp = Number(msrpValue);
    const sale = Number(salePrice);
    const discount = msrp > 0 && sale < msrp ? roundMoney(((msrp - sale) / msrp) * 100) : 0;
    setDraft((current) => ({
      ...current,
      msrp: msrpValue,
      salePrice,
      discount: salePrice === "" ? current.discount : money(discount),
    }));
  }

  function updateDiscount(discount: string, msrpValue = linked.msrp) {
    const msrp = Number(msrpValue);
    const percent = Number(discount);
    const sale = msrp > 0 && discount !== "" ? roundMoney(msrp * (1 - percent / 100)) : Number(linked.salePrice);
    setDraft((current) => ({
      ...current,
      msrp: msrpValue,
      discount,
      salePrice: discount === "" || !Number.isFinite(sale) ? current.salePrice : money(Math.max(0, sale)),
    }));
  }

  return (
    <form
      className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const result = await saveProduct(new FormData(event.currentTarget));
        if (!result.ok) {
          setError(result.message);
          setPending(false);
          return;
        }
        router.push(`/admin/productos/${result.id}`);
        router.refresh();
      }}
    >
      {product && <input type="hidden" name="id" value={product.id} />}
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Marca" name="brand" value={draft.brand} onChange={(brand) => setDraft({ ...draft, brand })} required />
          <TextField label="Modelo" name="model" value={draft.model} onChange={(model) => setDraft({ ...draft, model })} required />
        </div>
        <label className="block text-sm">
          <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">Categoría</span>
          <select
            name="category"
            value={draft.category}
            onChange={(event) => setDraft({ ...draft, category: event.target.value as ProductCategory })}
            className="w-full border border-black/10 px-3 py-2"
          >
            <option value="mobiliario">Mobiliario</option>
            <option value="accesorio">Accesorio</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">Descripción</span>
          <textarea
            name="description"
            value={draft.description}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            rows={5}
            className="w-full border border-black/10 px-3 py-2"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Costo" name="cost" value={draft.cost} onChange={(cost) => setDraft({ ...draft, cost })} inputMode="decimal" required />
          <TextField label="Stock" name="stock" value={draft.stock} onChange={(stock) => setDraft({ ...draft, stock })} inputMode="numeric" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField
            label="MSRP"
            name="msrp"
            value={draft.msrp}
            inputMode="decimal"
            required
            onChange={(msrp) => updateDiscount(draft.discount, msrp)}
          />
          <TextField
            label="Descuento %"
            name="discount_percent"
            value={draft.discount}
            inputMode="decimal"
            onChange={(discount) => updateDiscount(discount)}
          />
          <TextField
            label="Precio de venta"
            name="sale_price"
            value={draft.salePrice}
            inputMode="decimal"
            required
            onChange={(salePrice) => updateSale(salePrice)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">Foto</span>
          <input
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : null);
            }}
            className="w-full text-sm"
          />
        </label>
        <div className="flex h-64 items-center justify-center bg-arquiluz-gray">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm text-gray-400">{product?.imagePath ? "Foto actual guardada" : "Sin foto"}</span>
          )}
        </div>
        {error && <p className="text-sm text-arquiluz-accent">{error}</p>}
        <button type="submit" disabled={pending} className="w-full bg-arquiluz-black px-5 py-3 text-sm font-medium text-white disabled:opacity-40">
          {pending ? "Guardando…" : "Guardar"}
        </button>
        {product && (
          <button
            type="button"
            className="w-full border border-arquiluz-accent px-5 py-3 text-sm font-medium text-arquiluz-accent"
            onClick={() => {
              if (!window.confirm("¿Eliminar esta pieza?")) return;
              const data = new FormData();
              data.set("id", product.id);
              data.set("image_path", product.imagePath ?? "");
              void deleteProduct(data).then((result) => {
                if (!result.ok) {
                  setError(result.message);
                  return;
                }
                router.push("/admin/productos");
                router.refresh();
              });
            }}
          >
            Eliminar
          </button>
        )}
      </div>
    </form>
  );
}

function TextField({
  label,
  name,
  value,
  onChange,
  required,
  inputMode,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  inputMode?: "decimal" | "numeric";
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">{label}</span>
      <input
        name={name}
        value={value}
        required={required}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-black/10 px-3 py-2"
      />
    </label>
  );
}
