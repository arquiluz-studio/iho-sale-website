import { QuoteForm } from "@/components/admin/QuoteForm";
import { getQuoteProducts } from "@/lib/quotes";

export const dynamic = "force-dynamic";

export default async function NewQuotePage() {
  const products = await getQuoteProducts();
  return (
    <main>
      <QuoteForm quote={null} products={products} />
    </main>
  );
}
