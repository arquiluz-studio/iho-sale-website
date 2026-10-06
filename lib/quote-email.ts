import { formatQuoteNumber, formatUSD, quoteTotals } from "@/lib/format";
import type { Quote } from "@/lib/types";

const IHO_FROM = "IHO Outlet <info@iho.com.pa>";

export async function sendQuotePdf(quote: Quote, pdf: Uint8Array, copyTo: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INQUIRY_FROM_EMAIL || IHO_FROM;
  if (!apiKey) {
    return { ok: false as const, message: "Falta configurar el envío de correo." };
  }

  const number = formatQuoteNumber(quote.number);
  const totals = quoteTotals(quote.items, quote.shipping);
  const filename = `${number}.pdf`;
  const content = Buffer.from(pdf).toString("base64");
  const summary = `<p>Adjuntamos la cotización ${escapeHtml(number)}.</p>
    <p>Precio de lista: ${escapeHtml(formatUSD(totals.listTotal))}<br>
    Descuento: -${escapeHtml(formatUSD(totals.discount))}<br>
    Subtotal: ${escapeHtml(formatUSD(totals.subtotal))}<br>
    Envío: ${escapeHtml(formatUSD(totals.shipping))}<br>
    ITBMS 7%: ${escapeHtml(formatUSD(totals.itbms))}<br>
    <strong>A pagar: ${escapeHtml(formatUSD(totals.total))}</strong></p>`;

  const client = await sendEmail(apiKey, {
    from,
    to: quote.email,
    replyTo: copyTo,
    subject: `${number} — IHO Outlet`,
    html: `<p>Hola ${escapeHtml(quote.name)},</p>${summary}<p>El detalle va en el PDF adjunto.</p>`,
    filename,
    content,
  });
  if (!client.ok) return client;

  if (copyTo.toLowerCase() === quote.email.toLowerCase()) return { ok: true as const };

  const copy = await sendEmail(apiKey, {
    from,
    to: copyTo,
    replyTo: quote.email,
    subject: `${number} enviada a ${quote.name}`,
    html: `<p>Se envió ${escapeHtml(number)} a ${escapeHtml(quote.name)} (${escapeHtml(quote.email)}).</p>${summary}`,
    filename,
    content,
  });
  if (!copy.ok) {
    return { ok: true as const, message: "La cotización salió al cliente. La copia a IHO no se pudo enviar." };
  }
  return { ok: true as const };
}

async function sendEmail(
  apiKey: string,
  message: { from: string; to: string; replyTo: string; subject: string; html: string; filename: string; content: string }
) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: message.from,
      to: [message.to],
      reply_to: message.replyTo,
      subject: message.subject,
      html: message.html,
      attachments: [{ filename: message.filename, content: message.content }],
    }),
  });
  if (response.ok) return { ok: true as const };
  const body = (await response.json().catch(() => null)) as { message?: string } | null;
  return { ok: false as const, message: body?.message || "No se pudo enviar el correo." };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
