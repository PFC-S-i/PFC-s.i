"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, User, LogOut } from "lucide-react";

import { Button } from "@/components/button";
import { NavLinks } from "@/app/components/nav-link";
import { useAuth } from "@/context/auth.context"; // << integra com o contexto

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated, user, logout } = useAuth();
  const displayName =
    user?.name || (user?.email ? user.email.split("@")[0] : "Usuário");

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fechar menu ao trocar de rota
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="pt-5 relative">
      <div className="sm:px-6 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
            <Link href="/">infoCrypto</Link>
          </h1>
        </div>

        {/* Links + Ações (desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <NavLinks />

          {!isAuthenticated ? (
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => router.push("/login")}
            >
              <User size={20} />
              Entrar / Cadastrar
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-1.5">
                <User size={18} />
                <span className="max-w-[160px] truncate">{displayName}</span>
              </div>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={logout}
              >
                <LogOut size={18} />
                Sair
              </Button>
            </div>
          )}
        </div>

        {/* Hamburger (mobile) */}
        <div className="md:hidden relative" ref={menuRef}>
          <button className="text-primary" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Dropdown mobile */}
          {isOpen && (
            <div className="absolute right-0 mt-2 min-w-max text-foreground bg-background shadow-md rounded-md z-50 p-2 space-y-2 border border-white/10">
              <Link
                href="/dashboard"
                className="block px-2 py-1"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>

              <Link
                href="/educational"
                className="block px-2 py-1"
                onClick={() => setIsOpen(false)}
              >
                Educacional
              </Link>

              <Link
                href="/buscas"
                className="block px-2 py-1"
                onClick={() => setIsOpen(false)}
              >
                Notícias
              </Link>

              <Link
                href="/newsletter"
                className="block px-2 py-1"
                onClick={() => setIsOpen(false)}
              >
                Newsletter
              </Link>

              {/* Ação de autenticação no mobile */}
              {!isAuthenticated ? (
                <button
                  className="block w-full text-left px-2 py-1 flex items-center gap-2"
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/login");
                  }}
                >
                  <User size={18} className="text-primary" />
                  Entrar / Cadastrar
                </button>
              ) : (
                <button
                  className="block w-full text-left px-2 py-1 flex items-center gap-2"
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                >
                  <LogOut size={18} className="text-primary" />
                  Sair
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
