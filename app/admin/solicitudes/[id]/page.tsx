import { notFound } from "next/navigation";
import { InquiryActions } from "@/components/admin/InquiryActions";
import { getInquiry } from "@/lib/admin";
import { statusLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function InquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inquiry = await getInquiry(id);
  if (!inquiry) notFound();

  return (
    <main>
      <p className="text-xs uppercase tracking-wider text-arquiluz-accent">{statusLabel(inquiry.status)}</p>
      <h1 className="mt-2 font-serif text-4xl">{inquiry.name}</h1>
      <p className="mt-3 text-sm text-gray-600">
        {inquiry.company ? `${inquiry.company} · ` : ""}
        <a href={`mailto:${inquiry.email}`} className="hover:text-arquiluz-accent">
          {inquiry.email}
        </a>
        {" · "}
        <a href={`tel:${inquiry.phone}`} className="hover:text-arquiluz-accent">
          {inquiry.phone}
        </a>
      </p>
      {inquiry.note && <p className="mt-4 max-w-2xl text-gray-700">{inquiry.note}</p>}
      <div className="mt-8">
        <InquiryActions inquiry={inquiry} />
      </div>
    </main>
  );
}
