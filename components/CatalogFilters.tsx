"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { properCase } from "@/lib/format";
import type { CatalogCategoryGroup } from "@/lib/types";

type Filters = {
  q?: string;
  cat?: string;
  brand?: string;
  min?: string;
  max?: string;
};

function catalogHref(filters: Filters) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.cat) params.set("cat", filters.cat);
  if (filters.brand) params.set("brand", filters.brand);
  if (filters.min) params.set("min", filters.min);
  if (filters.max) params.set("max", filters.max);
  const query = params.toString();
  return query ? `/productos?${query}` : "/productos";
}

function priceLabel(min: string, max: string) {
  if (min && max) return `$${min}–$${max}`;
  if (min) return `Desde $${min}`;
  if (max) return `Hasta $${max}`;
  return "";
}

export function CatalogFilters({
  q,
  cat,
  brand,
  min,
  max,
  brands,
  groups,
}: {
  q: string;
  cat: string;
  brand: string;
  min: string;
  max: string;
  brands: string[];
  groups: CatalogCategoryGroup[];
}) {
  const [open, setOpen] = useState(false);
  const selected = groups
    .flatMap((group) => [{ slug: group.slug, name: group.name }, ...group.children])
    .find((item) => item.slug === cat);
  const active = [selected?.name ?? "", brand ? properCase(brand) : "", priceLabel(min, max)].filter(Boolean);

  useEffect(() => {
    setOpen(false);
  }, [q, cat, brand, min, max]);

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
        <FilterFields idPrefix="desktop" q={q} cat={cat} brand={brand} min={min} max={max} brands={brands} groups={groups} />
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
            <FilterFields idPrefix="mobile" q={q} cat={cat} brand={brand} min={min} max={max} brands={brands} groups={groups} />
          </div>
        </div>
      )}
    </>
  );
}

function openGroupsFor(groups: CatalogCategoryGroup[], cat: string) {
  const match = groups.find((group) => group.slug === cat || group.children.some((child) => child.slug === cat));
  return match ? [match.slug] : [];
}

function FilterFields({
  idPrefix,
  q,
  cat,
  brand,
  min,
  max,
  brands,
  groups,
}: {
  idPrefix: string;
  q: string;
  cat: string;
  brand: string;
  min: string;
  max: string;
  brands: string[];
  groups: CatalogCategoryGroup[];
}) {
  const kept = { q, cat, brand, min, max };
  const [expanded, setExpanded] = useState(() => openGroupsFor(groups, cat));

  useEffect(() => {
    const match = openGroupsFor(groups, cat);
    if (match.length === 0) return;
    setExpanded((current) => (current.includes(match[0]) ? current : [...current, match[0]]));
  }, [cat, groups]);

  function toggleGroup(slug: string) {
    setExpanded((current) => (current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]));
  }

  return (
    <div className="space-y-8">
      <form method="get" action="/productos" className="space-y-2">
        {cat && <input type="hidden" name="cat" value={cat} />}
        {brand && <input type="hidden" name="brand" value={brand} />}
        {min && <input type="hidden" name="min" value={min} />}
        {max && <input type="hidden" name="max" value={max} />}
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

      <PriceFilter idPrefix={idPrefix} q={q} cat={cat} brand={brand} min={min} max={max} />

      <FilterGroup title="Categoría">
        <FilterRow>
          <FilterLink href={catalogHref({ q, brand, min, max })} active={!cat} strong>
            TODAS
          </FilterLink>
        </FilterRow>
        {groups.map((group) => {
          const isOpen = expanded.includes(group.slug);
          return (
            <div key={group.slug} className="pt-2">
              <div className="flex items-start gap-1">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-label={isOpen ? `Cerrar ${group.name}` : `Abrir ${group.name}`}
                  onClick={() => toggleGroup(group.slug)}
                  className="mt-1.5 shrink-0 text-arquiluz-black"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-3.5 w-3.5 ${isOpen ? "rotate-90" : ""}`} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
                  </svg>
                </button>
                <div className="min-w-0 flex-1">
                  <FilterLink href={catalogHref({ ...kept, cat: group.slug })} active={cat === group.slug} strong>
                    {group.name}
                  </FilterLink>
                  {isOpen &&
                    group.children.map((child) => (
                      <FilterLink key={child.slug} href={catalogHref({ ...kept, cat: child.slug })} active={cat === child.slug} indent>
                        {child.name}
                      </FilterLink>
                    ))}
                </div>
              </div>
            </div>
          );
        })}
      </FilterGroup>

      <FilterGroup title="Marca">
        <FilterRow>
          <FilterLink href={catalogHref({ q, cat, min, max })} active={!brand}>
            TODAS
          </FilterLink>
        </FilterRow>
        {brands.map((value) => (
          <FilterRow key={value}>
            <FilterLink href={catalogHref({ ...kept, brand: value })} active={brand === value}>
              {properCase(value)}
            </FilterLink>
          </FilterRow>
        ))}
      </FilterGroup>

    </div>
  );
}

function PriceFilter({
  idPrefix,
  q,
  cat,
  brand,
  min,
  max,
}: {
  idPrefix: string;
  q: string;
  cat: string;
  brand: string;
  min: string;
  max: string;
}) {
  return (
    <form method="get" action="/productos" className="space-y-2">
      {q && <input type="hidden" name="q" value={q} />}
      {cat && <input type="hidden" name="cat" value={cat} />}
      {brand && <input type="hidden" name="brand" value={brand} />}
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-arquiluz-black">Precio</p>
      <label className="block text-sm" htmlFor={`${idPrefix}-price-min`}>
        <span className="mb-1 block text-xs text-gray-500">Mínimo</span>
        <input
          id={`${idPrefix}-price-min`}
          name="min"
          inputMode="decimal"
          defaultValue={min}
          placeholder="0"
          className="w-full border border-black/10 bg-white px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-sm" htmlFor={`${idPrefix}-price-max`}>
        <span className="mb-1 block text-xs text-gray-500">Máximo</span>
        <input
          id={`${idPrefix}-price-max`}
          name="max"
          inputMode="decimal"
          defaultValue={max}
          placeholder="Sin tope"
          className="w-full border border-black/10 bg-white px-3 py-2 text-sm"
        />
      </label>
      <button type="submit" className="w-full border border-arquiluz-black px-3 py-2 text-sm">
        Aplicar
      </button>
    </form>
  );
}

function FilterRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-1">
      <span className="w-3.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">{children}</div>
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

function FilterLink({
  href,
  active,
  strong,
  indent,
  children,
}: {
  href: string;
  active: boolean;
  strong?: boolean;
  indent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`block py-1 text-sm ${indent ? "pl-3" : ""} ${strong ? "font-bold" : active ? "font-medium" : ""} ${active ? "text-arquiluz-accent" : "text-arquiluz-black hover:text-arquiluz-accent"}`}
    >
      {children}
    </Link>
  );
}
