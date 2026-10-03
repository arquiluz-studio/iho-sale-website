import { productImageUrl, toNumber } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { AdminProduct, CatalogProduct, Inquiry, InquiryItem, ProductCategory } from "@/lib/types";

const PUBLIC_COLUMNS =
  "id, brand, model, sku, dimensions, description, category, msrp, discount_percent, sale_price, stock, image_path";

const ADMIN_COLUMNS = `${PUBLIC_COLUMNS}, cost`;

type ProductRow = {
  id: string;
  brand: string;
  model: string;
  sku: string | null;
  dimensions: string | null;
  description: string;
  category: ProductCategory;
  msrp: number | string;
  discount_percent: number | string;
  sale_price: number | string;
  stock: number;
  image_path: string | null;
  cost?: number | string;
};

export function mapProduct(row: ProductRow): CatalogProduct {
  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    sku: row.sku?.trim() || null,
    dimensions: row.dimensions?.trim() || null,
    description: row.description,
    category: row.category,
    msrp: toNumber(row.msrp),
    discountPercent: toNumber(row.discount_percent),
    salePrice: toNumber(row.sale_price),
    stock: row.stock,
    imagePath: row.image_path,
  };
}

export function mapAdminProduct(row: ProductRow): AdminProduct {
  return { ...mapProduct(row), cost: toNumber(row.cost) };
}

export async function getCatalog(filters: { q?: string; category?: string; brand?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(PUBLIC_COLUMNS)
    .gt("stock", 0)
    .order("brand")
    .order("model");

  if (filters.category === "mobiliario" || filters.category === "accesorio") {
    query = query.eq("category", filters.category);
  }
  if (filters.brand) {
    query = query.eq("brand", filters.brand);
  }
  if (filters.q) {
    const term = filters.q.replace(/[%_,]/g, "").trim();
    if (term) {
      query = query.or(`brand.ilike.%${term}%,model.ilike.%${term}%`);
    }
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data ?? []) as ProductRow[]).map(mapProduct);
}

export async function getCatalogBrands() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("brand").gt("stock", 0);
  if (error) throw new Error(error.message);
  return [...new Set((data ?? []).map((row) => row.brand as string))].sort((a, b) =>
    a.localeCompare(b, "es")
  );
}

export function selectionFromProduct(product: CatalogProduct) {
  return {
    productId: product.id,
    brand: product.brand,
    model: product.model,
    msrp: product.msrp,
    salePrice: product.salePrice,
    stock: product.stock,
    imageUrl: productImageUrl(product.imagePath),
    quantity: 1,
  };
}
