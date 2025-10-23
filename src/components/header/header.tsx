"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, User } from "lucide-react";

import { Button } from "@/components/button";
import { NavLinks, NAV_LINKS } from "@/app/components/nav-link";
import { useAuth } from "@/context/auth.context";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="pt-5 relative">
      <div className="sm:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
            <Link href="/">infoCrypto</Link>
          </h1>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <NavLinks />

          {/* Perfil (autenticado) */}
          {!loading && isAuthenticated && (
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-1.5 hover:bg-white/5"
            >
              <User size={18} className="text-primary" />
              <span>Perfil</span>
            </Link>
          )}

          {/* Entrar / Cadastrar (não autenticado) */}
          {!loading && !isAuthenticated && (
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => router.push("/login")}
            >
              <User size={20} />
              Entrar / Cadastrar
            </Button>
          )}
        </div>

        {/* Mobile */}
        <div className="md:hidden relative" ref={menuRef}>
          <button
            className="text-primary"
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 min-w-max text-foreground bg-background shadow-md rounded-md z-50 p-2 space-y-1 border border-white/10">
              {/* mesmos links do desktop */}
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="block px-3 py-2 rounded hover:bg-white/5"
                  onClick={() => setIsOpen(false)}
                >
                  {label}
                </Link>
              ))}

              <hr className="my-1 border-white/10" />

              {/* Perfil (autenticado) */}
              {!loading && isAuthenticated && (
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded hover:bg-white/5"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="inline-flex items-center gap-2">
                    <User size={18} className="text-primary" />
                    <span>Perfil</span>
                  </span>
                </Link>
              )}

              {/* Entrar / Cadastrar (não autenticado) */}
              {!loading && !isAuthenticated && (
                <button
                  className="block w-full text-left px-3 py-2 rounded hover:bg-white/5 inline-flex items-center gap-2"
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/login");
                  }}
                >
                  <User size={18} className="text-primary" />
                  Entrar / Cadastrar
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <hr className="w-full border-gray-800 mt-4" />
    </header>
  );
}

export default Header;
