import { CatalogFilters } from "@/components/CatalogFilters";
import { ProductCard } from "@/components/ProductCard";
import { catalogCategoryTree, categoryIdsForSlug, getCatalog, getCatalogBrands, getCategories, getInStockCategoryCounts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

function priceParam(value: string | undefined) {
  if (!value?.trim()) return "";
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return "";
  return String(number);
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; brand?: string; min?: string; max?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const cat = params.cat ?? "";
  const brand = params.brand ?? "";
  let min = priceParam(params.min);
  let max = priceParam(params.max);
  if (min && max && Number(min) > Number(max)) {
    [min, max] = [max, min];
  }

  const [categories, brands, counts] = await Promise.all([getCategories(), getCatalogBrands(), getInStockCategoryCounts()]);
  const groups = catalogCategoryTree(categories, counts);
  const products = await getCatalog({
    q,
    brand,
    categoryIds: cat ? categoryIdsForSlug(categories, cat) : null,
    min: min ? Number(min) : null,
    max: max ? Number(max) : null,
  });

  return (
    <main className="section-padding mx-auto max-w-7xl py-8 md:py-10">
      <h1 className="font-serif text-3xl font-medium leading-tight md:text-4xl">
        Mobiliario y accesorios en remate.
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-600">
        Elige las piezas que te interesan y alguien de IHO te contacta. Lo que ves es lo que hay.
      </p>
      <div className="mt-6 flex flex-col gap-4 md:mt-8 md:flex-row md:items-start md:gap-8">
        <div className="w-full shrink-0 md:w-52">
          <CatalogFilters q={q} cat={cat} brand={brand} min={min} max={max} brands={brands} groups={groups} />
        </div>
        <div className="min-w-0 flex-1">
          {products.length === 0 ? (
            <p className="text-gray-500">No hay piezas disponibles con esos filtros.</p>
          ) : (
            <div>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
