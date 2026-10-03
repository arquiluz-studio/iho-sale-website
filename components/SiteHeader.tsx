"use client";

import Link from "next/link";
import { useSelection } from "@/components/SelectionProvider";

export function SiteHeader() {
  const { count } = useSelection();

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-black/10 bg-white">
      <div className="section-padding mx-auto flex h-full max-w-7xl items-center justify-between gap-3">
        <Link href="/" className="flex min-w-0 items-center gap-3 md:gap-4">
          <img src="/logos/logoIHO_rojo.svg" alt="IHO" width={84} height={34} className="h-7 w-auto md:h-[34px]" />
          <span className="font-serif text-xl tracking-wide md:text-2xl">Outlet</span>
        </Link>
        <Link href="/solicitud" className="shrink-0 whitespace-nowrap text-sm font-medium tracking-wide hover:text-arquiluz-accent">
          Mi lista{count > 0 ? ` (${count})` : ""}
        </Link>
      </div>
    </header>
  );
}
