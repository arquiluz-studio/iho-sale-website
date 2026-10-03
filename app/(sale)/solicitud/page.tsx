import Link from "next/link";
import { RequestForm } from "@/components/RequestForm";

export default function SolicitudPage() {
  return (
    <main className="section-padding mx-auto max-w-7xl py-12 md:py-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-4xl md:text-5xl">Tu lista</h1>
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-2 border border-arquiluz-accent px-4 py-2 text-sm font-medium text-arquiluz-accent hover:bg-arquiluz-accent hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0 6-6M5 12l6 6" />
          </svg>
          Regresar
        </Link>
      </div>
      <div className="mt-10">
        <RequestForm />
      </div>
    </main>
  );
}
