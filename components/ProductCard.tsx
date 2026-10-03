import Image from "next/image";
import { AddButton } from "@/components/AddButton";
import { selectionFromProduct } from "@/lib/catalog";
import { SalePrice } from "@/components/SalePrice";
import { productImageUrl } from "@/lib/format";
import type { CatalogProduct } from "@/lib/types";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const imageUrl = productImageUrl(product.imagePath);

  return (
    <article className="flex gap-4 border-b border-black/10 py-4">
      <div className="relative h-24 w-24 shrink-0 bg-arquiluz-gray sm:h-28 sm:w-28">
        {imageUrl ? (
          <div className="absolute inset-2">
            <Image
              src={imageUrl}
              alt={`${product.brand} ${product.model}`}
              fill
              className="object-contain"
              sizes="112px"
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center font-serif text-2xl text-gray-300">
            {product.brand.slice(0, 1)}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wider text-gray-500">{product.brand}</p>
          <h2 className="mt-1 font-serif text-xl leading-tight">
            {product.model}
            {product.sku && <span className="ml-2 font-sans text-sm font-normal tracking-wide text-gray-500">{product.sku}</span>}
          </h2>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-600">{product.description}</p>
          )}
        </div>

        <div className="flex w-full shrink-0 flex-col items-end gap-2 sm:w-auto">
          <div className="text-right">
            <SalePrice msrp={product.msrp} salePrice={product.salePrice} />
            <p className="mt-1 text-xs uppercase tracking-wider text-gray-500">
              {product.stock} {product.stock === 1 ? "disponible" : "disponibles"}
            </p>
          </div>
          <AddButton item={selectionFromProduct(product)} />
        </div>
      </div>
    </article>
  );
}
