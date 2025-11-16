import Image from "next/image";
import bitcoin from "@/app/img/bitcoin.png";

export function HeroSection() {
  return (
    <section className="m-4 sm:m-5 rounded-2xl py-12 sm:py-16 md:py-20">
      <div
        className="
          mx-auto max-w-7xl
          grid items-center gap-6 sm:gap-8 lg:gap-12
          grid-cols-1
          lg:grid-cols-[minmax(0,1fr)_auto]  /* duas colunas no lg+ */
        "
      >
        {/* Imagem primeiro no mobile, segundo no desktop */}
        <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
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

        {/* Texto segundo no mobile, primeiro no desktop */}
        <div className="order-2 lg:order-1 text-left min-w-0">
          <h2 className="text-2xl md:text-5xl font-semibold mb-4 leading-tight">
            Deixe a{" "}
            <span className="px-3 text-primary rounded-2xl">infoCrypto</span> te
            ajudar
          </h2>
          <p className="text-base md:text-xl text-white/80">
            Aqui, você encontra notícias confiáveis, preços em tempo real e conteúdos educativos, tudo em um só lugar. <br></br>
            Crie sua conta, personalize seus favoritos e acompanhe um painel simples e direto pra entender o que realmente importa no mercado cripto. <br></br>
            Sem complicação, sem ruído: aprenda, compare e tome as melhores decisões!💡
          </p>
        </div>
      </div>
    </section>
  );
}
