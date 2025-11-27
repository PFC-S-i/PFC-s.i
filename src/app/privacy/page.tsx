import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade — InfoCrypto",
  description:
    "Como a InfoCrypto coleta, utiliza e protege seus dados pessoais (LGPD).",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/10"
          aria-label="Voltar para a tela de cadastro"
        >
          <span className="text-lg leading-none">←</span>
          Voltar para cadastro
        </Link>
      </div>

      <article className="prose prose-invert prose-headings:scroll-mt-24 prose-p:my-4 prose-p:leading-relaxed prose-li:leading-relaxed">
        <header className="mb-8">
          <h1>Política de Privacidade</h1>
          <p className="text-sm opacity-80">
            Última atualização:{" "}
            <time dateTime="2025-11-06">06 de novembro de 2025</time>
          </p>
        </header>

        <p>
          Esta Política explica como a <strong>InfoCrypto</strong> coleta, usa,
          compartilha e protege seus dados pessoais, em conformidade com a{" "}
          <strong>LGPD (Lei nº 13.709/2018)</strong>. Ao utilizar a plataforma,
          você concorda com as práticas aqui descritas.
        </p>

        <nav
          aria-label="Sumário"
          className="not-prose my-6 rounded-xl border border-white/10 bg-white/5 p-4"
        >
          <h2 className="m-0 text-base font-semibold">Sumário</h2>
          <ul className="mt-3 list-disc pl-5 marker:text-current">
            <li>
              <a href="#dados-coletados">Dados Coletados</a>
            </li>
            <li>
              <a href="#bases-legais">Bases Legais (LGPD)</a>
            </li>
            <li>
              <a href="#uso-dos-dados">Como Utilizamos os Dados</a>
            </li>
            <li>
              <a href="#cookies">Cookies e Tecnologias Semelhantes</a>
            </li>
            <li>
              <a href="#compartilhamento">Compartilhamento com Terceiros</a>
            </li>
            <li>
              <a href="#direitos">Seus Direitos</a>
            </li>
            <li>
              <a href="#seguranca">Segurança</a>
            </li>
            <li>
              <a href="#retencao">Retenção e Eliminação</a>
            </li>
            <li>
              <a href="#transferencia">Transferência Internacional</a>
            </li>
            <li>
              <a href="#menores">Crianças e Adolescentes</a>
            </li>
            <li>
              <a href="#contato">Contato</a>
            </li>
          </ul>
        </nav>

        <h2 id="dados-coletados">1. Dados Coletados</h2>
        <ul>
          <li>
            <strong>Conta:</strong> nome, e-mail, credenciais (armazenadas de
            forma segura — não guardamos senhas em texto puro).
          </li>
          <li>
            <strong>Uso:</strong> logs de acesso, páginas visitadas, IP,
            identificadores de dispositivo e navegador (quando aplicável).
          </li>
          <li>
            <strong>Comunicações:</strong> mensagens de suporte e preferências.
          </li>
          <li>
            <strong>Cookies:</strong> para autenticação, preferências e análise
            de uso (ver seção de Cookies).
          </li>
        </ul>

        <h2 id="bases-legais" className="mt-10">
          2. Bases Legais (LGPD)
        </h2>
        <p>
          Tratamos dados com base em: (i) <em>execução de contrato</em> (para
          fornecer a plataforma), (ii) <em>cumprimento de obrigação legal</em>,
          (iii) <em>legítimo interesse</em> (melhorias, segurança e prevenção a
          fraudes), e (iv) <em>consentimento</em> quando necessário (ex.: certas
          comunicações).
        </p>

        <h2 id="uso-dos-dados" className="mt-10">
          3. Como Utilizamos os Dados
        </h2>
        <ul>
          <li>Operar e manter a plataforma (login, sessões, preferências).</li>
          <li>Melhorar desempenho, usabilidade e segurança.</li>
          <li>Responder a solicitações de suporte.</li>
          <li>
            Exibir conteúdos e dados de mercado — sem constituir recomendação
            financeira.
          </li>
          <li>Cumprir requisitos legais e regulatórios aplicáveis.</li>
        </ul>

        <h2 id="cookies" className="mt-10">
          4. Cookies e Tecnologias Semelhantes
        </h2>
        <p>
          Usamos cookies essenciais (autenticação, segurança) e, quando
          configurados, analíticos/funcionais. Você pode ajustar preferências no
          navegador; porém, a desativação de cookies essenciais pode limitar
          funcionalidades.
        </p>

        <h2 id="compartilhamento" className="mt-10">
          5. Compartilhamento com Terceiros
        </h2>
        <p>
          Podemos compartilhar dados com provedores de serviços (hospedagem,
          e-mail, monitoramento, analytics) sob obrigações contratuais de
          confidencialidade e segurança. Também podemos compartilhar para
          cumprir ordens legais ou proteger direitos, segurança e integridade da
          InfoCrypto e de seus usuários.
        </p>

        <h2 id="direitos" className="mt-10">
          6. Seus Direitos
        </h2>
        <p>
          Nos termos da LGPD, você pode solicitar: confirmação de tratamento,
          acesso, correção, anonimização, portabilidade, eliminação (quando
          aplicável) e informações sobre compartilhamento. Para exercer seus
          direitos, veja <a href="#contato">Contato</a>.
        </p>

        <h2 id="seguranca" className="mt-10">
          7. Segurança
        </h2>
        <p>
          Adotamos medidas técnicas e organizacionais razoáveis para proteger os
          dados pessoais. Nenhum método é 100% seguro; recomendamos o uso de
          senhas fortes e a não reutilização de credenciais.
        </p>

        <h2 id="retencao" className="mt-10">
          8. Retenção e Eliminação
        </h2>
        <p>
          Mantemos dados apenas pelo tempo necessário para cumprir as
          finalidades informadas e obrigações legais. Após esse período,
          eliminamos ou anonimizamos conforme a legislação aplicável.
        </p>

        <h2 id="transferencia" className="mt-10">
          9. Transferência Internacional
        </h2>
        <p>
          Serviços de terceiros podem operar fora do Brasil. Nesses casos,
          adotamos salvaguardas adequadas, conforme exigido pela LGPD.
        </p>

        <h2 id="menores" className="mt-10">
          10. Crianças e Adolescentes
        </h2>
        <p>
          A plataforma não é destinada a menores de 13 anos. Para usuários entre
          13 e 18 anos, o uso deve ocorrer com supervisão e consentimento dos
          responsáveis, quando aplicável.
        </p>

        <h2 id="contato" className="mt-10">
          11. Contato
        </h2>
        <p>
          Para dúvidas, solicitações ou exercício de direitos, entre em contato
          em{" "}
          <a href="mailto:infocryptopfc@gmail.com">infocryptopfc@gmail.com</a>.
        </p>

        <hr />
        <p className="text-sm opacity-80">
          Saiba também como utilizamos a plataforma lendo os nossos{" "}
          <a href="/terms">Termos de Uso</a>.
        </p>
      </article>
    </main>
  );
}
