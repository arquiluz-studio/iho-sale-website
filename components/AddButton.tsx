"use client";

import { useState } from "react";
import { useSelection } from "@/components/SelectionProvider";
import type { SelectionDraft } from "@/lib/types";

export function AddButton({ item }: { item: Omit<SelectionDraft, "quantity"> }) {
  const { items, add } = useSelection();
  const inList = items.some((entry) => entry.productId === item.productId);
  const [quantity, setQuantity] = useState(1);

  function clamp(value: number) {
    if (!Number.isFinite(value)) return 1;
    return Math.min(item.stock, Math.max(1, Math.floor(value)));
  }

  return (
    <div className="flex max-w-full items-center gap-2 sm:justify-end">
      <input
        type="number"
        min={1}
        max={item.stock}
        value={quantity}
        aria-label="Cantidad"
        onChange={(event) => setQuantity(clamp(Number(event.target.value)))}
        className="w-14 border border-black/10 px-2 py-1.5 text-center text-sm text-arquiluz-black"
      />
      <button
        type="button"
        onClick={() => add(item, clamp(quantity))}
        className="min-w-0 flex-1 border border-arquiluz-black px-3 py-1.5 text-xs font-medium tracking-wide transition-colors hover:bg-arquiluz-black hover:text-white sm:flex-none"
      >
        {inList ? "En tu lista" : "Agregar a mi lista"}
      </button>
    </div>
  );
}
