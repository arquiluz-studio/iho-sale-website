import { requireAdmin } from "@/lib/auth";
import { formatQuoteNumber } from "@/lib/format";
import { buildQuotePdf } from "@/lib/quote-pdf";
import { getQuote } from "@/lib/quotes";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await context.params;
  const quote = await getQuote(id);
  if (!quote) return new Response("No encontramos la cotización.", { status: 404 });

  const pdf = await buildQuotePdf(quote);
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${formatQuoteNumber(quote.number)}.pdf"`,
    },
  });
}
