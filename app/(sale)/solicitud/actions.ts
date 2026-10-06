"use server";

import { readInquiryEmail, sendInquiryEmails } from "@/lib/inquiry-email";
import { toNumber } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

type InquiryPayload = {
  product_id: string;
  quantity: number;
};

export async function submitInquiry(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const company = String(formData.get("company") ?? "");
  const email = String(formData.get("email") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const note = String(formData.get("note") ?? "");

  let items: InquiryPayload[] = [];
  try {
    const parsed = JSON.parse(String(formData.get("items") ?? "[]")) as InquiryPayload[];
    items = parsed.filter((item) => item.product_id && item.quantity > 0);
  } catch {
    return { ok: false as const, message: "La lista no se pudo leer. Vuelve a armarla." };
  }

  if (items.length === 0) {
    return { ok: false as const, message: "Agrega al menos una pieza." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_inquiry", {
    p_name: name,
    p_company: company,
    p_email: email,
    p_phone: phone,
    p_note: note,
    p_items: items,
  });

  if (error) {
    return { ok: false as const, message: error.message };
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, brand, model, sku, msrp, sale_price")
    .in(
      "id",
      items.map((item) => item.product_id)
    );
  if (productsError || !products) {
    return {
      ok: true as const,
      id: data as string,
      emailed: false,
      message: "Guardamos tu solicitud, pero no pudimos armar el correo.",
    };
  }

  const quantityById = new Map(items.map((item) => [item.product_id, item.quantity]));
  const sent = await sendInquiryEmails({
    notifyEmail: await readInquiryEmail(supabase),
    name: name.trim(),
    company: company.trim(),
    email: email.trim(),
    phone: phone.trim(),
    note: note.trim(),
    items: products.map((product) => ({
      brand: product.brand,
      model: product.model,
      sku: product.sku,
      quantity: quantityById.get(product.id) ?? 1,
      msrp: toNumber(product.msrp),
      salePrice: toNumber(product.sale_price),
    })),
  });

  if (!sent.ok) {
    return {
      ok: true as const,
      id: data as string,
      emailed: false,
      message: "Guardamos tu solicitud, pero el correo no se pudo enviar.",
    };
  }

  return { ok: true as const, id: data as string, emailed: true };
}
