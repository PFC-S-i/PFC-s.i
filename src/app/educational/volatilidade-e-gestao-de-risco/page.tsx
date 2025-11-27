import Link from "next/link";

export const metadata = {
  title: "Volatilidade e Gestão de Risco • Educacional",
  description:
    "Conceitos essenciais sobre criptomoedas: como funcionam, histórico e tipos de ativos.",
};

const videoId = "DNvctP6Ifzs"; //O que vem depois do v= na URL do vídeo

export default function Page() {
  return (
    <main className="py-10 md:py-14">
      <div className="fixed inset-0 -z-10 bg-[#151515]" aria-hidden />

      <article className="mx-auto max-w-5xl">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-center">
          Volatilidade e Gestão de Risco
        </h1>

        <div className="mt-6 flex justify-center">
          <div className="w-full max-w-3xl rounded-2xl overflow-hidden border border-[#2A2A2A] bg-[#1B1B1B]">
            <div className="relative aspect-video">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                title="Volatilidade e gestão de risco (vídeo)"
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
            Volatilidade é a variação dos retornos ao longo do tempo — em
            finanças, costuma-se medi-la pela desvio-padrão (anualizado) ou por
            proxies de “amplitude” do preço; em cripto, ela é elevada por
            fatores de microestrutura (mercado 24/7, alavancagem em derivativos,
            liquidez desigual entre pares e bolsas, notícias que afetam
            expectativas rapidamente). Distingue-se volatilidade realizada (o
            que de fato ocorreu) de volatilidade implícita (extraída de opções,
            isto é, o que o mercado “precifica” para o futuro). Junto dela
            vivem outros riscos: de mercado (queda de preço e drawdown), de
            liquidez (slippage/saques travados), de contraparte/custódia
            (falhas de corretoras), operacional (perda/comprometimento de
            chaves), regulatório e tecnológico (bugs de contrato, oráculos,
            bridges, depegs de stablecoins). A gestão de risco organiza como
            você mede e limita essas exposições: métricas como máximo drawdown,
            VaR/CVaR (pior perda esperada em cenários extremos), Sharpe/Sortino
            (retorno ajustado a risco) e correlações ajudam a dimensionar
            posições e evitar concentrações perigosas.
          </p>

          <p>
            Historicamente, ciclos de cripto mostraram saltos e recuos
            acentuados (2013, 2017, 2021), quedas rápidas em choques de
            liquidez (ex.: março/2020) e episódios de desalavancagem com
            efeitos em cascata (liquidações automáticas em DeFi, chamadas de
            margem em perpétuos, colapsos de emissores/serviços centralizados
            em 2022). Esses eventos ilustram como volatilidade e estrutura de
            mercado se alimentam: alavancagem amplia movimentos; order books
            rasos e panic selling pioram o impacto; interdependências
            (stablecoins, bridges, empréstimos sobre colateral volátil)
            transmitem choques entre protocolos e bolsas. Em paralelo, o
            ecossistema amadureceu em ferramentas (perpétuos, opções, basis
            trades, orquestração de risk engines), o que tanto permite hedges
            melhores quanto introduz novos pontos de falha se mal utilizados.
          </p>

          <p>
            Conceitualmente, pense o problema em camadas. Exposição e alocação
            — defina quanto do patrimônio vai a cripto e como distribui entre
            ativos (core-satellite, DCA, regras de rebalance). Dimensionamento
            de posição — arrisque uma fração fixa do capital por operação (ex.:
            0,5-2% do portfólio), ajuste pelo alvo de volatilidade (posições
            menores em ativos mais voláteis) e use stops técnicos (por ATR/σ)
            em vez de números redondos. Limites e proteções — hard stops de
            perda, circuit breakers pessoais (pausas após X perdas), limites de
            alavancagem (ou zero alavancagem). Hedge — short em perpétuos para
            neutralizar beta, protective puts/collars em momentos de IV
            razoável, basis (long spot + short perp/futuro) para reduzir
            direcional. Liquidez e execução — prefira ordens limite, fraccione
            entradas/saídas, monitore slippage e profundidade. Risco
            tecnológico/operacional — contratos auditados, minimizar permissões
            (allowances), evitar bridges desnecessárias, usar hardware
            wallet/multisig para custódia. Diversificação e correlações — ativos
            e cadeias diferentes não garantem independência; observe regimes de
            correlação com macro (juros, dólar) e entre criptoativos.
          </p>

          <p>
            Na prática, um plano enxuto funciona assim: (1) Objetivo e horizonte
            (por que cripto? por quanto tempo?); (2) Perda máxima tolerável e
            reserva de emergência fora do ecossistema; (3) Tamanho de posição
            por volatilidade + regra simples de risco por trade (ex.: ≤1% do
            portfólio) e sem alavancagem até dominar o básico; (4) Entradas
            graduais (DCA), rebalance periódico ou por desvio (ex.: ±5 p.p. da
            meta); (5) Cenários “e se?” (-30%, -50%, depeg, bridge parada) com
            ações predefinidas; (6) Higiene operacional (2FA, antiphishing code,
            hardware wallet, backups da seed/passphrase, testes de recuperação);
            (7) Diário de decisões para aprender com erros; (8) Conformidade
            fiscal e atenção a regras locais. Volatilidade é inerente — a gestão
            de risco não elimina perdas, mas evita as que te tiram do jogo,
            permitindo sobreviver o suficiente para que estatística e disciplina
            trabalhem a seu favor. (Conteúdo educacional; não é recomendação de
            investimento.)
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
