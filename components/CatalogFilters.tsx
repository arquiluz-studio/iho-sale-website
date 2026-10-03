"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { categoryLabel, properCase } from "@/lib/format";
import type { ProductCategory } from "@/lib/types";

const categories: ProductCategory[] = ["mobiliario", "accesorio"];

function catalogHref(filters: { q?: string; category?: string; brand?: string }) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.brand) params.set("brand", filters.brand);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export function CatalogFilters({
  q,
  category,
  brand,
  brands,
}: {
  q: string;
  category: string;
  brand: string;
  brands: string[];
}) {
  const [open, setOpen] = useState(false);
  const active = [
    category === "mobiliario" || category === "accesorio" ? categoryLabel(category) : "",
    brand ? properCase(brand) : "",
  ].filter(Boolean);

  useEffect(() => {
    setOpen(false);
  }, [q, category, brand]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="flex w-full items-center justify-between border border-black/10 px-4 py-3 text-left text-sm font-medium md:hidden"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span className="min-w-0 truncate">{active.length > 0 ? `Filtros · ${active.join(" · ")}` : "Filtros"}</span>
        <span className="ml-3 shrink-0 text-arquiluz-accent">Abrir</span>
      </button>

      <aside className="hidden space-y-8 md:block">
        <FilterFields idPrefix="desktop" q={q} category={category} brand={brand} brands={brands} />
      </aside>

      {open && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col bg-white md:hidden">
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
            <p className="font-serif text-xl">Filtros</p>
            <button type="button" className="text-sm font-medium text-arquiluz-accent" onClick={() => setOpen(false)}>
              Cerrar
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <FilterFields idPrefix="mobile" q={q} category={category} brand={brand} brands={brands} />
          </div>
        </div>
      )}
    </>
  );
}

function FilterFields({
  idPrefix,
  q,
  category,
  brand,
  brands,
}: {
  idPrefix: string;
  q: string;
  category: string;
  brand: string;
  brands: string[];
}) {
  return (
    <div className="space-y-8">
      <form method="get" className="space-y-2">
        {category && <input type="hidden" name="category" value={category} />}
        {brand && <input type="hidden" name="brand" value={brand} />}
        <label className="block text-xs uppercase tracking-wider text-gray-500" htmlFor={`${idPrefix}-catalog-search`}>
          Buscar
        </label>
        <div className="flex gap-2">
          <input
            id={`${idPrefix}-catalog-search`}
            name="q"
            defaultValue={q}
            placeholder="Marca o modelo"
            className="w-full border border-black/10 bg-white px-3 py-2 text-sm"
          />
          <button type="submit" className="bg-arquiluz-black px-3 py-2 text-sm text-white">
            Ir
          </button>
        </div>
      </form>

      <FilterGroup title="Categoría">
        <FilterLink href={catalogHref({ q, brand })} active={!category}>
          TODAS
        </FilterLink>
        {categories.map((value) => (
          <FilterLink key={value} href={catalogHref({ q, brand, category: value })} active={category === value}>
            {categoryLabel(value)}
          </FilterLink>
        ))}
      </FilterGroup>

      <FilterGroup title="Marca">
        <FilterLink href={catalogHref({ q, category })} active={!brand}>
          TODAS
        </FilterLink>
        {brands.map((value) => (
          <FilterLink key={value} href={catalogHref({ q, category, brand: value })} active={brand === value}>
            {properCase(value)}
          </FilterLink>
        ))}
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-arquiluz-black">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`block py-1 text-sm ${active ? "font-medium text-arquiluz-accent" : "text-arquiluz-black hover:text-arquiluz-accent"}`}
    >
      {children}
    </Link>
  );
}
