import Link from "next/link";
import { Button } from "@/components/button";

interface NavLink {
  label: string;
  href: string;
}

const links: NavLink[] = [
  { label: "Dashboard", href: "#sobre" },
  { label: "Educacional", href: "#conteudo" },
  { label: "Newsletter", href: "#newsletter" },
  { label: "Notícias", href: "#" },
];

export function NavLinks() {
  return (
    <nav className="hidden md:flex space-x-4">
      {links.map(({ label, href }) => (
        <Link key={href} href={href}>
          <Button variant="icon">{label}</Button>
        </Link>
      ))}
    </nav>
  );
}
