"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });

    if (signInError) {
      setPending(false);
      setError("Correo o contraseña incorrectos.");
      return;
    }

    const { data } = await supabase.auth.getUser();
    if (data.user?.app_metadata?.role !== "admin") {
      await supabase.auth.signOut();
      setPending(false);
      setError("Esta cuenta no administra el outlet.");
      return;
    }

    router.push(searchParams.get("redirect") || "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 border border-black/10 p-8">
      <p className="text-xs uppercase tracking-[0.2em] text-arquiluz-accent">Admin</p>
      <h1 className="font-serif text-4xl">Entrar</h1>
      <label className="block text-sm">
        <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">Correo</span>
        <input name="email" type="email" required className="w-full border border-black/10 px-3 py-2" />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">Contraseña</span>
        <input name="password" type="password" required className="w-full border border-black/10 px-3 py-2" />
      </label>
      {error && <p className="text-sm text-arquiluz-accent">{error}</p>}
      <button type="submit" disabled={pending} className="w-full bg-arquiluz-black px-5 py-3 text-sm font-medium text-white disabled:opacity-40">
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}

export default function SignInPage() {
  return (
    <main className="section-padding mx-auto flex max-w-7xl justify-center py-20">
      <Suspense>
        <SignInForm />
      </Suspense>
    </main>
  );
}
