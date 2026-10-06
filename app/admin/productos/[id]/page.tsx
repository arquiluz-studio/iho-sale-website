import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getAdminProduct } from "@/lib/admin";
import { getCategories } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getAdminProduct(id), getCategories()]);
  if (!product) notFound();

  return (
    <main>
      <div className="flex items-center justify-between gap-4">
        <h1 className="min-w-0 font-serif text-3xl md:text-4xl">{product.model}</h1>
        <Link
          href="/admin/productos"
          className="inline-flex shrink-0 items-center gap-2 border border-arquiluz-accent px-4 py-2 text-sm font-medium text-arquiluz-accent hover:bg-arquiluz-accent hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5 5 12l7 7" />
          </svg>
          Regresar
        </Link>
      </div>
      <div className="mt-8 bg-white p-6">
        <ProductForm product={product} categories={categories} />
      </div>
    </main>
  );
}
