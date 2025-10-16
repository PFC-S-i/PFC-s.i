// app/carteira/page.tsx
"use client";

import Simulador from "./simulador";

export default function CarteiraPage() {
  return (
    <main className="min-h-dvh bg-[#151515] text-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-semibold">Simulador de Segurança BIP39</h1>
        <Simulador />
      </div>
    </main>
  );
}