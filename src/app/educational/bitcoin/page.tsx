import Link from "next/link";

export const metadata = {
  title: "Saiba mais sobre o Bitcoin • Educacional",
  description:
    "Conceitos essenciais sobre criptomoedas: como funcionam, histórico e tipos de ativos.",
};

const videoId = "bIt4iZldY5E"; // O que vem depois do v= na URL do vídeo

export default function Page() {
  return (
    <main className="py-10 md:py-14">
      <div className="fixed inset-0 -z-10 bg-[#151515]" aria-hidden />

      <article className="mx-auto max-w-5xl">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-center">
          Saiba mais sobre o Bitcoin
        </h1>

        <div className="mt-6 flex justify-center">
          <div className="w-full max-w-3xl rounded-2xl overflow-hidden border border-[#2A2A2A] bg-[#1B1B1B]">
            <div className="relative aspect-video">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                title="Saiba mais sobre o bitcoin (vídeo)"
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
            Bitcoin é uma rede monetária aberta que coordena, sem autoridade
            central, a emissão e a liquidação de um ativo digital escasso (BTC)
            por meio de prova de trabalho (Proof of Work). Transações são
            assinadas com chaves privadas e agrupadas em blocos; cada bloco
            referencia o hash do anterior, formando uma cadeia difícil de
            alterar retroativamente. O modelo contábil é de UTXO (unspent
            transaction outputs): cada saída é um “título ao portador” que pode
            ser gasto uma única vez — carteiras combinam/fragmentam UTXOs para
            formar novos. Mineradores competem para encontrar um nonce que torne
            o hash do bloco menor que o alvo de dificuldade; quem vence propõe o
            bloco, recebe a subvenção (block subsidy) mais as taxas e faz a rede
            avançar. A emissão é previsível: máximo de 21 milhões de BTC, com a
            recompensa por bloco reduzida pela metade a cada 210.000 blocos (~4
            anos) — os chamados halvings. Para manter ~10 min por bloco, a
            dificuldade se ajusta automaticamente a cada 2016 blocos (~14 dias).
            A segurança emerge do custo econômico de reescrever blocos, da
            verificação independente por nós completos e do mercado de taxas que
            incentiva inclusão ordenada na “mempool”.
          </p>

          <p>
            A trajetória começa em 2008, com o whitepaper “Bitcoin: A
            Peer-to-Peer Electronic Cash System” (Satoshi Nakamoto). Em 3 jan
            2009, o bloco gênese foi minerado; ainda em jan 2009, ocorreu a
            primeira transação registrada (Satoshi → Hal Finney). Em 22 mai 2010
            (“Pizza Day”), BTC foi usado num pagamento por bens físicos,
            demonstrando utilidade prática. Vieram então os halvings de 2012,
            2016, 2020 e 2024, reduzindo a subvenção de 50 → 25 → 12,5 → 6,25 →
            3,125 BTC por bloco. O debate de escalabilidade levou ao SegWit
            (ativado em ago 2017), que corrigiu maleabilidade, aumentou a
            eficiência e abriu caminho para camadas superiores; no mesmo período
            ocorreu o fork do Bitcoin Cash. A partir de 2018, a Lightning
            Network ganhou uso como solução de micropagamentos fora da cadeia
            (off-chain). Em nov 2021, o Taproot (Schnorr/Tapscript) simplificou
            scripts, melhorou privacidade e eficiências de assinatura — recurso
            que também viabilizou usos mais expressivos de dados e políticas de
            gasto.
          </p>

          <p>
            É útil separar dimensões do ecossistema. Camadas: a camada 1
            (on-chain) oferece liquidação global, segurança e resistências a
            censura; a Lightning (camada 2) oferece pagamentos instantâneos de
            baixo custo, abrindo/fechando canais na L1 quando necessário. Tipos
            de endereço/roteamento de script: P2PKH (legado), P2SH, SegWit
            (bech32) e Taproot (bech32m) — cada geração melhora eficiência e
            privacidade em graus distintos. Políticas de custódia: carteiras
            não-custodiais (você controla a chave/seed), custodiais (terceiro
            guarda as chaves), hardware wallets (isolam a chave em dispositivo
            dedicado) e esquemas multisig (ex.: 2-de-3) que reduzem ponto único
            de falha. Funcionalidades de script: timelocks (CLTV/CSV),
            pagamentos condicionais, agregação de assinaturas com Schnorr e
            roteamentos que tornam transações complexas “parecidas” com simples
            — melhorando privacidade por uniformidade.
          </p>

          <p>
            Na prática, Bitcoin funciona como camada de liquidação e reserva
            digital de valor para quem busca política monetária fixa,
            previsível e independente; também serve a pagamentos internacionais
            (sobretudo combinando L1 + Lightning). Os trade-offs são claros:
            volatilidade de preço, custódia (responsabilidade pela chave),
            privacidade limitada por padrão (livro-razão público exige boas
            práticas), e risco regulatório com regras que variam por
            jurisdição. Do lado operacional, a segurança de PoW depende de ampla
            descentralização de mineradores e do custo energético — criticado
            por consumo absoluto, mas defendido por ancorar a escassez e
            aproveitar energia ociosa em alguns cenários. Em termos de
            governança, mudanças passam por BIPs e soft forks amplamente
            consensuais, valorizando estabilidade do protocolo base: o resultado
            é um núcleo simples e conservador na L1, com inovação empurrada às
            bordas (carteiras, camadas 2, melhores práticas de privacidade) —
            preservando a função primordial de um dinheiro digital resistente à
            censura e verificável por qualquer pessoa.
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
