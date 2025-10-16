import Link from "next/link";

export const metadata = {
  title: "O que são Criptomoedas? • Educacional",
  description:
    "Conceitos essenciais sobre criptomoedas: como funcionam, histórico e tipos de ativos.",
};

const videoId = "BnCOhgg_X40"; //O que vem depois do v= na URL do vídeo

export default function Page() {
  return (
    <main className="py-10 md:py-14">
      {/* Fundo específico desta página */}
      <div className="fixed inset-0 -z-10 bg-[#151515]" aria-hidden />

      <article className="mx-auto max-w-5xl">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
          O que são Criptomoedas?
        </h1>

        {/* ---- TEXTO EM 3 PARÁGRAFOS ---- */}
        <div className="mt-6 space-y-6 text-base md:text-lg leading-relaxed text-neutral-300">
          <p>
            Criptomoedas são ativos digitais que usam criptografia para garantir
            segurança, verificabilidade e controle de emissão, funcionando em
            redes distribuídas — normalmente uma blockchain — onde um conjunto
            de computadores (nós) valida e registra transações sem depender de
            uma autoridade central. Em vez de contas num banco, cada
            participante possui uma chave privada que assina transações e uma
            chave pública que gera um endereço para receber valores. As
            propriedades mais marcantes desse arranjo são a descentralização, a
            imutabilidade dos registros após confirmados, a transparência do
            histórico e a possibilidade de programar escassez e regras de
            funcionamento diretamente no protocolo. Isso torna possível operar
            um sistema de transferências globais e sempre aberto, no qual taxas
            e inclusão de transações são coordenadas por mecanismos de consenso
            (como Prova de Trabalho ou Prova de Participação) e por incentivos
            econômicos. Na prática, criptomoedas servem como meio de troca e, em
            alguns casos, como reserva de valor, mas também como base para
            plataformas programáveis que hospedam contratos inteligentes,
            aplicativos financeiros descentralizados, jogos, identidades
            digitais e processos de tokenização de ativos do mundo real.
          </p>

          <p>
            O surgimento desse ecossistema remonta a 2008, quando Satoshi
            Nakamoto publicou o whitepaper “Bitcoin: A Peer-to-Peer Electronic
            Cash System”, descrevendo um dinheiro eletrônico ponto a ponto sem
            intermediários. Em 2009, o software foi lançado e o bloco gênese do
            Bitcoin foi minerado, inaugurando a primeira rede blockchain pública
            funcional. Anos depois, em 2015, o Ethereum levou a ideia além de
            simples pagamentos ao introduzir uma máquina virtual para executar
            contratos inteligentes, permitindo que a própria lógica de
            aplicações financeiras, mercados, jogos e organizações fosse
            codificada e executada on-chain. Entre 2017 e 2020, consolidaram-se
            padrões técnicos (como ERC-20 e ERC-721), expandiram-se as finanças
            descentralizadas (DeFi) e popularizaram-se stablecoins, que
            reduziram a volatilidade para muitos usos práticos. De 2020 em
            diante, ganharam tração as soluções de escalabilidade em camadas
            (layer 2, especialmente rollups), o staking em redes de Prova de
            Participação e novas abordagens de usabilidade e segurança, como
            abstração de contas e mecanismos mais sofisticados de governança e
            tokenização.
          </p>

          <p>
            Nesse contexto, é útil diferenciar moedas nativas de tokens. A moeda
            nativa é o ativo principal de uma rede — por exemplo, BTC no Bitcoin
            e ETH no Ethereum — e geralmente é indispensável para o pagamento de
            taxas, a segurança e o alinhamento de incentivos do protocolo. Já os
            tokens são ativos emitidos sobre plataformas programáveis, como o
            Ethereum e outras cadeias compatíveis; eles herdam a segurança e a
            infraestrutura da rede subjacente, mas podem representar utilidades
            diversas. Tokens de utilidade concedem acesso a recursos, descontos
            ou funcionalidades de um aplicativo; tokens de governança conferem
            direitos de voto em propostas que moldam a evolução de um protocolo;
            stablecoins buscam manter paridade com moedas fiduciárias ou cestas
            de ativos para reduzir a volatilidade e viabilizar pagamentos,
            precificação e crédito em DeFi; e há ainda tokens com
            características de valor mobiliário (security tokens), que podem
            representar participação societária, dívida ou fluxos de caixa e,
            por isso, costumam envolver exigências regulatórias específicas
            conforme a jurisdição. Em conjunto, moedas nativas e tokens estendem
            a noção original de “moeda digital” para um espectro mais amplo de
            instrumentos programáveis, nos quais regras econômicas e de
            governança são codificadas e executadas diretamente na rede, abrindo
            espaço para mercados, produtos e serviços financeiros e não
            financeiros nativamente digitais.
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
            href="/educacional"
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
