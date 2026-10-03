import { CatalogFilters } from "@/components/CatalogFilters";
import { ProductCard } from "@/components/ProductCard";
import { getCatalog, getCatalogBrands } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; brand?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const category = params.category ?? "";
  const brand = params.brand ?? "";
  const [products, brands] = await Promise.all([
    getCatalog({ q, category, brand }),
    getCatalogBrands(),
  ]);

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
          <CatalogFilters q={q} category={category} brand={brand} brands={brands} />
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
