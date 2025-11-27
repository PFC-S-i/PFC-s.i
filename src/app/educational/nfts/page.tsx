import Link from "next/link";

export const metadata = {
  title: "NFTs • Educacional",
  description:
    "Conceitos essenciais sobre criptomoedas: como funcionam, histórico e tipos de ativos.",
};

const videoId = "oME9JyIJHfY"; //O que vem depois do v= na URL do vídeo

export default function Page() {
  return (
    <main className="py-10 md:py-14">
      <div className="fixed inset-0 -z-10 bg-[#151515]" aria-hidden />

      <article className="mx-auto max-w-5xl">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-center">
          NFTs
        </h1>

        <div className="mt-6 flex justify-center">
          <div className="w-full max-w-3xl rounded-2xl overflow-hidden border border-[#2A2A2A] bg-[#1B1B1B]">
            <div className="relative aspect-video">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                title="NFTs (vídeo)"
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
            NFTs (non-fungible tokens) são tokens não fungíveis: unidades digitais únicas
            registradas em uma blockchain, cujo identificador é o par (endereço do contrato,
            tokenId) — diferente de um token fungível (como um ERC-20), cada NFT representa
            algo distinto. Na prática, o contrato mantém um mapeamento de propriedade (quem
            possui qual tokenId) e expõe funções para cunhar (mint), transferir e queimar
            (burn). A “aparência” do NFT vem de metadados (JSON) acessados por uma tokenURI
            que aponta para imagem/áudio/vídeo e atributos; esses dados podem estar on-chain
            (persistem no contrato) ou off-chain (IPFS/Arweave ou servidores). Importante:
            posse on-chain ≠ direitos autorais — a licença de uso/redistribuição da obra
            depende de termos definidos pelo criador ou pela plataforma. Em Ethereum, o padrão
            dominante é o ERC-721 (um ID único por item); o ERC-1155 generaliza para itens
            semi-fungíveis (múltiplas cópias do mesmo ID, útil em games e coleções mistas).
          </p>

          <p>
            Historicamente, ideias de representação de itens únicos surgiram com colored
            coins/experimentos no início dos anos 2010; em 2017, CryptoPunks e CryptoKitties
            popularizaram colecionáveis digitais e mostraram limites de escala da rede; em
            2018, o ERC-721 consolidou uma interface comum. Entre 2020–2021, houve boom de
            arte e colecionáveis, com marketplaces dedicados e projetos blue-chip;
            paralelamente, outras cadeias ganharam tração (ex.: Flow com NBA Top Shot,
            Tezos/Polygon por custos menores). Em seguida, amadureceram padrões de royalties
            (sinalização via EIP-2981, ainda com execução dependente de marketplaces),
            práticas de “congelar” metadados, e integrações com camadas 2 para reduzir
            custos, além de usos utilitários (ingressos, passes de membro) e experimentos de
            identidade e credenciais.
          </p>

          <p>
            É útil separar categorias e dimensões técnicas. Tipo de ativo: (I) Arte/colecionáveis
            (peças únicas ou séries), (II) utilidade (ingressos, membership, airdrop de
            benefícios), (III) gaming (itens, skins, land), (IV) nomes de domínio on-chain
            (ENS), (V) credenciais e SBTs (soulbound tokens, intransferíveis por design).
            Padrões e modelo: ERC-721 (unicidade estrita) vs ERC-1155 (lotes e
            semi-fungibilidade). Armazenamento: on-chain (imutabilidade máxima, custo alto) vs
            off-chain (IPFS/Arweave recomendados; servidores centralizados implicam risco de
            link quebrado). Economia e governança: royalties podem ser sinalizados no padrão,
            mas a cobrança é fora do protocolo (depende da política do marketplace); listas
            de permissão, merkle mints e allowlists organizam cunhagens; verificação de
            coleção ajuda a evitar falsificações. Segurança: aprovações de gasto
            (setApprovalForAll), upgrades de contratos, e riscos de reentrância/oráculos
            exigem auditoria e cautela.
          </p>

          <p>
            Na prática, NFTs oferecem propriedade verificável e programável — útil para provar
            escassez digital, criar mercados secundários, atrelar acesso/benefícios a uma
            carteira e compor experiências entre apps. Em contrapartida, há riscos: liquidez
            variável (fácil comprar, difícil vender no preço desejado), plágio/coleções
            falsas, metadados mutáveis (rug pulls de arte), dependência de marketplaces, e
            incertezas sobre licenças e tributação. Boas práticas: verificar endereço do
            contrato e criador, confirmar supply e metadata freeze, preferir IPFS/Arweave,
            revisar a licença (comerciais/derivativos), limitar permissões de aprovação
            (revogar quando não usar), e custodiar em carteiras seguras (hardware ou smart
            wallets bem configuradas). Com padrões sólidos e atenção à segurança, NFTs
            funcionam como blocos de construção para arte, jogos, identidade e tickets — uma
            camada de objetos digitais escassos e interoperáveis sobre a infraestrutura das
            blockchains.
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
