import { EducationalHeader } from "./components/educational-header";
import { TopicsGrid } from "./components/topics-grid";

export default function EducationalPage() {
  return (
    <main className="relative py-10 md:py-14 text-foreground">
      {/* Fundo 100% viewport */}
      <div className="fixed inset-0 -z-10 bg-[#151515]" aria-hidden />

      <header className="mb-8 md:mb-10">
        <EducationalHeader />
      </header>

      <section aria-label="Lista de tópicos educacionais">
        <TopicsGrid />
      </section>
    </main>
  );
}
