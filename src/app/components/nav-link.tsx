// components/NavLinks.tsx
import { Button } from "@/components/button";

interface NavLink {
  label: string;
  href: string;
}

const links: NavLink[] = [
  { label: "Dashboard", href: "#sobre" },
  { label: "Educacional", href: "#conteudo" },
  { label: "Newsletter", href: "#newsletter" },
];

export function NavLinks() {
  return (
    <nav className="hidden md:flex space-x-4">
      {links.map(({ label, href }) => (
        <Button key={href} variant="outline">
          <a href={href}>{label}</a>
        </Button>
      ))}
    </nav>
  );
}
