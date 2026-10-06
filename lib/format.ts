import type { InquiryStatus } from "@/lib/types";

export function withItbms(subtotal: number) {
  const cents = Math.round(subtotal * 100);
  const taxCents = Math.round((cents * 7) / 100);
  return {
    subtotal: cents / 100,
    itbms: taxCents / 100,
    total: (cents + taxCents) / 100,
  };
}

export function formatUSD(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function discountFromPrices(msrp: number, salePrice: number) {
  if (!(msrp > salePrice) || msrp <= 0) return 0;
  return Math.round(((msrp - salePrice) / msrp) * 10000) / 100;
}

export function formatPercent(value: number) {
  const rounded = Math.round(value * 100) / 100;
  if (Number.isInteger(rounded)) return `${rounded}%`;
  return `${rounded.toFixed(2).replace(/0$/, "")}%`;
}

export function properCase(value: string) {
  return value
    .toLocaleLowerCase("es")
    .replace(/(^|\s|-)(\p{L})/gu, (_, separator: string, letter: string) => separator + letter.toLocaleUpperCase("es"));
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
