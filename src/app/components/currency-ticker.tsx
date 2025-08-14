"use client";
import { useEffect, useState } from "react";

export function CurrencyTicker() {
  const [cotacao, setCotacao] = useState({ usd: "", eur: "" });
  const [lastUpdate, setLastUpdate] = useState("");

  const fetchCotacoes = async () => {
    try {
      const res = await fetch(
        "https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL"
      );
      const data = await res.json();
      setCotacao({
        usd: Number(data.USDBRL.bid).toFixed(2),
        eur: Number(data.EURBRL.bid).toFixed(2),
      });
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Erro ao buscar cotações", err);
    }
  };

  useEffect(() => {
    fetchCotacoes();
    const interval = setInterval(fetchCotacoes, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!cotacao.usd || !cotacao.eur) {
    return null; // Evita renderizar até ter os dados
  }

  return (
    <div className="bg-primary rounded-lg mx-5 text-white text-sm py-1 overflow-hidden relative">
      <div className="animate-marquee whitespace-nowrap">
        💵 Dólar: R$ {cotacao.usd} | 💶 Euro: R$ {cotacao.eur}
        {lastUpdate && ` — Última atualização ${lastUpdate}`}
      </div>
    </div>
  );
}
