import { requireAdmin } from "@/lib/auth";
import { productImageUrl, toNumber } from "@/lib/format";
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
      imageUrl: null,
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
  if (!data) return null;
  return attachImages(supabase, mapQuote(data as QuoteRow));
}

export async function getQuoteIdForInquiry(inquiryId: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("quotes").select("id").eq("inquiry_id", inquiryId).maybeSingle();
  if (error) throw new Error(error.message);
  return data?.id ?? null;
}

async function attachImages(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], quote: Quote) {
  const ids = quote.items.map((item) => item.productId).filter((id): id is string => Boolean(id));
  if (ids.length === 0) return quote;
  const { data, error } = await supabase.from("products").select("id, image_path").in("id", ids);
  if (error) throw new Error(error.message);
  const urls = new Map((data ?? []).map((product) => [product.id, productImageUrl(product.image_path)]));
  return {
    ...quote,
    items: quote.items.map((item) => ({
      ...item,
      imageUrl: item.productId ? (urls.get(item.productId) ?? null) : null,
    })),
  };
}

export async function getQuoteProducts() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("id, brand, model, sku, msrp, sale_price, stock, image_path")
    .not("sale_price", "is", null)
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
      imageUrl: productImageUrl(product.image_path),
    })
  );
}
