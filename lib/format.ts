import type { InquiryStatus, QuoteStatus } from "@/lib/types";

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

export function quoteTotals(items: { msrp: number; salePrice: number; quantity: number }[], shipping: number) {
  const listTotal = items.reduce((sum, item) => {
    const listPrice = item.msrp > item.salePrice ? item.msrp : item.salePrice;
    return sum + listPrice * item.quantity;
  }, 0);
  const subtotal = items.reduce((sum, item) => sum + item.salePrice * item.quantity, 0);
  const taxed = withItbms(subtotal + shipping);
  return { listTotal, discount: listTotal - subtotal, subtotal, shipping, itbms: taxed.itbms, total: taxed.total };
}

export function formatQuoteNumber(number: number) {
  return `COT-${String(number).padStart(4, "0")}`;
}

export function quoteStatusLabel(status: QuoteStatus) {
  switch (status) {
    case "borrador":
      return "Borrador";
    case "enviada":
      return "Enviada";
    case "confirmada":
      return "Confirmada";
    case "despachada":
      return "Despachada";
  }
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
