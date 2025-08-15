"use client";

import { Button } from "@/components/button";
import { useState } from "react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
        setEmail("");
      } else {
        setError("Não foi possível se inscrever. Tente novamente.");
      }
    } catch {
      setError("Erro no servidor. Tente novamente mais tarde.");
    }
  };

  return (
    <section id="newsletter" className="py-20">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">
          Fique por dentro das novidades!
        </h2>
        <p className="text-gray-700 mb-8">
          Receba conteúdos exclusivos diretamente no seu e-mail.
        </p>

        {submitted ? (
          <p className="text-primary font-semibold">
            Obrigado por se inscrever!
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <input
              type="email"
              required
              placeholder="Seu melhor e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:primary flex-1"
            />
            <Button
              type="submit"
              variant="outline"
              className="bg-primary text-white md:bg-transparent md:text-primary md:border md:border-primary"
            >
              Inscrever
            </Button>
          </form>
        )}

        {error && <p className="text-red-600 mt-4">{error}</p>}
      </div>
    </section>
  );
}
