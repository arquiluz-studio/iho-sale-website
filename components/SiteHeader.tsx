"use client";

import Link from "next/link";
import { useSelection } from "@/components/SelectionProvider";

export function SiteHeader() {
  const { count } = useSelection();

  return (
    <header className="border-b border-black/10 bg-white">
      <div className="section-padding mx-auto flex max-w-7xl items-center justify-between py-5">
        <Link href="/" className="flex items-center gap-4">
          <img src="/logos/logoIHO_rojo.svg" alt="IHO" width={84} height={34} className="h-[34px] w-auto" />
          <span className="font-serif text-2xl tracking-wide">Outlet</span>
        </Link>
        <Link href="/solicitud" className="text-sm font-medium tracking-wide hover:text-arquiluz-accent">
          Mi lista{count > 0 ? ` (${count})` : ""}
        </Link>
      </div>
    </header>
  );
}
