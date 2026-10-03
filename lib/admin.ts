import { requireAdmin } from "@/lib/auth";
import { mapAdminProduct } from "@/lib/catalog";
import { toNumber } from "@/lib/format";
import type { AdminProduct, Inquiry, InquiryItem, InquiryStatus } from "@/lib/types";

const ADMIN_COLUMNS =
  "id, brand, model, sku, description, category, cost, msrp, discount_percent, sale_price, stock, image_path";

export async function getAdminProducts() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("products").select(ADMIN_COLUMNS).order("brand").order("model");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapAdminProduct(row));
}

export async function getAdminProduct(id: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("products").select(ADMIN_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapAdminProduct(data) : null;
}

type InquiryRow = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string;
  note: string | null;
  status: InquiryStatus;
  created_at: string;
  inquiry_items: {
    id: string;
    product_id: string | null;
    brand: string;
    model: string;
    quantity_requested: number;
    quantity_fulfilled: number;
    sale_price: number | string;
  }[];
};

function mapInquiry(row: InquiryRow): Inquiry {
  const items: InquiryItem[] = (row.inquiry_items ?? []).map((item) => ({
    id: item.id,
    productId: item.product_id,
    brand: item.brand,
    model: item.model,
    quantityRequested: item.quantity_requested,
    quantityFulfilled: item.quantity_fulfilled,
    salePrice: toNumber(item.sale_price),
  }));

  return {
    id: row.id,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    note: row.note,
    status: row.status,
    createdAt: row.created_at,
    items,
  };
}

const INQUIRY_SELECT =
  "id, name, company, email, phone, note, status, created_at, inquiry_items(id, product_id, brand, model, quantity_requested, quantity_fulfilled, sale_price)";

export async function getInquiries() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("inquiries").select(INQUIRY_SELECT).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as InquiryRow[]).map(mapInquiry);
}

export async function getInquiry(id: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("inquiries").select(INQUIRY_SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapInquiry(data as InquiryRow) : null;
}

export async function getAdminSummary() {
  const products = await getAdminProducts();
  const inquiries = await getInquiries();
  return {
    products: products.length,
    outOfStock: products.filter((product) => product.stock === 0).length,
    openInquiries: inquiries.filter((inquiry) => inquiry.status === "nueva" || inquiry.status === "en_contacto").length,
  };
}

export type { AdminProduct };
