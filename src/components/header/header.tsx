"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/button";
import Link from "next/link";
import { NavLinks } from "../../app/components/nav-link";

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
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
            infoCripto S.i
          </h1>
        </div>

        <NavLinks />

        {/* Hamburger mobile */}
        <div className="md:hidden relative" ref={menuRef}>
          <button className="text-primary" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Menu dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-44 text-foreground bg-background shadow-md rounded-md z-50 p-2 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setIsOpen(false)}
              >
                <a href="#sobre">Dashboard</a>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setIsOpen(false)}
              >
                <a href="#conteudo">Educacional</a>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setIsOpen(false)}
              >
                <a href="#newsletter">Newsletter</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
