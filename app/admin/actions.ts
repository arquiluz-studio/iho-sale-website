"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import type { ProductCategory } from "@/lib/types";

function parseMoney(value: FormDataEntryValue | null) {
  const number = Number(String(value ?? "").replace(/,/g, ""));
  if (!Number.isFinite(number) || number < 0) return null;
  return Math.round(number * 100) / 100;
}

function discountFromPrices(msrp: number, salePrice: number) {
  if (msrp <= 0 || salePrice >= msrp) return 0;
  return Math.min(100, Math.round(((msrp - salePrice) / msrp) * 10000) / 100);
}

export async function saveProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const brand = String(formData.get("brand") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "") as ProductCategory;
  const cost = parseMoney(formData.get("cost"));
  const msrp = parseMoney(formData.get("msrp"));
  const salePrice = parseMoney(formData.get("sale_price"));
  const stock = Number(formData.get("stock"));
  const file = formData.get("image");

  if (!brand || !model) return { ok: false as const, message: "Marca y modelo son obligatorios." };
  if (category !== "mobiliario" && category !== "accesorio") {
    return { ok: false as const, message: "Elige una categoría." };
  }
  if (cost === null || msrp === null || salePrice === null) {
    return { ok: false as const, message: "Revisa costo, MSRP y precio de venta." };
  }
  if (!Number.isInteger(stock) || stock < 0) {
    return { ok: false as const, message: "El stock tiene que ser un número entero." };
  }

  const payload = {
    brand,
    model,
    description,
    category,
    cost,
    msrp,
    sale_price: salePrice,
    discount_percent: discountFromPrices(msrp, salePrice),
    stock,
  };

  const productId = id || crypto.randomUUID();
  const query = id
    ? supabase.from("products").update(payload).eq("id", id).select("id, image_path").single()
    : supabase.from("products").insert({ id: productId, ...payload }).select("id, image_path").single();

  const { data, error } = await query;
  if (error || !data) return { ok: false as const, message: error?.message ?? "No se pudo guardar." };

  if (file instanceof File && file.size > 0) {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type) || file.size > 5 * 1024 * 1024) {
      return { ok: false as const, message: "La foto debe ser JPG, PNG o WebP de hasta 5 MB." };
    }
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${data.id}/${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (uploadError) return { ok: false as const, message: uploadError.message };

    const previous = data.image_path as string | null;
    const { error: imageError } = await supabase.from("products").update({ image_path: path }).eq("id", data.id);
    if (imageError) return { ok: false as const, message: imageError.message };
    if (previous) await supabase.storage.from("product-images").remove([previous]);
  }

  revalidatePath("/");
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${data.id}`);
  return { ok: true as const, id: data.id as string };
}

export async function deleteProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const imagePath = String(formData.get("image_path") ?? "");
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false as const, message: error.message };
  if (imagePath) await supabase.storage.from("product-images").remove([imagePath]);
  revalidatePath("/");
  revalidatePath("/admin/productos");
  return { ok: true as const };
}

export async function updateInquiryStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (status !== "en_contacto" && status !== "cancelada") {
    return { ok: false as const, message: "Estado no válido." };
  }

  const { data: current, error: readError } = await supabase
    .from("inquiries")
    .select("status")
    .eq("id", id)
    .single();
  if (readError || !current) return { ok: false as const, message: "Solicitud no encontrada." };
  if (current.status === "surtida") return { ok: false as const, message: "Esta solicitud ya fue surtida." };

  const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
  if (error) return { ok: false as const, message: error.message };
  revalidatePath("/admin/solicitudes");
  revalidatePath(`/admin/solicitudes/${id}`);
  return { ok: true as const };
}

export async function fulfillInquiry(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  let items: { item_id: string; quantity: number }[] = [];
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { ok: false as const, message: "No se pudieron leer las cantidades." };
  }

  const { error } = await supabase.rpc("fulfill_inquiry", {
    p_inquiry_id: id,
    p_items: items,
  });
  if (error) return { ok: false as const, message: error.message };

  revalidatePath("/");
  revalidatePath("/admin/productos");
  revalidatePath("/admin/solicitudes");
  revalidatePath(`/admin/solicitudes/${id}`);
  return { ok: true as const };
}

export async function signOut() {
  const { supabase } = await requireAdmin();
  await supabase.auth.signOut();
  redirect("/auth/sign-in");
}
