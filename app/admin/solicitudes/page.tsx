import Link from "next/link";
import { getInquiries } from "@/lib/admin";
import { formatUSD, statusLabel, withItbms } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function InquiriesPage() {
  const inquiries = await getInquiries();

  return (
    <main>
      <h1 className="font-serif text-4xl">Solicitudes</h1>
      <div className="mt-8 divide-y divide-black/10 bg-white">
        {inquiries.map((inquiry) => {
          const subtotal = inquiry.items.reduce((sum, item) => sum + item.salePrice * item.quantityRequested, 0);
          const total = withItbms(subtotal).total;
          return (
            <Link key={inquiry.id} href={`/admin/solicitudes/${inquiry.id}`} className="block px-5 py-4 hover:bg-arquiluz-gray">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-medium">{inquiry.name}</p>
                <p className="text-xs uppercase tracking-wider text-arquiluz-accent">{statusLabel(inquiry.status)}</p>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {inquiry.company ? `${inquiry.company} · ` : ""}
                {inquiry.email} · {inquiry.phone}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {inquiry.items.length} {inquiry.items.length === 1 ? "pieza" : "piezas"} · {formatUSD(total)}
              </p>
            </Link>
          );
        })}
        {inquiries.length === 0 && <p className="px-5 py-8 text-sm text-gray-500">No hay solicitudes.</p>}
      </div>
    </main>
  );
}
