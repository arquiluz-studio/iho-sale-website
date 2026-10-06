import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { formatQuoteNumber, formatUSD, quoteTotals } from "@/lib/format";
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

  for (const item of quote.items) {
    if (y < 140) nextPage();
    text(clip(`${item.brand}  ${item.model}`, 42), left, 10, regular);
    text(clip(item.sku ?? "", 16), 300, 9, regular, gray);
    textRight(String(item.quantity), 430, 10, regular);
    textRight(formatUSD(item.salePrice), 490, 10, regular);
    textRight(formatUSD(item.salePrice * item.quantity), right, 10, regular);
    y -= 18;
  }

  if (y < 170) nextPage();
  y -= 6;
  page.drawLine({ start: { x: 340, y: y + 12 }, end: { x: right, y: y + 12 }, thickness: 0.5, color: line });
  const rows: [string, string, boolean][] = [
    ["Subtotal", formatUSD(totals.subtotal), false],
    ["Envío", formatUSD(totals.shipping), false],
    ["ITBMS 7%", formatUSD(totals.itbms), false],
    ["Total", formatUSD(totals.total), true],
  ];
  for (const [label, value, strong] of rows) {
    text(label, 360, strong ? 12 : 10, strong ? bold : regular, strong ? black : gray);
    textRight(value, right, strong ? 12 : 10, strong ? bold : regular);
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

function clip(value: string, max: number) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}...`;
}
