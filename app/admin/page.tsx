import Link from "next/link";
import { getAdminSummary } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const summary = await getAdminSummary();

  return (
    <main>
      <h1 className="font-serif text-4xl">Administración</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link href="/admin/productos" className="bg-white p-6">
          <p className="text-xs uppercase tracking-wider text-gray-500">Piezas</p>
          <p className="mt-2 font-serif text-4xl">{summary.products}</p>
        </Link>
        <Link href="/admin/productos" className="bg-white p-6">
          <p className="text-xs uppercase tracking-wider text-gray-500">Sin stock</p>
          <p className="mt-2 font-serif text-4xl">{summary.outOfStock}</p>
        </Link>
        <Link href="/admin/solicitudes" className="bg-white p-6">
          <p className="text-xs uppercase tracking-wider text-gray-500">Solicitudes abiertas</p>
          <p className="mt-2 font-serif text-4xl">{summary.openInquiries}</p>
        </Link>
      </div>
    </main>
  );
}
