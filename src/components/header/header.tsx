// src/components/header/header.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, User } from "lucide-react";

import { Button } from "@/components/button";
import { NavLinks } from "@/app/components/nav-link";
import { useAuth } from "@/context/auth.context";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated, loading } = useAuth(); // 👈 pega loading

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
          <button className="text-primary" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

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
                href="/news"
                className="block px-2 py-1"
                onClick={() => setIsOpen(false)}
              >
                Notícias
              </Link>

              {/* Perfil */}
              {!loading && isAuthenticated && (
                <Link
                  href="/profile"
                  className="block px-2 py-1"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <User size={18} className="text-primary" />
                    <span>Perfil</span>
                  </span>
                </Link>
              )}

              {/* Entrar / Cadastrar */}
              {!loading && !isAuthenticated && (
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
