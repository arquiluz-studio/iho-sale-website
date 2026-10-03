"use client";

import { useState } from "react";
import { useSelection } from "@/components/SelectionProvider";
import type { SelectionDraft } from "@/lib/types";

export function AddButton({ item }: { item: Omit<SelectionDraft, "quantity"> }) {
  const { items, add } = useSelection();
  const [added, setAdded] = useState(false);
  const inList = items.some((entry) => entry.productId === item.productId);

  return (
    <button
      type="button"
      onClick={() => {
        add(item);
        setAdded(true);
      }}
      className="mt-5 w-full border border-arquiluz-black px-4 py-2 text-sm font-medium tracking-wide transition-colors hover:bg-arquiluz-black hover:text-white"
    >
      {inList || added ? "En tu lista" : "Agregar a mi lista"}
    </button>
  );
}
