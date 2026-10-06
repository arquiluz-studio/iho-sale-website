"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveCategoryImage } from "@/app/admin/actions";

export function CategoryImageForm({
  id,
  name,
  imageUrl,
}: {
  id: string;
  name: string;
  imageUrl: string | null;
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const shown = preview ?? imageUrl;

  async function submit(remove: boolean) {
    const data = new FormData();
    data.set("id", id);
    data.set("remove_image", remove ? "1" : "0");
    const file = fileInput.current?.files?.[0];
    if (file && !remove) data.set("image", file);
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const result = await saveCategoryImage(data);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      if (fileInput.current) fileInput.current.value = "";
      setSaved(true);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="bg-white p-4">
      <div className="aspect-[4/3] overflow-hidden bg-arquiluz-gray">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-end p-4">
            <span className="font-serif text-2xl text-black/25">{name}</span>
          </div>
        )}
      </div>
      <h2 className="mt-4 font-serif text-2xl">{name}</h2>
      <label className="mt-4 block text-sm">
        <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">{imageUrl ? "Reemplazar foto" : "Foto"}</span>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (preview) URL.revokeObjectURL(preview);
            setPreview(file ? URL.createObjectURL(file) : null);
            setSaved(false);
          }}
          className="w-full text-sm"
        />
      </label>
      {error && <p className="mt-3 text-sm text-arquiluz-accent">{error}</p>}
      {saved && <p className="mt-3 text-sm">Guardado.</p>}
      <button
        type="button"
        disabled={pending}
        onClick={() => void submit(false)}
        className="mt-4 w-full bg-arquiluz-black px-4 py-2 text-sm text-white disabled:opacity-40"
      >
        {pending ? "Guardando…" : "Guardar"}
      </button>
      {imageUrl && !preview && (
        <button
          type="button"
          disabled={pending}
          onClick={() => void submit(true)}
          className="mt-2 w-full border border-black/20 px-4 py-2 text-sm text-gray-600 hover:border-arquiluz-accent hover:text-arquiluz-accent disabled:opacity-40"
        >
          Quitar foto
        </button>
      )}
    </div>
  );
}
