import { requireAdmin } from "@/lib/auth";
import { toNumber } from "@/lib/format";
import type { Quote, QuoteItem, QuoteProductOption, QuoteStatus } from "@/lib/types";

type QuoteItemRow = {
  id: string;
  product_id: string | null;
  brand: string;
  model: string;
  sku: string | null;
  quantity: number;
  msrp: number | string;
  sale_price: number | string;
};

type QuoteRow = {
  id: string;
  number: number;
  inquiry_id: string | null;
  name: string;
  company: string | null;
  email: string;
  phone: string;
  note: string | null;
  shipping: number | string;
  status: QuoteStatus;
  sent_at: string | null;
  created_at: string;
  quote_items: QuoteItemRow[];
};

const QUOTE_SELECT =
  "id, number, inquiry_id, name, company, email, phone, note, shipping, status, sent_at, created_at, quote_items(id, product_id, brand, model, sku, quantity, msrp, sale_price)";

function mapQuote(row: QuoteRow): Quote {
  const items: QuoteItem[] = (row.quote_items ?? [])
    .map((item) => ({
      id: item.id,
      productId: item.product_id,
      brand: item.brand,
      model: item.model,
      sku: item.sku,
      quantity: item.quantity,
      msrp: toNumber(item.msrp),
      salePrice: toNumber(item.sale_price),
    }))
    .sort((a, b) => a.brand.localeCompare(b.brand, "es") || a.model.localeCompare(b.model, "es"));

  return {
    id: row.id,
    number: row.number,
    inquiryId: row.inquiry_id,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    note: row.note,
    shipping: toNumber(row.shipping),
    status: row.status,
    sentAt: row.sent_at,
    createdAt: row.created_at,
    items,
  };
}

export async function getQuotes() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("quotes").select(QUOTE_SELECT).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as QuoteRow[]).map(mapQuote);
}

export async function getQuote(id: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("quotes").select(QUOTE_SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapQuote(data as QuoteRow) : null;
}

export async function getQuoteIdForInquiry(inquiryId: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("quotes").select("id").eq("inquiry_id", inquiryId).maybeSingle();
  if (error) throw new Error(error.message);
  return data?.id ?? null;
}

export async function getQuoteProducts() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("id, brand, model, sku, msrp, sale_price, stock")
    .order("brand")
    .order("model");
  if (error) throw new Error(error.message);
  return (data ?? []).map(
    (product): QuoteProductOption => ({
      id: product.id,
      brand: product.brand,
      model: product.model,
      sku: product.sku,
      msrp: toNumber(product.msrp),
      salePrice: toNumber(product.sale_price),
      stock: product.stock,
    })
  );
}
