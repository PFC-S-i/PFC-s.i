import Link from "next/link";

export const metadata = {
  title: "Como funciona a Blockchain? • Educacional",
  description:
    "",
};

const videoId = "sxkrt-z4rbE"; //O que vem depois do v= na URL do vídeo

export default function Page() {
  return (
    <main className="py-10 md:py-14">
      {/* Fundo específico desta página */}
      <div className="fixed inset-0 -z-10 bg-[#151515]" aria-hidden />

      <article className="mx-auto max-w-5xl">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
          Como funciona a Blockchain?
        </h1>

        {/* ---- TEXTO EM 3 PARÁGRAFOS ---- */}
        <div className="mt-6 space-y-6 text-base md:text-lg leading-relaxed text-neutral-300">
          <p>
            Blockchain é um livro-razão distribuído em que transações são agrupadas em blocos encadeados por criptografia: cada bloco referencia o hash do bloco anterior, formando uma cadeia que dificulta alterações retroativas — mudar um bloco exigiria recalcular todos os seguintes e convencer a rede a aceitar a nova história. Um bloco carrega um cabeçalho (timestamp, hash anterior, raiz de Merkle das transações, e parâmetros do consenso) e um corpo (as transações em si). As transações são assinadas digitalmente com chaves privadas — a chave pública (ou um endereço derivado) permite verificar a autoria sem revelar a chave secreta. Nós da rede (computadores participantes) propagam transações, verificam assinaturas e regras do protocolo (saldo suficiente, limites de gás/taxa, formatos válidos) e mantêm uma “mempool” com transações pendentes. O consenso — p.ex., Prova de Trabalho (PoW) ou Prova de Participação (PoS) — decide quem pode propor o próximo bloco e como a rede concorda com uma única sequência canônica de blocos; taxas incentivam a inclusão e priorizam transações. A segurança decorre do encadeamento por hash, da validação independente por muitos nós e dos custos econômicos para reescrever a história.
          </p>

          <p>
            A ideia tem raízes nos anos 1990: Stuart Haber e W. Scott Stornetta descreveram carimbos de tempo encadeados por hash; no fim da década, Adam Back propôs o Hashcash (trabalho computacional como antisspam). Em 2008, Satoshi Nakamoto uniu essas peças no whitepaper “Bitcoin: A Peer-to-Peer Electronic Cash System”, especificando uma rede aberta onde PoW coordena quem minera blocos e reduz ataques de gasto duplo; em 2009, o bloco gênese inaugurou a primeira blockchain pública funcional. A partir de 2015, o Ethereum generalizou o modelo ao embutir uma máquina virtual capaz de executar contratos inteligentes on-chain. Nos anos seguintes consolidaram-se padrões de tokens e surgiram camadas de escalabilidade (canais e rollups) para aliviar o throughput do nível básico (camada 1). Paralelamente, redes novas adotaram PoS — no qual validadores comprometem (stake) o ativo nativo para propor/atestar blocos e são recompensados ou punidos economicamente — buscando menor consumo energético e finalidades mais rápidas.
          </p>

          <p>
            É útil distinguir diferentes dimensões arquiteturais. (I) Acesso e governança: redes permissionless são abertas a qualquer participante (Bitcoin, Ethereum), enquanto redes permissionadas restringem validadores/usuários a um consórcio (comuns em cenários corporativos). (II) Modelo de contas: o UTXO (Bitcoin) trata cada saída como “moeda” individual consumível, favorecendo paralelismo e privacidade por composição; o modelo de contas (Ethereum e afins) guarda saldos e estado global, facilitando contratos inteligentes. (III) Consenso e finalidade: PoW entrega finalidade probabilística (a confiança aumenta com confirmações sucessivas); PoS e variantes BFT (como IBFT/Tendermint/HotStuff) podem oferecer finalidade econômica ou determinística após votos suficientes dos validadores. (IV) Estruturas de dados: a maioria usa cadeias lineares com árvores de Merkle para comprovações leves; há variantes baseadas em DAGs que alteram a dinâmica de ordenação, mas mantêm a verificação criptográfica. Cada escolha implica trade-offs de segurança, desempenho, complexidade e descentralização.
          </p>

          <p>
            Na prática, blockchains permitem liquidação transparente e programável, mas com custos e limitações claras. A transparência facilita auditoria pública — ao mesmo tempo em que exige camadas de privacidade (criptografia de conhecimento-zero, técnicas de ofuscação) quando dados sensíveis são indesejáveis. A segurança de rede depende da participação honesta economicamente incentivada: ataques de 51% (PoW) ou colusões com grande stake (PoS) são mitigados por custos elevados, slashing e diversidade de validadores. O chamado “trilema” — descentralização, segurança e escalabilidade — explica por que muitas soluções deslocam parte do processamento para camadas 2 (rollups otimistas ou de provas ZK) que executam/transacionam fora da L1 e ancoram provas compactas na cadeia base, herdando sua segurança. Por fim, contratos inteligentes estendem o livro-razão a mercados, empréstimos, jogos e identidades, mas introduzem riscos específicos (bugs, oráculos, MEV) que exigem auditoria, governança cuidadosa e boas práticas de desenvolvimento.
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
                title="Como funciona a blockchain (vídeo)"
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
