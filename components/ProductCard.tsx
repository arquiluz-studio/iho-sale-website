import Image from "next/image";
import { AddButton } from "@/components/AddButton";
import { selectionFromProduct } from "@/lib/catalog";
import { SalePrice } from "@/components/SalePrice";
import { productImageUrl } from "@/lib/format";
import type { CatalogProduct } from "@/lib/types";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const imageUrl = productImageUrl(product.imagePath);

  return (
    <article className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-3 gap-y-3 border-b border-black/10 py-4 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:gap-x-4">
      <div className="relative h-[5.5rem] w-[5.5rem] bg-arquiluz-gray sm:h-28 sm:w-28">
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

      <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-gray-500">{product.brand}</p>
          <h2 className="mt-1 font-serif text-lg leading-tight sm:text-xl">
            {product.model}
            {product.sku && (
              <span className="mt-0.5 block font-sans text-sm font-normal tracking-wide text-gray-500 sm:ml-2 sm:mt-0 sm:inline">
                {product.sku}
              </span>
            )}
          </h2>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-600">{product.description}</p>
          )}
          {product.dimensions && (
            <p className="mt-1 text-sm text-gray-500">
              {product.dimensions.split(" × ").map((part, index) => (
                <span key={`${part}-${index}`}>
                  {index > 0 && <span> × </span>}
                  <span className="whitespace-nowrap">{part}</span>
                </span>
              ))}
            </p>
          )}
      </div>

      <div className="col-span-2 flex flex-col items-stretch gap-2 sm:col-span-1 sm:col-start-3 sm:row-start-1 sm:items-end">
        <div className="text-left sm:text-right">
          <SalePrice msrp={product.msrp} salePrice={product.salePrice} />
          <p className="mt-1 text-xs uppercase tracking-wider text-gray-500">
            {product.stock} {product.stock === 1 ? "disponible" : "disponibles"}
          </p>
        </div>
        <AddButton item={selectionFromProduct(product)} />
      </div>
    </article>
  );
}
