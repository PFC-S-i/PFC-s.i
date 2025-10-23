import Link from "next/link";

export const metadata = {
  title: "Ethereum e a ideia de smart contracts • Educacional",
  description:
    "Conceitos essenciais sobre criptomoedas: como funcionam, histórico e tipos de ativos.",
};

const videoId = "UXj6m3gyMZ8"; //O que vem depois do v= na URL do vídeo

export default function Page() {
  return (
    <main className="py-10 md:py-14">
      <div className="fixed inset-0 -z-10 bg-[#151515]" aria-hidden />

      <article className="mx-auto max-w-5xl">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
          Ethereum e a ideia de &quot;smart contracts&quot
        </h1>

        {/* ---- TEXTO EM 3 PARÁGRAFOS ---- */}
        <div className="mt-6 space-y-6 text-base md:text-lg leading-relaxed text-neutral-300">
          <p>
            Ethereum é uma blockchain programável — isto é, um livro-razão
            distribuído que, além de registrar saldos e transferências, executa
            código dentro da EVM (Ethereum Virtual Machine). Existem dois tipos
            de contas: externamente controladas (EOA), operadas por chaves
            privadas, e contas de contrato, que são programas implantados
            on-chain. Um “smart contract” é esse programa: regras escritas em
            linguagem de alto nível (como Solidity) compiladas para bytecode EVM
            e executadas de forma determinística por todos os nós, de modo que o
            mesmo input produz o mesmo output — sem árbitros externos. Cada
            operação consome gas (unidades de computação/armazenamento); a taxa
            paga pelo usuário cobre esse custo e evita abusos. Desde o EIP-1559,
            a taxa é dividida em base fee (queimada) e priority tip (incentivo
            ao proponente do bloco). Contratos têm estado (armazenamento
            persistente), expõem funções chamadas por transações/mensagens e
            emitem eventos (logs) para indexação; padrões como ERC-20
            (fungíveis), ERC-721 (NFTs) e ERC-1155 (multiativo) tornam ativos
            interoperáveis entre carteiras e aplicações.
          </p>

          <p>
            A trajetória histórica começa em 2013 (whitepaper de Vitalik
            Buterin) e 2014 (crowdsale). A rede foi lançada em 2015 (Frontier),
            evoluiu em 2016 (Homestead) e enfrentou o episódio do The DAO
            (jun/2016), que levou a um hard fork com permanência do histórico no
            Ethereum atual e surgimento do Ethereum Classic. Entre 2017–2020,
            padrões de tokens se consolidaram e DeFi ganhou tração. Em ago/2021,
            o EIP-1559 reformou o mercado de taxas. Em set/2022, ocorreu o The
            Merge: a camada de execução (EVM) passou a se ancorar na Prova de
            Participação (PoS) da Beacon Chain, reduzindo consumo energético e
            introduzindo finalização via votos de validadores. Em abr/2023,
            Shanghai/Capella habilitou saques do stake. Em mar/2024, Dencun
            (EIP-4844) adicionou transações com blobs — espaço de dados barato
            para rollups — reforçando o roteiro “rollup-centric” de
            escalabilidade.
          </p>

          <p>
            Do ponto de vista conceitual, vale distinguir: (i) Contas e chamadas
            — EOAs assinam transações; contratos reagem por messages internas,
            sem assinatura própria. (ii) Modelo de estado — contábil por contas
            (saldos) e árvores Merkle-Patricia para provas leves; storage do
            contrato é chave-valor persistente, enquanto eventos são apenas logs
            (não alteram estado). (iii) Contratos inteligentes — são imutáveis
            por padrão após o deploy; quando há necessidade de evolução, usam-se
            padrões de proxy/upgrade (com governança explícita). (iv) Segurança
            — riscos clássicos incluem reentrância, erros de controle de acesso,
            under/overflow (mitigados em versões modernas da linguagem),
            dependência de oráculos e MEV (o valor extraível pela ordem de
            transações); práticas comuns incluem auditoria, bug bounties, rate
            limits e, quando crítico, verificação formal. (v) Padronização e
            contas inteligentes — além dos ERCs de tokens, ERC-4337 habilita
            abstração de contas: carteiras “smart” com recuperação social,
            paymasters (patrocínio de taxas) e autenticação moderna (passkeys),
            reduzindo fricção de uso.
          </p>

          <p>
            Na prática, o par Ethereum + smart contracts permite construir
            aplicações componíveis — DeFi (AMMs, lending, derivativos), NFTs e
            jogos, DAOs com tesourarias on-chain, identidade e tokenização de
            ativos do mundo real — com liquidação transparente e permissionless.
            A escalabilidade vem, sobretudo, de camadas 2 (rollups): optimistic
            (provas de fraude) e ZK (provas de validade), que executam off-chain
            e publicam dados/provas na L1, herdando sua segurança; o EIP-4844
            reduziu significativamente o custo desse dado. O PoS comvalidadores
            apostando ETH coordena proposição/atestações de blocos e oferece
            finalidade econômica após agregação de votos — típica em minutos,
            suficiente para a maioria dos casos. Em troca, surgem trade-offs:
            custos variáveis de gas, superfície de ataque maior que a de um
            simples sistema de pagamentos, dependência de boas carteiras e de
            governança cuidadosa para upgrades. Se bem projetados, porém,
            contratos funcionam como infraestrutura pública programável, na qual
            regras de mercado e de software caminham juntas e são verificáveis
            por qualquer participante da rede.
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
