/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";

export const metadata = {
  title: "Tipos de carteiras • Educacional",
  description:
    "Conceitos essenciais sobre criptomoedas: como funcionam, histórico e tipos de ativos.",
};

const videoId = "OjoacB7rQ44"; //O que vem depois do v= na URL do vídeo

export default function Page() {
  return (
    <main className="py-10 md:py-14">
      <div className="fixed inset-0 -z-10 bg-[#151515]" aria-hidden />

      <article className="mx-auto max-w-5xl">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-center">
          Tipos de carteiras
        </h1>

        <div className="mt-6 flex justify-center">
          <div className="w-full max-w-3xl rounded-2xl overflow-hidden border border-[#2A2A2A] bg-[#1B1B1B]">
            <div className="relative aspect-video">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                title="Tipos de carteiras (vídeo)"
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
            Carteiras de criptomoedas são, na essência, gerenciadores de chaves:
            elas criam e guardam a chave privada que assina transações e derivam
            a chave pública que origina endereços para receber valores — os
            fundos não “ficam” dentro da carteira, mas sim registrados na rede;
            a carteira apenas controla a capacidade de movimentá-los. Um bom
            software de carteira gera uma seed (frase mnemônica de 12-24
            palavras, padrão BIP39), a partir da qual deriva múltiplas
            chaves/contas (BIP32/BIP44); exibe saldos consultando nós da rede;
            calcula taxas (fee/gas) e assina as transações localmente antes de
            transmiti-las. O ponto crítico é a custódia: quem possui a chave
            manda — se você controla a chave (não-custodial), você controla os
            fundos; se um terceiro guarda as chaves (custodial), você troca
            conveniência por risco de contraparte.
          </p>

          <p>
            A evolução histórica passou de clientes iniciais de desktop (ex.:
            Bitcoin-Qt em 2009) para soluções de armazenamento frio (paper
            wallets sofreram desuso por riscos operacionais) e, com a
            padronização BIP32 (2012)/BIP39 (2013)/BIP44 (2014), consolidou-se o
            modelo de carteiras HD com uma única seed para tudo. Na metade dos
            anos 2010 surgiram as hardware wallets — dispositivos dedicados que
            mantêm a chave isolada e assinam de forma segura — e padrões como
            PSBT/BIP174 facilitaram fluxos air-gapped (USB/QR). Em 2017,
            endereços bech32/SegWit tornaram transações Bitcoin mais eficientes;
            em 2021, Taproot trouxe assinaturas Schnorr e scripts mais
            compactos. No ecossistema Ethereum, a virada foi a adoção da Prova
            de Participação (2022) e, em 2023, a abstração de contas (ERC-4337),
            abrindo espaço para carteiras inteligentes com recuperação social e
            patrocínio de taxas.
          </p>

          <p>
            É útil classificar carteiras por alguns eixos. Custódia: custodiais
            (um serviço guarda suas chaves; praticidade e 2FA, porém risco de
            bloqueio/falência) versus não-custodiais (você guarda a seed;
            soberania e responsabilidade). Conectividade: quentes (hot,
            conectadas à internet; práticas para uso diário) versus frias (cold,
            offline/air-gapped; ideais para long-term/tesouraria). Forma:
            software (mobile, desktop, extensão de navegador, web com assinatura
            local), hardware (dispositivo com elemento seguro que assina sem
            expor a chave), e papel/metal (backup físico da seed — papel é
            frágil; metal resiste melhor). Modelo de controle: single-key (uma
            chave), multisig M-de-N on-chain (ex.: 2-de-3, robusto e
            transparente no Bitcoin/Ethereum) e MPC/threshold signing (a “chave”
            é fragmentada entre partes que assinam em conjunto; bom para
            empresas, porém pode introduzir dependência do provedor). Conta e
            recursos avançados: no Bitcoin, UTXOs e caminhos de derivação (ex.:
            m/84'/0'/0' para bech32), coin control e PSBT; no Ethereum e afins,
            EOAs (chave externa) versus smart wallets (contratos com lógica de
            recuperação, limites, multisig programável, paymasters), além de
            assinaturas EIP-712 para dados tipados. Backups e privacidade: seed
            BIP39 com passphrase (a “25ª palavra”) endurece contra acesso
            indevido; SLIP-39/Shamir divide segredos para redundância; watch-only
            monitora saldos sem poder gastar.
          </p>

          <p>
            Na prática, escolha a carteira alinhando risco x conveniência.
            Quantias pequenas e uso frequente combinam com hot wallets em
            dispositivos confiáveis — sempre com bloqueio biométrico/senha forte
            e atenção a phishing. Poupança e tesouraria pedem hardware wallet
            (idealmente com passphrase) ou multisig; para equipes, multissinatura
            ou MPC com políticas de aprovação e rotação de chaves. Mantenha
            backups offline (preferencialmente em metal, guardados em locais
            distintos), teste a recuperação antes de precisar, atualize
            firmwares, verifique endereços na tela do dispositivo e evite
            armazenar a seed em fotos/notas na nuvem. Em ambientes Ethereum,
            smart wallets podem simplificar a vida (recuperação social,
            patrocínio de taxas), mas exigem entender a governança de upgrades
            do contrato. Em todos os casos, planeje herança/sucessão (instruções
            e acesso condicionado) — e lembre: segurança não é um produto único,
            e sim um conjunto de práticas, onde a carteira é o componente
            central para manter sua soberania sobre os ativos.
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
