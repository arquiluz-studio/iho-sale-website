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
  return (
    <aside className="space-y-8">
      <form method="get" className="space-y-2">
        {category && <input type="hidden" name="category" value={category} />}
        {brand && <input type="hidden" name="brand" value={brand} />}
        <label className="block text-xs uppercase tracking-wider text-gray-500" htmlFor="catalog-search">
          Buscar
        </label>
        <div className="flex gap-2">
          <input
            id="catalog-search"
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
          <FilterLink
            key={value}
            href={catalogHref({ q, brand, category: value })}
            active={category === value}
          >
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
    </aside>
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
