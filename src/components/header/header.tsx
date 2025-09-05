"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, X, User } from "lucide-react";
import { Button } from "@/components/button";
import { NavLinks } from "../../app/components/nav-link";
import Link from "next/link";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="pt-5 relative">
      <div className="sm:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
            <Link href="/">infoCripto</Link>
          </h1>
        </div>

        {/* Links e botão de usuário em desktop */}
        <div className="hidden md:flex items-center gap-4">
          <NavLinks />
          <Button variant="outline" className="flex items-center gap-2">
            <User size={20} />
            Entrar / Cadastrar
          </Button>
        </div>

        {/* Hamburger mobile */}
        <div className="md:hidden relative" ref={menuRef}>
          <button className="text-primary" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Menu dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-2 min-w-max text-foreground shadow-md rounded-md z-50 p-2 space-y-2">
              <a href="#sobre" className="block px-2 py-1">
                Dashboard
              </a>
              <a
                href="/educacional"
                className="block px-2 py-1"
                onClick={close}
              >
                {" "}
                {/* Navega para a página do Educacional */}
                Educacional
              </a>
              <a href="/buscas" className="block px-2 py-1">
                Notícias
              </a>
              <a href="#newsletter" className="block px-2 py-1">
                Newsletter
              </a>
              {/* Login no menu mobile */}
              <a
                href="#login"
                className="block px-2 py-1 flex items-center gap-2"
              >
                <User size={18} className="text-primary" /> Entrar / Cadastrar
              </a>
            </div>
          )}
        </div>
      </div>
      <hr className="w-full border-gray-800 mt-4" />
    </header>
  );
}
