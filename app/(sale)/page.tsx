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
    <main className="section-padding mx-auto max-w-7xl py-12 md:py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-arquiluz-accent">Sale</p>
      <h1 className="mt-3 max-w-3xl font-serif text-4xl font-medium leading-tight md:text-6xl">
        Mobiliario y accesorios en remate.
      </h1>
      <p className="mt-4 max-w-2xl text-gray-600">
        Elige las piezas que te interesan y alguien de IHO te contacta. Lo que ves es lo que hay.
      </p>
      <div className="mt-10">
        <CatalogFilters q={q} category={category} brand={brand} brands={brands} />
      </div>
      {products.length === 0 ? (
        <p className="mt-16 text-gray-500">No hay piezas disponibles con esos filtros.</p>
      ) : (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
