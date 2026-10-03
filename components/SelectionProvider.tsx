"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { SelectionDraft } from "@/lib/types";

const STORAGE_KEY = "iho-sale-selection";

type SelectionContextValue = {
  items: SelectionDraft[];
  count: number;
  ready: boolean;
  add: (item: Omit<SelectionDraft, "quantity">, quantity: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<SelectionDraft[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SelectionDraft[];
        setItems(
          parsed.map((item) => ({
            ...item,
            msrp: typeof item.msrp === "number" ? item.msrp : item.salePrice,
          }))
        );
      }
    } catch {
      setItems([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<SelectionContextValue>(
    () => ({
      items,
      count: items.reduce((total, item) => total + item.quantity, 0),
      ready,
      add(item, quantity) {
        const nextQuantity = Math.min(item.stock, Math.max(1, Math.floor(quantity)));
        setItems((current) => {
          const existing = current.find((entry) => entry.productId === item.productId);
          if (existing) {
            return current.map((entry) =>
              entry.productId === item.productId ? { ...entry, ...item, quantity: nextQuantity } : entry
            );
          }
          return [...current, { ...item, quantity: nextQuantity }];
        });
      },
      setQuantity(productId, quantity) {
        setItems((current) =>
          current.flatMap((entry) => {
            if (entry.productId !== productId) return [entry];
            const next = Math.min(entry.stock, Math.max(0, quantity));
            if (next === 0) return [];
            return [{ ...entry, quantity: next }];
          })
        );
      },
      remove(productId) {
        setItems((current) => current.filter((entry) => entry.productId !== productId));
      },
      clear() {
        setItems([]);
      },
    }),
    [items, ready]
  );

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) throw new Error("useSelection debe usarse dentro de SelectionProvider");
  return context;
}
