import Link from "next/link";

export const metadata = {
  title: "Stablecoins • Educacional",
  description:
    "Conceitos essenciais sobre criptomoedas: como funcionam, histórico e tipos de ativos.",
};

const videoId = "U3kV-88u-ak"; //O que vem depois do v= na URL do vídeo

export default function Page() {
  return (
    <main className="py-10 md:py-14">
      {/* Fundo específico desta página */}
      <div className="fixed inset-0 -z-10 bg-[#151515]" aria-hidden />

      <article className="mx-auto max-w-5xl">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
          Stablecoins
        </h1>

        {/* ---- TEXTO EM 3 PARÁGRAFOS ---- */}
        <div className="mt-6 space-y-6 text-base md:text-lg leading-relaxed text-neutral-300">
          <p>
            Stablecoins são tokens projetados para manter paridade (o peg) com um ativo de referência — tipicamente 1:1 com uma moeda fiduciária como o dólar — oferecendo a utilidade on-chain de um criptoativo com baixa volatilidade. A estabilidade é buscada por mecanismos econômicos e operacionais: direito de resgate (trocar o token por $1 no emissor), colateral que lastreia a emissão e regras do protocolo que ajustam oferta/demanda. Na prática, uma stablecoin circula em redes programáveis (Ethereum, Tron, Solana, etc.) como um token padrão (ERC-20/SPL/TRC-20), facilita preços, liquidação e uso em contratos inteligentes, e serve de “moeda operacional” em DeFi — sem que os fundos residam numa conta bancária tradicional do usuário. A promessa central é simples: mobilidade e composabilidade de cripto, previsibilidade de valor da moeda de referência.
          </p>

          <p>
            O percurso começou com emissões custodiais (meados de 2010s), nas quais uma entidade retém reservas em caixa e títulos de curto prazo e emite tokens resgatáveis — modelo que ganhou tração por interoperar com bolsas e fintechs. Em 2017, surgiu a linha cripto-colateralizada (ex.: DAI), que usa sobrecolateralização em ativos on-chain e liquidações automáticas para manter o peg, sem depender de bancos para custodiar reservas. De 2020 em diante, stablecoins tornaram-se infraestrutura básica de negociação, remittances e DeFi, ao mesmo tempo em que colapsos de modelos algorítmicos evidenciaram riscos de desenho (retroalimentação entre confiança e paridade). Em paralelo, reguladores mundo afora avançaram em regras específicas, cobrando governança, segregação de reservas e transparência — um sinal de maturação do segmento, ainda que com variações por jurisdição.
          </p>

          <p>
            Conceitualmente, há quatro famílias principais. (1) Fiat-colateralizadas (custodiais): um emissor guarda reservas (dinheiro, treasuries de curtíssimo prazo) e oferece emissão/resgate a participantes autorizados; a estabilidade vem do arbitragem de resgate — se o preço cai para $0,99 no mercado, comprar e resgatar por $1 rende $0,01, puxando o preço de volta. Vantagens: simplicidade, baixa fricção; riscos: contraparte (emissor/banco), opacidade de reservas, congelamento de endereços conforme políticas de compliance. (2) Cripto-colateralizadas (não-custodiais): usuários bloqueiam cripto como garantia (menor que 100%) para cunhar a stablecoin; se o colateral cai, liquidações automáticas vendem garantia para cobrir o débito; há taxas de estabilidade e oráculos de preço — riscos: depeg em choques extremos, dependência de oráculos e liquidez de leilões. (3) Algorítmicas/seigniorage: tentam manter o peg sem colateral suficiente, modulando oferta por incentivos de mercado; historicamente instáveis — espirais da morte podem ocorrer quando a confiança quebra. (4) Ativo-lastreadas não-fiat: pareadas a ouro ou cestas de ativos; herdam os prós/contras do ativo subjacente e da cadeia de custódia. Em qualquer categoria, vale notar diferenças de permissões (quem pode resgatar), transparência (atestações vs. auditorias) e portabilidade entre redes (emissões nativas x bridges com risco adicional).
          </p>

          <p>
            Na prática, stablecoins viabilizam o denominador em dólar para preços, salários em cripto, hedge tático de volatilidade, on/off-ramps e liquidação 24/7 entre carteiras, bolsas e protocolos. Em contrapartida, os riscos não desaparecem — apenas mudam de lugar: (I) Risco de emissor/reserva (exposição bancária, duração dos títulos, governança), (II) Risco de mercado/protocolo (oráculos, liquidez, falhas de smart contracts), (III) Risco regulatório e de censura (listas de sanção, congelamento de tokens), (IV) Risco operacional (endereços errados, phishing, perda de chaves). Boas práticas: confirmar endereço do contrato e rede antes de transacionar; entender quem pode resgatar e como são as reservas; preferir carteiras seguras (hardware ou smart wallets com políticas); evitar bridges desnecessárias; e, se relevante, diversificar emissores/redes para reduzir pontos únicos de falha. Usadas com consciência de seus mecanismos e limites, stablecoins funcionam como a camada de liquidez do ecossistema cripto — conectando o mundo on-chain à economia tradicional com previsibilidade de valor. (Conteúdo educacional; não é recomendação financeira.)
          </p>
        </div>

        {/* ---- VÍDEO (menor) NO FINAL ---- */}
        <h2 className="mt-12 text-xl md:text-2xl font-semibold">
          Assista um vídeo para mais informações
        </h2>

        <div className="mt-4 flex justify-center">
          <div className="w-full max-w-3xl rounded-2xl overflow-hidden border border-[#2A2A2A] bg-[#1B1B1B]">
            <div className="relative aspect-video">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                title="O que são criptomoedas (vídeo)"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* ---- BOTÃO VOLTAR ---- */}
        <div className="mt-8">
          <Link
            href="/educational"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                       border border-[#2A2A2A] bg-[#1B1B1B]
                       hover:bg-[#242424] hover:border-[#3A3A3A]
                       transition-colors"
          >
            ← Voltar para Educacional
          </Link>
        </div>
      </article>
    </main>
  );
}
