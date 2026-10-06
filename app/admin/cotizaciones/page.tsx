import Link from "next/link";
import { formatQuoteNumber, formatUSD, quoteStatusLabel, quoteTotals } from "@/lib/format";
import { getQuotes } from "@/lib/quotes";

export const dynamic = "force-dynamic";

export default async function QuotesPage() {
  const quotes = await getQuotes();

  return (
    <main>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-4xl">Cotizaciones</h1>
        <Link href="/admin/cotizaciones/nueva" className="bg-arquiluz-black px-4 py-2 text-sm text-white">
          Nueva
        </Link>
      </div>
      <div className="mt-8 divide-y divide-black/10 bg-white">
        {quotes.map((quote) => {
          const total = quoteTotals(quote.items, quote.shipping).total;
          return (
            <Link key={quote.id} href={`/admin/cotizaciones/${quote.id}`} className="block px-5 py-4 hover:bg-arquiluz-gray">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-medium">
                  {formatQuoteNumber(quote.number)} · {quote.name}
                </p>
                <p className="text-xs uppercase tracking-wider text-arquiluz-accent">{quoteStatusLabel(quote.status)}</p>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {quote.company ? `${quote.company} · ` : ""}
                {quote.email}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {quote.items.length} {quote.items.length === 1 ? "pieza" : "piezas"} · {formatUSD(total)}
              </p>
            </Link>
          );
        })}
        {quotes.length === 0 && <p className="px-5 py-8 text-sm text-gray-500">No hay cotizaciones.</p>}
      </div>
    </main>
  );
}
