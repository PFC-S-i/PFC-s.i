import { Session } from "./components/session";

export default function Page() {
  return (
    <main className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 items-center gap-10">
        <div className="text-left">
          <h1 className="text-2xl md:text-3xl font-semibold">
            Esqueci minha senha
          </h1>
          <p className="mt-3 opacity-80">
            Informe seu e-mail para receber as instruções de recuperação.
          </p>
        </div>

        <div className="w-full">
          <Session />
        </div>
      </div>
    </main>
  );
}
