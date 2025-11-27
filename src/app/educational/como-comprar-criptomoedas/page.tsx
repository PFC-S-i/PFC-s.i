import Link from "next/link";

export const metadata = {
  title: "Como comprar Criptomoedas • Educacional",
  description:
    "Conceitos essenciais sobre criptomoedas: como funcionam, histórico e tipos de ativos.",
};

const videoId = "u63wNbEavsc";

export default function Page() {
  return (
    <main className="py-10 md:py-14">
      <div className="fixed inset-0 -z-10 bg-[#151515]" aria-hidden />

      <article className="mx-auto max-w-5xl">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-center">
          Como comprar Criptomoedas
        </h1>

        <div className="mt-6 flex justify-center">
          <div className="w-full max-w-3xl rounded-2xl overflow-hidden border border-[#2A2A2A] bg-[#1B1B1B]">
            <div className="relative aspect-video">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                title="Como comprar criptomoedas (vídeo)"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6 text-base md:text-lg leading-relaxed text-neutral-300 text-justify">
          <p>
            Comprar criptomoedas é, essencialmente, adquirir unidades de um
            ativo digital registrado em uma rede pública e transferi-las para
            uma conta controlada por você — seja numa corretora (CEX, exchange
            centralizada) com custódia do terceiro, seja numa carteira própria
            (não-custodial) cuja chave privada é sua. O caminho mais comum
            envolve: (1) abrir conta numa exchange idônea, concluir KYC
            (verificação de identidade) e habilitar métodos de depósito —
            transferência bancária, cartão, Pix, etc.; (2) depositar moeda
            fiduciária e realizar a compra via ordem de mercado (executa ao
            preço disponível) ou ordem limite (executa ao preço que você
            definir); (3) decidir a custódia: manter na exchange (conveniente,
            porém risco de contraparte) ou sacar para sua carteira, conferindo
            rede e endereço corretos (ex.: Bitcoin na rede Bitcoin; tokens
            ERC-20 na rede Ethereum; cuidado com homônimos e pontes/bridges). Em
            compras via DEX (corretoras descentralizadas), a lógica se inverte:
            você já precisa de uma carteira com saldo para pagar o gas,
            conecta-a ao DEX e faz o swap — aqui, o preço é mediado por pools de
            liquidez e há slippage (variação entre preço cotado e executado).
          </p>

          <p>
            Historicamente, o acesso evoluiu de fóruns e operações P2P no início
            do Bitcoin para exchanges globais com pareamentos fiat-cripto,
            fintechs que oferecem compra direta no app e, mais recentemente,
            DEXs/AMMs que funcionam sem intermediários — além de produtos de
            mercado tradicional em algumas jurisdições (ETFs/ETNs com exposição
            a cripto, úteis para quem prefere não lidar com chaves). Em
            paralelo, rampas fiat↔stablecoins baratearam entradas pequenas e
            remessas — mas exigem entender o emissor da stablecoin, a rede
            utilizada (Ethereum, Tron, etc.) e as taxas associadas. Essa
            variedade ampliou a conveniência, mas também a necessidade de
            atenção a taxas (trading, saque, rede), liquidez (profundidade do
            livro/pool) e compliance (regras locais de tributação e prevenção à
            lavagem).
          </p>

          <p>
            É útil diferenciar as principais modalidades. CEX (custodial):
            simples para iniciantes, aceita depósitos em moeda local, ordens
            avançadas e mercado mais profundo; riscos — confiar chaves a
            terceiros, políticas de saque, eventuais travamentos em picos de
            volatilidade. DEX (não-custodial): você mantém as chaves e negocia
            via contratos inteligentes; pontos de atenção — gas, seleção da
            rede, slippage, aprovação de spend de tokens e golpes por interfaces
            falsas. P2P: compra direta de outra pessoa com garantias da
            plataforma (custódia em escrow); exige checagem de reputação. OTC
            (mesa de balcão): indicado para tíquetes altos, reduz impacto de
            preço. Produtos listados (quando disponíveis na sua bolsa local):
            simplificam a exposição, mas não dão acesso direto ao uso on-chain
            (não há saque para carteira). Em todos os casos, confirme ticker,
            rede correta, endereço e revise a memo/tag quando a rede exigir
            (ex.: certas cadeias exigem “memo” para crédito).
          </p>

          <p>
            Na prática, um fluxo seguro é: começar pequeno, ativar 2FA e
            antiphishing code na exchange; testar um saque de baixo valor para
            sua carteira antes de mover quantias maiores; anotar sua seed BIP39
            em local offline (idealmente metal) — nunca em fotos/notas na nuvem;
            conferir rede e taxas antes de cada envio; manter registros
            (comprovantes) para fins fiscais; e adotar uma estratégia de entrada
            compatível com sua tolerância a risco — por exemplo, DCA (aportes
            periódicos) reduz dependência de timing. Lembre que “barato” e
            “rápido” variam por rede e momento — confirme as taxas de rede (gas)
            no ato. E, sobretudo, entenda o que está comprando: cripto permite
            autocustódia e uso on-chain, mas transfere a você a responsabilidade
            pela segurança das chaves — sem recuperação por suporte caso a seed
            seja perdida ou exposta.
          </p>
        </div>

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
