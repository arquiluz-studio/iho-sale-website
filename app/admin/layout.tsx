import Link from "next/link";
import { signOut } from "@/app/admin/actions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-arquiluz-gray">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="flex items-center gap-4">
            <img src="/logos/logoIHO_rojo.svg" alt="IHO" width={84} height={34} className="h-[34px] w-auto" />
            <span className="font-serif text-2xl tracking-wide">Outlet Admin</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/admin/productos" className="hover:text-arquiluz-accent">
              Productos
            </Link>
            <Link href="/admin/categorias" className="hover:text-arquiluz-accent">
              Categorías
            </Link>
            <Link href="/admin/solicitudes" className="hover:text-arquiluz-accent">
              Solicitudes
            </Link>
            <Link href="/admin/cotizaciones" className="hover:text-arquiluz-accent">
              Cotizaciones
            </Link>
            <Link href="/" className="hover:text-arquiluz-accent">
              Ver outlet
            </Link>
            <form action={signOut}>
              <button type="submit" className="text-gray-500 hover:text-arquiluz-black">
                Salir
              </button>
            </form>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
    </div>
  );
}
