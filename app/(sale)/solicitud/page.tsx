import { RequestForm } from "@/components/RequestForm";

export default function SolicitudPage() {
  return (
    <main className="section-padding mx-auto max-w-7xl py-12 md:py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-arquiluz-accent">Solicitud</p>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl">Tu lista</h1>
      <div className="mt-10">
        <RequestForm />
      </div>
    </main>
  );
}
