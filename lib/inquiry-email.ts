import { formatUSD, withItbms } from "@/lib/format";

const IHO_EMAIL = "info@iho.com.pa";

export type InquiryEmailItem = {
  brand: string;
  model: string;
  sku: string | null;
  quantity: number;
  msrp: number;
  salePrice: number;
};

type InquiryEmailInput = {
  name: string;
  company: string;
  email: string;
  phone: string;
  note: string;
  items: InquiryEmailItem[];
};

export async function sendInquiryEmails(input: InquiryEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INQUIRY_FROM_EMAIL || `IHO Outlet <${IHO_EMAIL}>`;
  if (!apiKey) {
    return { ok: false as const, message: "Falta configurar el envío de correo." };
  }

  const listTotal = input.items.reduce((sum, item) => {
    const listPrice = item.msrp > item.salePrice ? item.msrp : item.salePrice;
    return sum + listPrice * item.quantity;
  }, 0);
  const subtotal = input.items.reduce((sum, item) => sum + item.salePrice * item.quantity, 0);
  const discountTotal = listTotal - subtotal;
  const totalsAmount = withItbms(subtotal);
  const rows = input.items
    .map((item) => {
      const sku = item.sku ? ` · ${escapeHtml(item.sku)}` : "";
      return `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">${escapeHtml(item.brand)}<br><strong>${escapeHtml(item.model)}</strong>${sku}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${escapeHtml(formatUSD(item.salePrice * item.quantity))}</td>
      </tr>`;
    })
    .join("");
  const contact = [
    `Nombre: ${escapeHtml(input.name)}`,
    input.company ? `Empresa: ${escapeHtml(input.company)}` : "",
    `Correo: ${escapeHtml(input.email)}`,
    `Teléfono: ${escapeHtml(input.phone)}`,
    input.note ? `Nota: ${escapeHtml(input.note)}` : "",
  ]
    .filter(Boolean)
    .join("<br>");
  const totals = `<p>Precio de lista: ${escapeHtml(formatUSD(listTotal))}<br>
    Descuento: -${escapeHtml(formatUSD(discountTotal))}<br>
    Subtotal: ${escapeHtml(formatUSD(totalsAmount.subtotal))}<br>
    ITBMS 7%: ${escapeHtml(formatUSD(totalsAmount.itbms))}<br>
    <strong>A pagar: ${escapeHtml(formatUSD(totalsAmount.total))}</strong></p>
    <p style="color:#666;">No incluye costos de entrega. El precio es para retirar en tienda. No hay pago en esta página.</p>`;
  const table = `<table style="width:100%;border-collapse:collapse;font-family:sans-serif;font-size:14px;">${rows}</table>`;

  const iho = await sendEmail(apiKey, {
    from,
    to: IHO_EMAIL,
    replyTo: input.email,
    subject: `Nueva solicitud de Outlet — ${input.name}`,
    html: `<p>Llegó una solicitud del outlet.</p><p>${contact}</p>${table}${totals}`,
  });
  if (!iho.ok) return iho;

  const client = await sendEmail(apiKey, {
    from,
    to: input.email,
    replyTo: IHO_EMAIL,
    subject: "Recibimos tu solicitud — IHO Outlet",
    html: `<p>Hola ${escapeHtml(input.name)},</p>
      <p>Recibimos tu lista. Alguien de IHO te contacta para confirmar disponibilidad. El precio es para retirar en tienda y no incluye costos de entrega.</p>
      ${table}${totals}
      <p>Si necesitas algo más, escribe a <a href="mailto:${IHO_EMAIL}">${IHO_EMAIL}</a>.</p>`,
  });
  return client;
}

async function sendEmail(
  apiKey: string,
  message: { from: string; to: string; replyTo: string; subject: string; html: string }
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
