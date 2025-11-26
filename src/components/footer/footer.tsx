"use client";

import { Mail } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-border/50 py-8 text-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-base font-medium text-foreground">InfoCrypto</p>
          <p className="text-muted-foreground text-sm">
            Hub educacional e painel de cotações em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4" aria-hidden />
          <a
            href="mailto:infocryptopfc@gmail.com"
            className="hover:text-foreground transition-colors"
          >
            infocryptopfc@gmail.com
          </a>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-xs text-muted-foreground">
        <p>© {year} InfoCrypto. Todos os direitos reservados.</p>

        <div className="flex gap-4">
          <p>
            <a
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Termos
            </a>
          </p>
          <p>
            <a
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacidade
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
