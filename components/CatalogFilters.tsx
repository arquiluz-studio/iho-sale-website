import { categoryLabel } from "@/lib/format";
import type { ProductCategory } from "@/lib/types";

const categories: ProductCategory[] = ["mobiliario", "accesorio"];

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
    <form method="get" className="grid gap-3 border border-black/10 bg-arquiluz-gray p-4 md:grid-cols-[1fr_1fr_1.4fr_auto]">
      <label className="text-sm">
        <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">Categoría</span>
        <select name="category" defaultValue={category} className="w-full border border-black/10 bg-white px-3 py-2">
          <option value="">Todas</option>
          {categories.map((value) => (
            <option key={value} value={value}>
              {categoryLabel(value)}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">Marca</span>
        <select name="brand" defaultValue={brand} className="w-full border border-black/10 bg-white px-3 py-2">
          <option value="">Todas</option>
          {brands.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">Buscar</span>
        <input
          name="q"
          defaultValue={q}
          placeholder="Marca o modelo"
          className="w-full border border-black/10 bg-white px-3 py-2"
        />
      </label>
      <div className="flex items-end">
        <button type="submit" className="w-full bg-arquiluz-black px-5 py-2 text-sm font-medium text-white">
          Filtrar
        </button>
      </div>
    </form>
  );
}
