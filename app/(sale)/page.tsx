import Link from "next/link";
import { getCategories, getInStockCategoryCounts } from "@/lib/catalog";
import { productImageUrl } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, counts] = await Promise.all([getCategories(), getInStockCategoryCounts()]);
  const departments = categories
    .filter((category) => !category.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => ({
      ...category,
      count: categories
        .filter((child) => child.parentId === category.id)
        .reduce((total, child) => total + (counts.get(child.id) ?? 0), 0),
    }))
    .filter((category) => category.count > 0);

  return (
    <main className="section-padding mx-auto max-w-7xl py-12 md:py-16">
      <h1 className="max-w-3xl font-serif text-4xl font-medium leading-tight md:text-6xl">
        Mobiliario y accesorios en remate.
      </h1>
      <p className="mt-4 max-w-xl text-gray-600">
        Elige una categoría. Alguien de IHO te contacta. Lo que ves es lo que hay.
      </p>
      <Link href="/productos" className="mt-6 inline-block text-sm font-medium text-arquiluz-accent hover:underline">
        Ver todas las piezas
      </Link>

      <p className="mb-6 mt-14 text-xs font-bold uppercase tracking-wider">Categorías</p>
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((category) => {
          const imageUrl = productImageUrl(category.imagePath);
          return (
            <Link key={category.id} href={`/productos?cat=${category.slug}`} className="group block">
              <div className="aspect-[4/3] overflow-hidden bg-arquiluz-gray">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt=""
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-end p-5">
                    <span className="font-serif text-3xl text-black/25">{category.name}</span>
                  </div>
                )}
              </div>
              <h2 className="mt-4 font-serif text-2xl group-hover:text-arquiluz-accent">{category.name}</h2>
              <p className="mt-1 text-sm text-gray-500">
                {category.count} {category.count === 1 ? "pieza" : "piezas"}
              </p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
