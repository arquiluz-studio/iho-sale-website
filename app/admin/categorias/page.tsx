import { CategoryImageForm } from "@/components/admin/CategoryImageForm";
import { requireAdmin } from "@/lib/auth";
import { getCategories } from "@/lib/catalog";
import { productImageUrl } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await requireAdmin();
  const categories = await getCategories();
  const departments = categories.filter((category) => !category.parentId).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <main>
      <h1 className="font-serif text-4xl">Categorías</h1>
      <p className="mt-2 max-w-xl text-sm text-gray-600">La foto de cada categoría es la que se ve en la portada del outlet.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((category) => (
          <CategoryImageForm
            key={category.id}
            id={category.id}
            name={category.name}
            imageUrl={productImageUrl(category.imagePath)}
          />
        ))}
      </div>
    </main>
  );
}
