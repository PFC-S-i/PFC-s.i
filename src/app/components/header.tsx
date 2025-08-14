"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";

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
      <div className="mx-4 sm:px-6 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          {/* Texto no desktop */}
          <h1 className=" text-xl sm:text-2xl md:text-3xl font-bold text-primary">
            PFC S.i
          </h1>
        </div>

        {/* Links desktop */}
        <nav className="hidden md:flex space-x-6">
          <a href="#sobre" className="hover:text-primary">
            Sobre
          </a>
          <a href="#conteudo" className="hover:text-primary">
            Conteúdo
          </a>
          <a href="#newsletter" className="hover:text-primary">
            Newsletter
          </a>
        </nav>

        {/* Hamburger mobile */}
        <div className="md:hidden relative" ref={menuRef}>
          <button className="text-primary" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Menu dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md z-50">
              <a
                href="#sobre"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                Sobre
              </a>
              <a
                href="#conteudo"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                Conteúdo
              </a>
              <a
                href="#newsletter"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                Newsletter
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
