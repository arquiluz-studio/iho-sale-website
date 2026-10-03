import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getAdminProduct } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getAdminProduct(id);
  if (!product) notFound();

  return (
    <main>
      <h1 className="font-serif text-4xl">{product.model}</h1>
      <div className="mt-8 bg-white p-6">
        <ProductForm product={product} />
      </div>
    </main>
  );
}
