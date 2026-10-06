import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage } from "pdf-lib";
import sharp from "sharp";
import { discountFromPrices, formatPercent, formatQuoteNumber, formatUSD, quoteTotals } from "@/lib/format";
import type { Quote } from "@/lib/types";

const red = rgb(239 / 255, 72 / 255, 61 / 255);
const black = rgb(0.1, 0.1, 0.1);
const gray = rgb(0.4, 0.4, 0.4);
const line = rgb(0.85, 0.85, 0.85);

export async function buildQuotePdf(quote: Quote) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pageWidth = 595;
  const pageHeight = 842;
  const left = 48;
  const right = pageWidth - 48;
  const totals = quoteTotals(quote.items, quote.shipping);
  const date = new Intl.DateTimeFormat("es-PA", {
    dateStyle: "long",
    timeZone: "America/Panama",
  }).format(new Date(quote.createdAt));

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - 56;

  function text(value: string, x: number, size: number, font: PDFFont, color = black) {
    page.drawText(value, { x, y, size, font, color });
  }

  function textRight(value: string, xRight: number, size: number, font: PDFFont, color = black) {
    const width = font.widthOfTextAtSize(value, size);
    page.drawText(value, { x: xRight - width, y, size, font, color });
  }

  function tableHeader() {
    text("Pieza", left, 9, bold, gray);
    text("SKU", 300, 9, bold, gray);
    textRight("Cant.", 430, 9, bold, gray);
    textRight("Precio", 490, 9, bold, gray);
    textRight("Importe", right, 9, bold, gray);
    y -= 8;
    page.drawLine({ start: { x: left, y }, end: { x: right, y }, thickness: 0.5, color: line });
    y -= 16;
  }

  function nextPage() {
    page = pdf.addPage([pageWidth, pageHeight]);
    y = pageHeight - 56;
    tableHeader();
  }

  text("IHO", left, 22, bold, red);
  const brandWidth = bold.widthOfTextAtSize("IHO", 22);
  page.drawText("Outlet", { x: left + brandWidth + 8, y: y + 2, size: 14, font: regular, color: black });
  textRight(formatQuoteNumber(quote.number), right, 14, bold);
  y -= 16;
  textRight("Cotización", right, 9, regular, gray);
  y -= 14;
  textRight(date, right, 9, regular, gray);
  y -= 28;

  text("Cliente", left, 9, bold, gray);
  y -= 16;
  text(quote.name, left, 12, bold);
  y -= 14;
  const contact = [quote.company, quote.email, quote.phone].filter(Boolean).join("  ·  ");
  if (contact) {
    text(clip(contact, 90), left, 10, regular, gray);
    y -= 14;
  }
  if (quote.note) {
    text(clip(quote.note, 90), left, 10, regular);
    y -= 14;
  }
  y -= 16;
  tableHeader();

  const photos = new Map<string, PDFImage>();
  await Promise.all(
    quote.items.map(async (item) => {
      if (!item.imageUrl || photos.has(item.imageUrl)) return;
      const image = await loadPdfImage(pdf, item.imageUrl);
      if (image) photos.set(item.imageUrl, image);
    })
  );

  for (const item of quote.items) {
    if (y < 170) nextPage();
    const box = 36;
    const imageBottom = y - 22;
    page.drawRectangle({ x: left, y: imageBottom, width: box, height: box, color: rgb(0.96, 0.96, 0.96) });
    const photo = item.imageUrl ? photos.get(item.imageUrl) : undefined;
    if (photo) {
      const scale = Math.min(box / photo.width, box / photo.height);
      const width = photo.width * scale;
      const height = photo.height * scale;
      page.drawImage(photo, {
        x: left + (box - width) / 2,
        y: imageBottom + (box - height) / 2,
        width,
        height,
      });
    }
    y = imageBottom + 20;
    text(fit(`${item.brand}  ${item.model}`, regular, 10, 200), left + box + 8, 10, regular);
    text(clip(item.sku ?? "", 16), 300, 9, regular, gray);
    textRight(String(item.quantity), 430, 10, regular);
    textRight(formatUSD(item.salePrice), 490, 10, regular);
    textRight(formatUSD(item.salePrice * item.quantity), right, 10, regular);
    const saved = discountFromPrices(item.msrp, item.salePrice);
    if (saved > 0) {
      y -= 12;
      const listLabel = `Lista ${formatUSD(item.msrp)}`;
      text(listLabel, left + box + 8, 8, regular, gray);
      const listWidth = regular.widthOfTextAtSize(listLabel, 8);
      page.drawLine({
        start: { x: left + box + 8, y: y + 2 },
        end: { x: left + box + 8 + listWidth, y: y + 2 },
        thickness: 0.4,
        color: gray,
      });
      text(`  -${formatPercent(saved)}`, left + box + 8 + listWidth, 8, regular, red);
    }
    y = imageBottom - 10;
  }

  if (y < 220) nextPage();
  y -= 6;
  page.drawLine({ start: { x: 300, y: y + 12 }, end: { x: right, y: y + 12 }, thickness: 0.5, color: line });
  const rows: [string, string, "discount" | "total" | "plain"][] = [
    ["Precio de lista", formatUSD(totals.listTotal), "plain"],
    ["Descuento", `-${formatUSD(totals.discount)}`, "discount"],
    ["Subtotal", formatUSD(totals.subtotal), "plain"],
    ["Envío", formatUSD(totals.shipping), "plain"],
    ["ITBMS 7%", formatUSD(totals.itbms), "plain"],
    ["A pagar", formatUSD(totals.total), "total"],
  ];
  for (const [label, value, kind] of rows) {
    const strong = kind === "total";
    const color = kind === "discount" ? red : strong ? black : gray;
    text(label, 320, strong ? 12 : 10, strong ? bold : regular, kind === "discount" ? red : strong ? black : gray);
    textRight(value, right, strong ? 12 : 10, strong ? bold : regular, color);
    y -= strong ? 20 : 16;
  }

  y -= 8;
  text("El ITBMS del 7% aplica sobre las piezas y el envío.", left, 9, regular, gray);
  y -= 12;
  if (quote.shipping === 0) {
    text("No incluye costos de entrega. El precio es para retirar en tienda.", left, 9, regular, gray);
    y -= 12;
  }
  y -= 16;
  text("IHO Outlet  ·  info@iho.com.pa", left, 9, regular, gray);

  return pdf.save();
}

async function loadPdfImage(pdf: PDFDocument, url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const bytes = new Uint8Array(await response.arrayBuffer());
    const kind = imageKind(bytes);
    if (kind === "png") return pdf.embedPng(bytes);
    if (kind === "jpg") return pdf.embedJpg(bytes);
    if (kind === "webp") return pdf.embedPng(await sharp(bytes).png().toBuffer());
    return null;
  } catch {
    return null;
  }
}

function imageKind(bytes: Uint8Array) {
  if (bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
  if (bytes.length > 2 && bytes[0] === 0xff && bytes[1] === 0xd8) return "jpg";
  if (
    bytes.length > 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp";
  }
  return null;
}

function fit(value: string, font: PDFFont, size: number, maxWidth: number) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (font.widthOfTextAtSize(clean, size) <= maxWidth) return clean;
  let end = clean.length;
  while (end > 0 && font.widthOfTextAtSize(`${clean.slice(0, end)}...`, size) > maxWidth) end -= 1;
  return `${clean.slice(0, end)}...`;
}

function clip(value: string, max: number) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}...`;
}
