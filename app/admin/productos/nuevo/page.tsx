import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();

  return (
    <main>
      <h1 className="font-serif text-4xl">Nueva pieza</h1>
      <div className="mt-8 bg-white p-6">
        <ProductForm />
      </div>
    </main>
  );
}
