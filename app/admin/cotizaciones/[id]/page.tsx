import { notFound } from "next/navigation";
import { QuoteForm } from "@/components/admin/QuoteForm";
import { getQuote, getQuoteProducts } from "@/lib/quotes";

export const dynamic = "force-dynamic";

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [quote, products] = await Promise.all([getQuote(id), getQuoteProducts()]);
  if (!quote) notFound();

  return (
    <main>
      <QuoteForm quote={quote} products={products} />
    </main>
  );
}
