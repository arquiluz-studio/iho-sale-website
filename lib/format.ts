import type { InquiryStatus, ProductCategory } from "@/lib/types";

export function formatMXN(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function categoryLabel(category: ProductCategory) {
  return category === "mobiliario" ? "Mobiliario" : "Accesorio";
}

export function statusLabel(status: InquiryStatus) {
  switch (status) {
    case "nueva":
      return "Nueva";
    case "en_contacto":
      return "En contacto";
    case "surtida":
      return "Surtida";
    case "cancelada":
      return "Cancelada";
  }
}

export function productImageUrl(imagePath: string | null) {
  if (!imagePath) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/product-images/${imagePath}`;
}

export function toNumber(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : 0;
}
