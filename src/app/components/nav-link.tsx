import Link from "next/link";
import { Button } from "@/components/button";
import { usePathname } from "next/navigation";

export interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Educacional", href: "/educational" },
  { label: "Criptomoedas", href: "/criptomoedas" },
  { label: "Notícias", href: "/news" },
  { label: "Simulador", href: "/carteira" },
  { label: "Fórum", href: "/forum" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex space-x-4">
      {NAV_LINKS.map(({ label, href }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link key={href} href={href}>
            <Button variant="icon" aria-current={isActive ? "page" : undefined}>
              {label}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}
