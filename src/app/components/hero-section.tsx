import Image from "next/image";
import bitcoin from "@/app/img/bitcoin.png";

export function HeroSection() {
  return (
    <section className="m-4 sm:m-5 rounded-2xl   py-12 sm:py-16 md:py-20">
      <div
        className="
          mx-auto max-w-7xl
          grid items-center
          gap-4 sm:gap-8 lg:gap-12
          grid-cols-[minmax(0,1fr)_auto]   /* ← sempre duas colunas: texto + imagem */
        "
      >
        <div className="text-left min-w-0">
          <h2 className="text-2xl md:text-5xl font-semibold mb-4 leading-tight">
            Deixe a{""}
            <span className="px-3 text-primary rounded-2xl">infoCrypto</span>te
            ajudar
          </h2>
          <p className="text-base md:text-xl text-white/80">
            A infoCrypto reúne, em um só lugar, notícias de fontes confiáveis, 
            preços em tempo real e conteúdos educativos que explicam do básico ao avançado. 
            Crie sua conta, personalize seus favoritos e acompanhe um painel simples e 
            direto para entender o que realmente importa no mercado. Sem complicação, sem ruído: aprenda, 
            compare e decida melhor.
          </p>
        </div>

        <div className="flex justify-end">
          <Image
            src={bitcoin}
            alt="Bitcoin"
            width={420}
            height={420}
            priority
            className="w-[160px] sm:w-[240px] md:w-[360px] lg:w-[420px] h-auto object-contain"
            sizes="(min-width:1024px) 420px, (min-width:768px) 360px, (min-width:640px) 240px, 160px"
          />
        </div>
      </div>
    </section>
  );
}
