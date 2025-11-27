import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso — InfoCrypto",
  description:
    "Termos de Uso da InfoCrypto: regras de uso, responsabilidades e limitações.",
};

export default function TermsPage() {
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
          <h1>Termos de Uso</h1>
          <p className="text-sm opacity-80">
            Última atualização:{" "}
            <time dateTime="2025-11-06">06 de novembro de 2025</time>
          </p>
        </header>

        <p>
          Bem-vindo à <strong>InfoCrypto</strong>. Ao utilizar nosso site e
          nossos serviços, você concorda com estes Termos de Uso. Leia
          atentamente — ao continuar, você declara ter lido e compreendido os
          termos abaixo.
        </p>

        <nav
          aria-label="Sumário"
          className="not-prose my-6 rounded-xl border border-white/10 bg-white/5 p-4"
        >
          <h2 className="m-0 text-base font-semibold">Sumário</h2>
          <ul className="mt-3 list-disc pl-5 marker:text-current">
            <li>
              <a href="#aceite">Aceite dos Termos</a>
            </li>
            <li>
              <a href="#cadastro">Cadastro e Conta</a>
            </li>
            <li>
              <a href="#uso">Uso Permitido e Conduta</a>
            </li>
            <li>
              <a href="#conteudo">
                Conteúdo, Direitos e Propriedade Intelectual
              </a>
            </li>
            <li>
              <a href="#mercado">Dados de Mercado e Isenções</a>
            </li>
            <li>
              <a href="#responsabilidade">Limitação de Responsabilidade</a>
            </li>
            <li>
              <a href="#rescisao">Suspensão e Rescisão</a>
            </li>
            <li>
              <a href="#alteracoes">Alterações destes Termos</a>
            </li>
            <li>
              <a href="#contato">Contato</a>
            </li>
          </ul>
        </nav>

        <h2 id="aceite">1. Aceite dos Termos</h2>
        <p>
          O uso da plataforma implica seu aceite integral destes Termos. Se você
          não concordar com qualquer cláusula, deve interromper o uso do
          serviço. Para referências sobre como tratamos dados pessoais, consulte
          também nossa <a href="/privacy">Política de Privacidade</a>.
        </p>

        <h2 id="cadastro" className="mt-10">
          2. Cadastro e Conta
        </h2>
        <p>
          Para utilizar determinadas funcionalidades, pode ser necessário criar
          uma conta. Você deve fornecer informações verdadeiras, completas e
          atualizadas. Você é responsável por manter a confidencialidade de suas
          credenciais e por todas as atividades realizadas em sua conta.
        </p>

        <h2 id="uso" className="mt-10">
          3. Uso Permitido e Conduta
        </h2>
        <p>
          Você se compromete a usar a InfoCrypto de forma lícita e em
          conformidade com estes Termos. É vedado: (i) praticar engenharia
          reversa, varreduras automatizadas abusivas (scraping) ou atividades
          que comprometam a disponibilidade; (ii) publicar conteúdo ilícito,
          difamatório, enganoso, violento ou que viole direitos de terceiros;
          (iii) tentar acessar dados a que você não tenha permissão.
        </p>

        <h2 id="conteudo" className="mt-10">
          4. Conteúdo, Direitos e Propriedade Intelectual
        </h2>
        <p>
          A marca, o layout, os textos e demais elementos da InfoCrypto podem
          estar protegidos por direitos de propriedade intelectual. Você não
          adquire qualquer licença além da estritamente necessária ao uso normal
          da plataforma. Conteúdos enviados por você permanecem de sua
          titularidade, mas você concede licença não exclusiva para hospedagem,
          processamento e exibição na plataforma, conforme aplicável.
        </p>

        <h2 id="mercado" className="mt-10">
          5. Dados de Mercado e Isenções
        </h2>
        <p>
          As informações exibidas (incluindo preços, gráficos e notícias) podem
          ser provenientes de terceiros. Embora busquemos acurácia e atualidade,
          não garantimos que os dados estejam isentos de erros, interrupções ou
          atrasos. <strong>Não fornecemos aconselhamento financeiro</strong>.
          Decisões de investimento são de sua exclusiva responsabilidade.
        </p>

        <h2 id="responsabilidade" className="mt-10">
          6. Limitação de Responsabilidade
        </h2>
        <p>
          Na extensão permitida pela lei, a InfoCrypto não se responsabiliza por
          danos indiretos, acidentais, consequentes, perda de lucros, perda de
          dados, interrupções ou outros prejuízos decorrentes do uso ou da
          incapacidade de uso da plataforma.
        </p>

        <h2 id="rescisao" className="mt-10">
          7. Suspensão e Rescisão
        </h2>
        <p>
          Podemos suspender ou encerrar a sua conta, a nosso critério, em caso
          de violação destes Termos, risco à segurança, fraude, ordem legal ou
          por descontinuação do serviço. Quando possível, tentaremos notificá-lo
          previamente.
        </p>

        <h2 id="alteracoes" className="mt-10">
          8. Alterações destes Termos
        </h2>
        <p>
          Poderemos atualizar estes Termos periodicamente. As alterações entram
          em vigor após a publicação. Recomendamos revisar esta página
          regularmente. O uso contínuo após mudanças implica aceite.
        </p>

        <h2 id="contato" className="mt-10">
          9. Contato
        </h2>
        <p>
          Dúvidas? Fale com a gente em{" "}
          <a href="mailto:infocryptopfc@gmail.com">infocryptopfc@gmail.com</a>.
        </p>

        <hr />
        <p className="text-sm opacity-80">
          Ao usar a InfoCrypto, você também concorda com a nossa{" "}
          <a href="/privacy">Política de Privacidade</a>.
        </p>
      </article>
    </main>
  );
}
