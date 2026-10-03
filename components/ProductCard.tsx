import Image from "next/image";
import { AddButton } from "@/components/AddButton";
import { selectionFromProduct } from "@/lib/catalog";
import { categoryLabel, formatMXN, productImageUrl } from "@/lib/format";
import type { CatalogProduct } from "@/lib/types";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const imageUrl = productImageUrl(product.imagePath);
  const showDiscount = product.msrp > product.salePrice && product.discountPercent > 0;

  return (
    <article className="flex flex-col bg-white shadow-sm">
      <div className="relative h-80 overflow-hidden bg-arquiluz-gray">
        {imageUrl ? (
          <Image src={imageUrl} alt={`${product.brand} ${product.model}`} fill className="object-cover" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
        ) : (
          <div className="flex h-full items-center justify-center font-serif text-5xl text-gray-300">
            {product.brand.slice(0, 1)}
          </div>
        )}
        {showDiscount && (
          <span className="absolute left-4 top-4 bg-arquiluz-accent px-3 py-1 text-xs font-medium tracking-wide text-white">
            -{product.discountPercent}%
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs uppercase tracking-wider text-gray-500">
          {product.brand} · {categoryLabel(product.category)}
        </p>
        <h2 className="mt-2 font-serif text-2xl font-semibold text-arquiluz-accent">{product.model}</h2>
        {product.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-700">{product.description}</p>
        )}
        <div className="mt-5 flex items-baseline gap-3">
          <p className="font-serif text-2xl">{formatMXN(product.salePrice)}</p>
          {showDiscount && <p className="text-sm text-gray-400 line-through">{formatMXN(product.msrp)}</p>}
        </div>
        <p className="mt-1 text-xs uppercase tracking-wider text-gray-500">
          {product.stock} {product.stock === 1 ? "disponible" : "disponibles"}
        </p>
        <AddButton item={selectionFromProduct(product)} />
      </div>
    </article>
  );
}
